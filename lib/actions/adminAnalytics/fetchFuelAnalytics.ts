'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Chalan from '@/lib/models/chalan.model';
import Compliance from '@/lib/models/compliances.model';
import FuelManagement from '@/lib/models/fuelManagement.model';

const monthNameToNumber = (monthName: string): number => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthIndex = monthNames.indexOf(monthName);
  return monthIndex !== -1 ? monthIndex + 1 : -1; // Months are 1-based
};

const getVehiclesWithHours = async (
  month: string,
  year: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Convert the month name to a number and the year to a number
    const monthNum = monthNameToNumber(month);
    const yearNum = parseInt(year, 10);

    // Validate month and year
    if (monthNum === -1 || isNaN(yearNum)) {
      throw new Error('Invalid month or year');
    }

    // Calculate start and end dates for the given month and year
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    // Query chalans based on the date range, without filtering by vehicle number
    const chalans = await Chalan.find({
      date: { $gte: startDate, $lte: endDate },
    });

    console.log(startDate);
    console.log(endDate);
    console.log(chalans);

    const vehicleData = {};

    chalans.forEach((chalan) => {
      chalan.items.forEach((item) => {
        const vehicleNumber = item.vehicleNumber;
        if (!vehicleData[vehicleNumber]) {
          console.log('hello');
          vehicleData[vehicleNumber] = {
            vehicleNumber,
            totalHours: 0,
            totalCost: 0,
            chalans: [],
            totalFuel: 0,
            fuelCost: 0,
            complianceCost: 0,
          };
        }
        console.log('HII', vehicleData);
        vehicleData[vehicleNumber].chalans.push({
          chalan: chalan.chalanNumber,
          amount: item.itemCosting,
          hours: item.hours,
        });
        vehicleData[vehicleNumber]?.totalHours &&
          (vehicleData[vehicleNumber].totalHours += item.hours);
        vehicleData[vehicleNumber].totalCost &&
          (vehicleData[vehicleNumber].totalCost += item.itemCosting);
      });
    });

    console.log('moonth', month, yearNum);
    console.log('VEHICLE DATA', vehicleData);
    let fuelManagementDocs = await FuelManagement.find({
      month: month,
      year: yearNum,
    });

    console.log('FUEL MANAGEMENT DOCS', fuelManagementDocs);

    if (Object.keys(vehicleData).length > 0)
      fuelManagementDocs.forEach((ele) => {
        vehicleData[ele.vehicleNumber]?.totalFuel &&
          (vehicleData[ele.vehicleNumber].totalFuel += ele.fuel);
        vehicleData[ele.vehicleNumber]?.fuelCost &&
          (vehicleData[ele.vehicleNumber].fuelCost += ele.amount);
      });

    let complianceDocs = await Compliance.find({
      month: month,
      year: yearNum,
    });

    if (Object.keys(vehicleData).length > 0)
      complianceDocs.forEach((ele) => {
        vehicleData[ele.vehicleNumber]?.complianceCost &&
          (vehicleData[ele.vehicleNumber].complianceCost += ele.amount);
      });

    const result = Object.values(vehicleData);

    return {
      success: true,
      status: 200,
      data: JSON.stringify(result),
      error: null,
      message: 'Successfully fetched vehicles with hours',
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      status: 500,
      message: 'Unexpected error occurred, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export default getVehiclesWithHours;

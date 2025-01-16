'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Chalan from '@/lib/models/chalan.model';
import { DepartmentSchema } from '@/lib/models/department.model';
import { EngineerSchema } from '@/lib/models/engineer.model';
import Item from '@/lib/models/item.model';
import mongoose from 'mongoose';

const EngineerModel =
  mongoose.models.Engineer || mongoose.model('Engineer', EngineerSchema);
const DepartmentModel =
  mongoose.models.Department || mongoose.model('Department', DepartmentSchema);

let itemsIdMap = new Map();

const initializeValueInMap = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const allItems = await Item.find({});
    allItems.forEach((item) => {
      // Use ObjectId as the key if required
      itemsIdMap.set(item._id.toString(), item.itemName);
    });
    console.log(itemsIdMap);
    return {
      success: true,
      status: 200,
      message: 'Map Initialized',
      error: null,
      data: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Error occurred while initializing map',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const vehicleReport = async (startDate, endDate): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    await initializeValueInMap();
    console.log(startDate);
    console.log(endDate);

    const [startDay, startMonth, startYear] = startDate.split('-').map(Number);
    const [endDay, endMonth, endYear] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);
    const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59);

    const vehicleReports = await Chalan.find({
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .sort({ date: 1 })
      .populate('engineer', 'name')
      .populate('department', 'departmentName');

    console.log('vehicle report', vehicleReports);
    let arr = [];
    let totalAmount: number = 0;
    let totalGst: number = 0;

    vehicleReports.map((ele) => {
      var itemsList = ele.items;
      itemsList.map((item) => {
        let itemName = '';
        itemName = itemsIdMap.get(item.item.toString());
        console.log(itemName);
        console.log(item);

        arr.push({
          chalanId: ele._id,
          chalanNumber: ele.chalanNumber,
          date: ele.date,
          item: itemName,
          vehicleNumber: item.vehicleNumber,
          hours: item.hours,
          gst: (item.itemCosting * 0.18).toFixed(2),
          total: (item.itemCosting * 1.18).toFixed(2),
          location: ele.location,
          department: ele.department,
          engineer: ele.engineer,
          amount: item.itemCosting.toFixed(2),
        });
        totalAmount += item.itemCosting;
        totalGst += item.itemCosting * 0.18;
      });
    });

    return {
      success: true,
      data: JSON.stringify({
        vehicleReport: arr,
        total: {
          totalAmount: totalAmount.toFixed(2),
          totalGst: totalGst.toFixed(2),
          total: (totalAmount + totalGst).toFixed(2),
        },
      }),
      message: 'Vehicle reports fetched successfully',
      error: null,
      status: 200,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to fetch vehicle report,Please try later',
      status: 500,
      data: null,
      error: JSON.stringify(err),
    };
  }
};

export { vehicleReport };

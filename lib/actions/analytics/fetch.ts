'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Compliance from '@/lib/models/compliances.model';
import Consumable from '@/lib/models/consumables.model';
import FuelManagement from '@/lib/models/fuelManagement.model';
import Wages from '@/lib/models/HR/wages.model';

const fetchAnalytics = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const obj = JSON.parse(dataString);
    let vehicleNumber = obj.vehicleNumber;
    let month = obj.month;
    let year = obj.year;
    let docId = month + year;
    let totalFuelCost = 0;
    let compliancesCost = 0;
    const fuelDocs = await FuelManagement.find({
      vehicleNumber: vehicleNumber,
      DocId: docId,
    });
    fuelDocs.forEach((doc) => {
      if (doc.entry) {
        totalFuelCost += doc.amount;
      } else {
        totalFuelCost -= doc.amount;
      }
    });
    const compliancesDocs = await Compliance.find({
      vehicleNumber: vehicleNumber,
      DocId: docId,
    });
    compliancesDocs.forEach((doc) => {
      compliancesCost += doc.amount;
    });
    const consumablesDocs = await Consumable.find({
      vehicleNumber: vehicleNumber,
      DocId: docId,
    });
    let totalConsumablesCost = 0;
    consumablesDocs.forEach((doc) => {
      totalConsumablesCost += doc.amount;
    });
    let resultObj = {
      fuelCost: totalFuelCost,
      compliancesCost: compliancesCost,
      consumablesCost: totalConsumablesCost,
      totalCost: totalFuelCost + compliancesCost + totalConsumablesCost,
    };
    return {
      success: true,
      message: 'Data Retrieved',
      status: 200,
      data: JSON.stringify(resultObj),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected error occurred, can not fetch analytics now, please try later',
      data: null,
      status: 500,
      error: JSON.stringify(err),
    };
  }
};

// Analytics data for the HR dashboard

const fetchHRAnalytics = async (
  from: string,
  to: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Parse the from and to dates
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Extract year and month
    const fromYear = fromDate.getFullYear();
    const fromMonth = fromDate.getMonth() + 1; // JavaScript months are 0-indexed
    const toYear = toDate.getFullYear();
    const toMonth = toDate.getMonth() + 1;

    // Build the filter
    let filter: Record<string, any>;

    if (fromYear === toYear) {
      // Same year range
      filter = {
        year: fromYear,
        month: { $gte: fromMonth, $lte: toMonth },
      };
    } else {
      // Spanning multiple years
      filter = {
        $or: [
          // From year: months >= fromMonth
          {
            year: fromYear,
            month: { $gte: fromMonth },
          },
          // To year: months <= toMonth
          {
            year: toYear,
            month: { $lte: toMonth },
          },
          // Years in between
          {
            year: { $gt: fromYear, $lt: toYear },
          },
        ],
      };
    }

    console.log('Filter Object:', filter);

    // Fetch data
    const resp = await Wages.find(filter).populate('employee').populate({
      path: 'employee',
    });

    console.log('Response Data:', JSON.stringify(resp, null, 2));
    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Wages',
      data: JSON.stringify(resp.filter((doc) => doc.employee !== null)),
      error: null,
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, can not fetch analytics now, please try later',
      data: null,
      error: JSON.stringify(err),
    };
  }
};

export { fetchAnalytics, fetchHRAnalytics };

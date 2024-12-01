'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import FuelManagement from '@/lib/models/fuelManagement.model';

const fetchFuelManagement = async (
  vehicleNumber: string,
  month: string,
  year: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    let total = 0;
    const docs = await FuelManagement.find({
      vehicleNumber: vehicleNumber,
      DocId: month + year,
    });
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].entry) {
        total += docs[i].amount;
      } else {
        total -= docs[i].amount;
      }
    }
    console.log('The Docs', docs);
    return {
      success: true,
      status: 200,
      message: 'Data Fetched',
      data: JSON.stringify({
        fuelManagement: docs,
        total: total,
      }),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to fetch fuel,Please try again',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { fetchFuelManagement };

'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Fuel from '@/lib/models/fuel.model';
import FuelManagement from '@/lib/models/fuelManagement.model';

const fetchFuelManagement = async (
  vehicleNumber: string | undefined,
  month: string,
  year: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    let total = 0;
    console.log('Vehicle Number', vehicleNumber);

    let docs: any;
    if (!vehicleNumber) {
      docs = await FuelManagement.find({
        DocId: month + year,
      });
    } else {
      docs = await FuelManagement.find({
        vehicleNumber: vehicleNumber,
        DocId: month + year,
      });
    }
    for (let i = 0; i < docs.length; i++) {
      total += docs[i]?.amount;
    }
    
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

const fetchSavedFuelPrices = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;

    const res = await Fuel.find();
    if (!res) {
      return {
        status: 400,
        success: false,
        message: 'Can not fetch fuel prices now, Please try later',
        error: null,
        data: null,
      };
    }
    return {
      status: 200,
      success: true,
      message: 'Fuel Prices fetched successfully',
      error: null,
      data: res,
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message:
        'Unexpected error occurred, Failed to fetch fuel prices, Please try later',
      data: null,
      error: JSON.stringify(error),
    };
  }
};

export { fetchFuelManagement, fetchSavedFuelPrices };

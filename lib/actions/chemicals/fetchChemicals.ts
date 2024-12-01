'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Chemical from '@/lib/models/safetyPanel/chemicals/chemical.model';

const fetchChemicals = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const chemicals = await Chemical.find({});
    return {
      success: true,
      status: 200,
      message: 'List of All Chemicals',
      data: JSON.stringify(chemicals),
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error occurred, Failed to fetch chemicals, Please Try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const fetchChemicalById = async (
  chemicalId: any
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const chemicalData = await Chemical.findOne({
      _id: chemicalId,
    });
    return {
      success: true,
      status: 200,
      message: 'Details of the chemical',
      data: JSON.stringify(chemicalData),
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to fetch Chemicals, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { fetchChemicalById, fetchChemicals };

'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Bank from '@/lib/models/HR/bank.model';
const fetchBanks = async (): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await Bank.find({});
    if (!resp) {
      return {
        status: 400,
        data: null,
        error: null,
        message:
          'Unexpected error occurred, Failed to update photos, Please Try Later',
        success: false,
      };
    }
    return {
      status: 200,
      data: JSON.stringify(resp),
      message: 'Banks fetched successfully',
      error: null,
      success: true,
    };
  } catch (err) {
    return {
      status: 500,
      error: JSON.stringify(err),
      message:
        'Unexpected error occurred, Failed to fetch banks, Please Try Later',
      success: false,
      data: null,
    };
  }
};

export { fetchBanks };

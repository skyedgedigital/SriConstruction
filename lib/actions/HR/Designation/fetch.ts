'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Designation from '@/lib/models/HR/designation.model';

const fetchDesignations = async (): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await Designation.find({});
    if (!resp) {
      return {
        status: 400,
        data: JSON.stringify(resp),
        message:
          'Unexpected error occurred, Failed to fetch designations, Please try later',
        error: null,
        success: false,
      };
    }
    return {
      status: 200,
      data: JSON.stringify(resp),
      message: 'Designations fetched successfully',
      error: null,
      success: true,
    };
  } catch (err) {
    return {
      status: 500,
      error: JSON.stringify(err),
      message:
        'Unexpected error occurred, Failed to fetch designations, Please Try Later',
      data: null,
      success: false,
    };
  }
};

export { fetchDesignations };

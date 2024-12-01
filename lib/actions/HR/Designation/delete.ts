'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Designation from '@/lib/models/HR/designation.model';

const deleteDesignation = async (docId: any): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await Designation.findOneAndDelete({
      _id: docId,
    });
    if (resp) {
      return {
        success: true,
        status: 200,
        message: 'Deleted Successfully',
        data: JSON.stringify(resp),
        error: null,
      };
    } else {
      return {
        success: false,
        status: 404,
        message: 'Fuel Management Not Found',
        data: null,
        error: null,
      };
    }
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to delete Designation, Please Try Later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { deleteDesignation };

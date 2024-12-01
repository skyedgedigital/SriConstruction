'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import FuelManagement from '@/lib/models/fuelManagement.model';

const deleteFuelManagement = async (docId: any): Promise<ApiResponse<any>> => {
  console.log('The Doc Id', docId);
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await FuelManagement.findOneAndDelete({
      _id: docId,
    });
    if (resp) {
      return {
        success: true,
        status: 200,
        message: 'Deleted Successfully',
        data: resp,
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
        'Unexpected error occurred, Failed to update photos, Please Try Later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { deleteFuelManagement };

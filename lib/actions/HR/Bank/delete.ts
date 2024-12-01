'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Bank from '@/lib/models/HR/bank.model';
import { revalidatePath } from 'next/cache';

const deleteBank = async (docId: any): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await Bank.findOneAndDelete({
      _id: docId,
    });
    if (resp) {
      revalidatePath('/hr/bank');
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
        'Unexpected error occurred, Failed to delete bank, Please Try Later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { deleteBank };

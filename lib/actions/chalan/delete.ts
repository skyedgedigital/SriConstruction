'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Chalan from '@/lib/models/chalan.model';
import { error } from 'console';

const deleteChalanbyChalanNumber = async (
  chalanNumber: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const ifExists = await Chalan.findOne({
      chalanNumber: chalanNumber,
    });
    if (!ifExists) {
      return {
        success: false,
        status: 404,
        message: `The Chalan ${chalanNumber} not exists`,
        error: 'Chalan nuber already exists in database',
        data: JSON.stringify(ifExists),
      };
    }
    const res = await Chalan.findOneAndDelete(
      {
        chalanNumber: chalanNumber,
      },
      {
        new: true,
      }
    );
    return {
      success: true,
      message: `Chalan ${chalanNumber} deleted`,
      status: 200,
      data: JSON.stringify(res),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to delete chalan,Please try later',
      status: 500,
      error: err.message || JSON.stringify(err),
      data: null,
    };
  }
};

export { deleteChalanbyChalanNumber };

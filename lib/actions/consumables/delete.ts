'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Consumable from '@/lib/models/consumables.model';

const deleteConsumables = async (
  consumableId: any
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await Consumable.findByIdAndDelete(consumableId);

    return {
      success: true,
      status: 200,
      message: 'Consumable Deleted Successfully',
      data: JSON.stringify(resp),
      error: null,
    };
  } catch (err) {
    return {
      error: JSON.stringify(err),
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to delete Consumables, Please try later',
      data: null,
    };
  }
};

export { deleteConsumables };

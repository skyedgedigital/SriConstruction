'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Consumable from '@/lib/models/consumables.model';

const fetchConsumables = async (
  vehicleNumber: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await Consumable.find({
      vehicleNumber: vehicleNumber,
    });
    console.log(resp);
    return {
      success: true,
      status: 200,
      message: 'Consumable saved',
      data: JSON.stringify(resp),
      error: null,
    };
  } catch (err) {
    return {
      error: JSON.stringify(err),
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to create Compliance, Please try later',
      data: null,
    };
  }
};

export { fetchConsumables };

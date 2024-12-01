'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import DailyUtilisation from '@/lib/models/dailyUtilisation.model';

const createDailyUtilisation = async (
  data: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const obj = new DailyUtilisation(JSON.parse(data));
    const resp = await obj.save();
    return {
      success: true,
      status: 200,
      message: 'Daily Utilisation created successfully',
      data: JSON.stringify(resp),
      error: null,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      status: 500,
      message: 'Error creating Daily Utilisation',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export default createDailyUtilisation;

'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Compliance from '@/lib/models/compliances.model';

const createCompliance = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const dataObj = JSON.parse(dataString);
    const docObj = new Compliance({
      ...dataObj,
    });
    const result = await docObj.save();
    return {
      success: true,
      message: 'Compliance Added',
      status: 200,
      data: JSON.stringify(result),
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to create Compliance, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { createCompliance };

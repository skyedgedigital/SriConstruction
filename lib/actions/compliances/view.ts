'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Compliance from '@/lib/models/compliances.model';

const fetchCompliance = async (
  dataObjString: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const searchObj = JSON.parse(dataObjString);
    const compliance = await Compliance.find(searchObj);
    return {
      success: true,
      message: 'List of Compliances fetched successfully',
      status: 200,
      data: JSON.stringify(compliance),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to fetch Compliance, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { fetchCompliance };

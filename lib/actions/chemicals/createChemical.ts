'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Chemical from '@/lib/models/safetyPanel/chemicals/chemical.model';

const createChemical = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const dataObj = JSON.parse(dataString);
    const docObj = new Chemical({
      ...dataObj,
    });
    const result = await docObj.save();
    return {
      success: true,
      message: 'Chemical Added',
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
        'Unexpected Error Occurred, Failed to create chemical, Try Later',
      error: null,
      data: null,
    };
  }
};

export default createChemical;

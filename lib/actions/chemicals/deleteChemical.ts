'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Chemical from '@/lib/models/safetyPanel/chemicals/chemical.model';

const deleteChemical = async (chemicalId: any): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const result = await Chemical.deleteOne({ _id: chemicalId });
    return {
      success: true,
      message: 'Chemical Deleted',
      status: 200,
      data: '',
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to delete chemical, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export default deleteChemical;

'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Chemical from '@/lib/models/safetyPanel/chemicals/chemical.model';

const updateChemical = async (
  chemicalId: any,
  updateString: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const filter = {
      _id: chemicalId,
    };
    const updateObj = JSON.parse(updateString);
    const updatedChemical = await Chemical.findOneAndUpdate(filter, updateObj, {
      new: true,
    });
    return {
      success: true,
      message: 'Tool updated successfully',
      data: updatedChemical,
      status: 200,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected Error occurred, Failed to update chemical, Please Try later',
      error: JSON.stringify(err),
      status: 500,
      data: null,
    };
  }
};

export { updateChemical };

'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Designation from '@/lib/models/HR/designation.model';

const updateDesignation = async (
  dataString: string,
  docId: any
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    const designation = await Designation.findByIdAndUpdate(docId, data, {
      new: true,
    });
    return {
      success: true,
      status: 200,
      message: 'Designation Updated Successfully',
      data: JSON.stringify(designation),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to update Designation, Please Try Later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { updateDesignation };

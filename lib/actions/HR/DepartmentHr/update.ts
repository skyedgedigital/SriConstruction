'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import DepartmentHr from '@/lib/models/HR/department_hr';
import Designation from '@/lib/models/HR/designation.model';

const updateDepartmentHr = async (
  dataString: string,
  docId: any
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    const designation = await DepartmentHr.findByIdAndUpdate(docId, data, {
      new: true,
    });
    return {
      success: true,
      status: 200,
      message: 'DepartmentHr Updated Successfully',
      data: JSON.stringify(designation),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to update Department, Please Try Later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { updateDepartmentHr };

'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import DepartmentHr from '@/lib/models/HR/department_hr';

const createDepartmentHr = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const dataObj = JSON.parse(dataString);
    const Obj = new DepartmentHr({ ...dataObj });
    const resp = await Obj.save();
    if (!resp) {
      return {
        status: 400,
        success: false,
        message: 'Failed to create Department',
        error: JSON.stringify(resp),
        data: null,
      };
    }
    return {
      success: true,
      status: 200,
      data: JSON.stringify(resp),
      message: 'Entry Added',
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to update Damage Register, Please Try Later',
      error: JSON.stringify(err),
      status: 500,
      data: null,
    };
  }
};

export { createDepartmentHr };

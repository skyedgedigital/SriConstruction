'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import DepartmentHr from '@/lib/models/HR/department_hr';

const fetchDepartmentHr = async (): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await DepartmentHr.find({});
    if (!resp) {
      return {
        status: 400,
        data: JSON.stringify(resp),
        message: 'Failed to fetch DepartmentsHr, Please try later',
        success: true,
        error: null,
      };
    }
    return {
      status: 200,
      data: JSON.stringify(resp),
      message: 'DepartmentsHr fetched successfully',
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      status: 500,
      error: JSON.stringify(err),
      message:
        'Unexpected error occurred, Failed to update Damage Register, Please Try Later',
      success: false,
      data: null,
    };
  }
};

export { fetchDepartmentHr };

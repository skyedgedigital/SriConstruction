'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Department from '@/lib/models/department.model';

const fetchAllDepartments = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const result = await Department.find({});
    const sortedResp = result?.sort((a, b) =>
      a.departmentName.localeCompare(b.departmentName)
    );

    return {
      success: true,
      status: 200,
      message: 'List of All Departments',
      data: JSON.stringify(sortedResp),
      error: null,
    };
  } catch (err) {
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

export { fetchAllDepartments };

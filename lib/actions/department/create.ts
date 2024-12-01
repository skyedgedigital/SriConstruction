'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Department from '@/lib/models/department.model';

const createDepartment = async (
  departmentName: any
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const ifExists = await Department.findOne({
      departmentName: departmentName,
    });
    console.log(ifExists);
    if (ifExists) {
      return {
        success: false,
        message: `Department ${departmentName} already Exists`,
        status: 400,
        error: null,
        data: ifExists,
      };
    }
    const obj = new Department({
      departmentName: departmentName,
    });
    const result = await obj.save();
    return {
      success: true,
      status: 200,
      message: `Department ${departmentName} added`,
      data: result,
      error: null,
    };
  } catch (err) {
    return {
      success: true,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to create Department, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { createDepartment };

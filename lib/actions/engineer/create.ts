'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Department from '@/lib/models/department.model';
import Engineer from '@/lib/models/engineer.model';
import { revalidatePath } from 'next/cache';
const createEngineer = async (
  engineerName: string,
  departmentName: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const departmentExists = await Department.findOne({
      departmentName: departmentName,
    });
    if (!departmentExists) {
      return {
        success: false,
        status: 404,
        message: `Department with name ${departmentName} not found`,
        error: null,
        data: null,
      };
    }
    const departmentId = departmentExists._id;
    const ifEngineerExists = await Engineer.findOne({
      department: departmentId,
      name: engineerName,
    });
    if (ifEngineerExists) {
      return {
        success: false,
        status: 400,
        message: `Engineer ${engineerName} already associated with ${departmentName}`,
        data: null,
        error: null,
      };
    }
    const obj = new Engineer({
      name: engineerName,
      department: departmentId,
    });
    const resp = await obj.save();
    revalidatePath('/admin/engineers');
    return {
      success: true,
      message: `Engineer ${engineerName} added for department ${departmentName}`,
      status: 201,
      data: resp,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to create Engineer, Please Try Later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { createEngineer };

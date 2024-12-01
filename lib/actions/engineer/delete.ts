'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Department from '@/lib/models/department.model';
import Engineer from '@/lib/models/engineer.model';
import { revalidatePath } from 'next/cache';
const deleteEngineer = async (
  engineerName: string,
  departmentName: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const DepartmentDoc = await Department.findOne({
      departmentName: departmentName,
    });
    if (!DepartmentDoc) {
      return {
        success: false,
        status: 404,
        message: `Department ${departmentName} not Found`,
        data: null,
        error: null,
      };
    }
    const departmentId = DepartmentDoc._id;
    await Engineer.findOneAndDelete({
      name: engineerName,
      department: departmentId,
    });
    revalidatePath('/admin/engineers');

    return {
      success: true,
      status: 201,
      message: `Engineer ${engineerName} associated with ${departmentName} deleted`,
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected Error Occurred,Failed to delete Engineer, Please Try Later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { deleteEngineer };

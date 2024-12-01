'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Department from '@/lib/models/department.model';
import { revalidatePath } from 'next/cache';

const deleteDepartment = async (
  departmentName: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const ifExists = await Department.findOne({
      departmentName: departmentName,
    });
    if (!ifExists) {
      return {
        success: false,
        status: 404,
        message: 'Department Name not Found',
        data: JSON.stringify(ifExists),
        error: null,
      };
    }
    const res = await Department.findOneAndDelete(
      {
        departmentName: departmentName,
      },
      { new: true }
    );
    revalidatePath('/admin/drivers');

    return {
      success: true,
      message: `Department ${departmentName} deleted`,
      status: 201,
      data: JSON.stringify(res),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred,Failed to Delete Department, Please Try Later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};
export { deleteDepartment };

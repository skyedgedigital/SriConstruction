'use server';
import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Employee from '@/lib/models/employee.model';
import { employee } from '@/types/employee.type';
import { revalidatePath } from 'next/cache';

const deleteEmployee = async (
  employeeInfo: employee
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    var employee = await Employee.deleteOne(employeeInfo);
    revalidatePath('/admin/employees');

    return {
      success: true,
      status: 201,
      message: 'Employee deleted sucessfully',
      error: null,
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred,Failed to delete Employee, Please Try Later',
      error: JSON.stringify(error),
      data: null,
    };
  }
};

export { deleteEmployee };

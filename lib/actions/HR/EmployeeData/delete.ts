'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';

const deleteEmployeeData = async (docId: any): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await EmployeeData.findOneAndDelete({
      _id: docId,
    });
    return {
      success: true,
      status: 200,
      message: 'Employee Data Deleted Successfully',
      error: null,
      data: JSON.stringify(resp),
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to update Employee Data, Please Try Later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { deleteEmployeeData };

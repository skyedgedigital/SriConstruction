'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';

const autoGenEmpCode = async (): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const listOfEmps = await EmployeeData.find({});
    let maxVal = 1;
    listOfEmps.forEach((element) => {
      let tmp: number = Number(element.code);
      if (tmp > maxVal) {
        maxVal = tmp;
      }
    });
    return {
      success: true,
      status: 200,
      data: maxVal + 1,
      error: null,
      message: 'Employee code generated successfully',
    };
  } catch (err) {
    return {
      status: 500,
      success: false,
      message:
        'Unexpected error occurred, Failed to generate Employee Code, Please Try Later',
      data: null,
      error: JSON.stringify(err),
    };
  }
};

export { autoGenEmpCode };

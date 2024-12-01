'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getNotification = async (): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const empDateMap = new Map<string, Date>();
    const emps = await EmployeeData.find({});
    let arr = [];
    const today = new Date();
    const daysLimit = 60 * 24 * 60 * 60 * 1000;
    emps.forEach((element) => {
      let parsedDate = parseDate(element.gatePassValidTill);
      if (
        parsedDate >= today &&
        parsedDate.getTime() <= today.getTime() + daysLimit
      ) {
        arr.push({
          empId: element._id,
          empName: element.name,
          empCode: element.code,
          gatePassValidTill: element.gatePassValidTill,
        });
      }
    });
    console.log(arr);
    return {
      success: true,
      data: JSON.stringify({ arr, totalCount: arr.length }),
      status: 200,
      error: null,
      message: 'success ',
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to get notification,Please try later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { getNotification };

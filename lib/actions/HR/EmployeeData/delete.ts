'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Attendance from '@/lib/models/HR/attendance.model';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';
import Wages from '@/lib/models/HR/wages.model';

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

const deleteWorkorderFromEmployeeData = async (
  workOrderHr_Id: string,
  employee_Id: string,
  month: number,
  year: number
) => {
  if (!workOrderHr_Id || !employee_Id || !month || !year) {
    return {
      success: false,
      status: 404,
      message: 'Insufficient data for deletion',
      error: null,
      data: null,
    };
  }
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  // console.log(workOrderHr_Id, employee_Id, month, year);
  const period = `${month}-${year}`;
  try {
    const employeeExist = await EmployeeData.findOne({ _id: employee_Id });
    if (!employeeExist) {
      return {
        success: false,
        status: 404,
        message: 'Employee Not Found',
        error: null,
        data: null,
      };
    }
    const attendanceResponse = await Attendance.findOneAndDelete({
      year,
      month,
      workOrderHr: workOrderHr_Id,
    });
    // console.log('ATTENDANCE DELETE RESPONSE', attendanceResponse);

    const wagesExist = await Wages.findOne({
      workOrderHr: workOrderHr_Id,
      month,
      year,
    });
    console.log(wagesExist);
    // console.log(employeeExist.workOrderHr);
    // console.log(
    //   employeeExist.workOrderHr[0].workOrderHr.toString() === workOrderHr_Id
    // );
    // console.log(employeeExist.workOrderHr[0].period === period);
    // console.log(period);
    const workOrderHrExist = employeeExist.workOrderHr.find(
      (item) =>
        item.workOrderHr.toString() === workOrderHr_Id && item.period === period
    );
    // console.log('workOrderHrExist-------------------', workOrderHrExist);
    if (!workOrderHrExist) {
      return {
        success: false,
        status: 404,
        message: `${workOrderHr_Id} does not exist`,
        error: null,
        data: null,
      };
    }
    employeeExist.workOrderHr = employeeExist.workOrderHr.filter(
      (item) =>
        item.workOrderHr.toString() !== workOrderHr_Id || item.period !== period
    );
    // console.log(
    //   'updated-workORDERHRRRRRRR---------',
    //   employeeExist.workOrderHr
    // );
    const updated_employee = await employeeExist.save();
    if (wagesExist) {
      await Wages.deleteOne({ _id: wagesExist._id });
    }
    // console.log(updated_employee);
    if (updated_employee) {
      return {
        success: true,
        status: 204,
        message: `${workOrderHr_Id} deleted successfully`,
        data: null,
        error: null,
      };
    }
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { deleteEmployeeData, deleteWorkorderFromEmployeeData };

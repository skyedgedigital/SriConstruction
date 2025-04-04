'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Attendance from '@/lib/models/HR/attendance.model';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';
import Wages from '@/lib/models/HR/wages.model';
import mongoose from 'mongoose';

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

  const session = await mongoose.startSession();
  session.startTransaction();
  // console.log(workOrderHr_Id, employee_Id, month, year);
  const period = `${month}-${year}`;
  try {
    const employeeExist = await EmployeeData.findOne(
      { _id: employee_Id },
      null,
      { session }
    );
    if (!employeeExist) {
      return {
        success: false,
        status: 404,
        message: 'Employee Not Found',
        error: null,
        data: null,
      };
    }

    // 1. If attendance does not exist, which means there is no benefit of going further, wages should not exist, workorderHr array should not have the element in the employeedatas field, this is the default behavior
    const attendanceExist = await Attendance.findOne({
      year,
      month,
      workOrderHr: workOrderHr_Id,
    }).session(session);

    if (!attendanceExist) {
      return {
        success: false,
        status: 404,
        message: 'Attendance not found',
        error: null,
        data: null,
      };
    }

    const attendanceResponse = await Attendance.deleteOne({
      year,
      month,
      workOrderHr: workOrderHr_Id,
    }).session(session);
    // console.log('ATTENDANCE DELETE RESPONSE', attendanceResponse);

    const wagesExist = await Wages.findOne({
      workOrderHr: workOrderHr_Id,
      month,
      year,
    }).session(session);
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

    //2. this should not happen, we should not return it.
    // REASON - if this step comes, we know for sure that attendance is not there, so if attendance is not there then it should not matter whether workOrderHrExist is undefined / defined, if it is defined(which means it exist) it will get deleted in the next step, if it is undefined, it mean it is already deleted, so in both the cases the workOrderHrExist is getting deleted, so we should not 'return'
    //PREVIOUS CODE
    // if (!workOrderHrExist) {
    //   return {
    //     success: false,
    //     status: 404,
    //     message: `${workOrderHr_Id} does not exist`,
    //     error: null,
    //     data: null,
    //   };
    // }
    //NEW CODE
    if (workOrderHrExist) {
      employeeExist.workOrderHr = employeeExist.workOrderHr.filter(
        (item) =>
          item.workOrderHr.toString() !== workOrderHr_Id ||
          item.period !== period
      );
      const updated_employee = await employeeExist.save({ session });
      if (!updated_employee) {
        throw new Error("Couldn't save employee");
      }
    }
    // console.log(
    //   'updated-workORDERHRRRRRRR---------',
    //   employeeExist.workOrderHr
    // );
    if (wagesExist) {
      await Wages.deleteOne({ _id: wagesExist._id }).session(session);
    }
    await session.commitTransaction();
    return {
      success: true,
      status: 204,
      message: `${workOrderHr_Id} deleted successfully`,
      data: null,
      error: null,
    };
  } catch (err) {
    await session.abortTransaction();
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
      error: JSON.stringify(err),
      data: null,
    };
  } finally {
    await session.endSession();
  }
};

export { deleteEmployeeData, deleteWorkorderFromEmployeeData };

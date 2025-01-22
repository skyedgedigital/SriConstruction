'use server';

import Attendance from '@/lib/models/HR/attendance.model';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';
import { EmployeeDataSchema } from '@/lib/models/HR/EmployeeData.model';
import mongoose from 'mongoose';
import { WorkOrderHrSchema } from '@/lib/models/HR/workOrderHr.model';
import { DesignationSchema } from '@/lib/models/HR/designation.model';
import handleDBConnection from '@/lib/database';
import { ApiResponse } from '@/interfaces/APIresponses.interface';
import { ILeavesCount } from '@/interfaces/HR/attendances.interface';

const EmployeeDataModel =
  mongoose.models.EmployeeData ||
  mongoose.model('EmployeeData', EmployeeDataSchema);
const WorkOrderHrModel =
  mongoose.models.WorkOrderHr ||
  mongoose.model('WorkOrderHr', WorkOrderHrSchema);
const designationModel =
  mongoose.models.Designation ||
  mongoose.model('Designation', DesignationSchema);

function getSundays(month: number, year: number) {
  console.log('Year', year);
  console.log('Month', month);
  let sundays = [];
  let date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    if (date.getDay() === 0) {
      console.log('Got Hit');
      sundays.push(date.getDate());
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
}

const fetchAttendance = async (filter: string): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const searchFilter = JSON.parse(filter);
    if (searchFilter?.workOrderHr === 'Default') {
      const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
      };

      // Generate the days array based on the month and year
      const daysInMonth = getDaysInMonth(searchFilter.year, searchFilter.month);
      const daysArray = Array.from({ length: daysInMonth }, (_, index) => ({
        day: index + 1,
        status: 'Present',
      }));

      let sundays = getSundays(searchFilter.month, searchFilter.year);
      console.log('The Sundays ', sundays);

      for (let i = 0; i < sundays.length; i++) {
        console.log(daysArray[sundays[i] - 1]);
        daysArray[sundays[i] - 1].status = 'Not Paid';
      }

      // Create a new attendance with the generated days array
      const newAttendance = new Attendance({
        employee: searchFilter.employee,
        year: searchFilter.year,
        month: searchFilter.month,
        days: daysArray, // Assign the generated days array here
      });
      // console.log('NEW ATTENDANCE', newAttendance);

      // Save the newly created attendance
      // NOT SAVING PURPOSELY
      // await newAttendance.save();
      return {
        success: true,
        message: 'Attendance fetched successfully.',
        data: JSON.stringify(newAttendance),
        status: 200,
        error: null,
      };
    } else {
      const resp = await Attendance.findOne(searchFilter).populate(
        'workOrderHr'
      );
      // console.log('Existing attendance found:', resp);
      return {
        success: true,
        status: 200,
        message: 'Existing attendance found.',
        data: JSON.stringify(resp),
        error: null,
      };
    }
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: 'Unexpected Error Occurred,Failed to fetch attendance.',
      data: null,
      status: 500,
      error: JSON.stringify(err.message),
    };
  }
};

const fetchAllAttendance = async (filter: string) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const searchFilter = JSON.parse(filter);
    console.log(searchFilter);
    if (searchFilter?.workOrderHr === 'Default') {
      delete searchFilter.workOrderHr;
    }
    // console.log(
    //   '-----------------------------------------------------------------------'
    // );
    // console.log(searchFilter);
    // console.log(
    //   '------------------------------------------------------------------------------'
    // );

    const resp = await Attendance.find(searchFilter)
      .populate('employee')
      .populate({
        path: 'employee',
        populate: {
          path: 'designation',
          model: 'Designation',
        },
      });

    // console.log('yera dfghjksj', resp);
    return {
      success: true,
      message: 'All attendance fetched successfully.',
      data: JSON.stringify(resp),
      status: 200,
      error: null,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: 'Failed to fetch all attendance.',
      data: null,
      status: 500,
      error: JSON.stringify(err.message),
    };
  }
};

const fetchAllDepAttendance = async (
  filter: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // console.log('aatogayayayya');

    const searchFilter = JSON.parse(filter);
    // console.log(searchFilter);
    const { year, month, workOrder } = searchFilter; // Destructuring to extract year, month, and workOrder

    // Create the base filter with year and month
    const newFilter: Record<string, any> = { year, month };

    // Retrieve employees based on workOrderHr filter
    let employeeIds: mongoose.Types.ObjectId[] = [];

    if (workOrder !== 'Default') {
      const period = `${month}-${year}`; // Format: 'mm-yyyy'

      // Find employees who have the specified workOrder in workOrderHr with the matching period
      const employeesWithWorkOrder = await EmployeeData.find({
        workOrderHr: {
          $elemMatch: {
            workOrderHr: workOrder,
            period: period, // Ensure period matches 'mm-yyyy' format for the given month and year
          },
        },
      });

      // Extract the employee IDs
      employeeIds = employeesWithWorkOrder.map((emp) => emp._id);

      // Add employee IDs to filter
      newFilter.employee = { $in: employeeIds };
    }

    // console.log('Attendance filter criteria:', newFilter);

    const resp = await Attendance.find(newFilter)
      .populate('employee')
      .populate({
        path: 'employee',
        populate: {
          path: 'designation',
          model: 'Designation',
        },
      });

    // console.log('yera dfghjksj', resp);
    return {
      success: true,
      message: 'Department attendance fetched successfully.',
      data: JSON.stringify(resp),
      status: 200,
      error: null,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: 'Failed to fetch department attendance.',
      data: null,
      status: 500,
      error: JSON.stringify(err.message),
    };
  }
};

const fetchStatus = async (filter: string): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const searchFilter = JSON.parse(filter);
    const resp = await Attendance.findOne(searchFilter);
    const daysArray = resp.days;
    let obj = {
      Present: 0,
      Absent: 0,
      Leave: 0,
      Off: 0,
    };
    daysArray.forEach((ele: any) => {
      if (ele.status == 'Present') {
        obj['Present'] = obj['Present'] + 1;
      } else if (ele.status == 'Absent') {
        obj['Absent'] = obj['Absent'] + 1;
      }
      // else if (ele.status == 'Leave') {
      //   obj['Leave'] = obj['Leave'] + 1;
      // }
      else if (ele.status == 'Off') {
        obj['Off'] = obj['Off'] + 1;
      } else if (ele.status == 'NH') {
        obj['Present'] = obj['Present'] + 1;
      } else if (ele.status == 'Half Day') {
        obj['Present'] = obj['Present'] + 0.5;
      } else if (ele.status == 'Casual Leave') {
        obj['Present'] = obj['Present'] + 1;
      } else if (ele.status == 'Festival Leave') {
        obj['Present'] = obj['Present'] + 1;
      } else if (ele.status == 'Earned Leave') {
        obj['Present'] = obj['Present'] + 1;
      }
    });
    return {
      success: true,
      message: 'Attendance status fetched successfully.',
      data: JSON.stringify(obj),
      status: 200,
      error: null,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: 'Failed to fetch attendance status.',
      data: null,
      status: 500,
      error: JSON.stringify(err),
    };
  }
};

const fetchYearlyLeavesAndPresentCounts = async (
  filter: any
): Promise<ILeavesCount> => {
  const doc = await Attendance.find(filter).select(
    'presentDays earnedLeaves casualLeaves festivalLeaves'
  );
  if (!doc) {
  }
  const yearlyLeavesCount: ILeavesCount = {
    presentDaysCount: 0,
    earnedLeaveDaysCount: 0,
    casualLeaveDaysCount: 0,
    festivalLeaveDaysCount: 0,
  };

  doc?.forEach((attDoc) => {
    attDoc?.presentDays &&
      (yearlyLeavesCount.presentDaysCount += attDoc?.presentDays);
    attDoc?.earnedLeaves &&
      (yearlyLeavesCount.earnedLeaveDaysCount += attDoc?.earnedLeaves);
    attDoc?.casualLeaves &&
      (yearlyLeavesCount.casualLeaveDaysCount += attDoc?.casualLeaves);
    attDoc?.festivalLeaves &&
      (yearlyLeavesCount.festivalLeaveDaysCount += attDoc?.festivalLeaves);
  });

  // console.log(
  //   'casualLeaveDaysCount earnedLeaveDaysCount festivalLeaveDaysCount presentDaysCount',
  //   yearlyLeavesCount.casualLeaveDaysCount,
  //   yearlyLeavesCount.earnedLeaveDaysCount,
  //   yearlyLeavesCount.festivalLeaveDaysCount,
  //   yearlyLeavesCount.presentDaysCount
  // );
  return yearlyLeavesCount;
};

export {
  fetchAttendance,
  fetchStatus,
  fetchAllAttendance,
  fetchAllDepAttendance,
  fetchYearlyLeavesAndPresentCounts,
};

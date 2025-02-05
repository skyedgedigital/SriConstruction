'use server';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import { ILeavesCount } from '@/interfaces/HR/attendances.interface';
import handleDBConnection from '@/lib/database';
import Attendance from '@/lib/models/HR/attendance.model';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';
import WorkOrderHr from '@/lib/models/HR/workOrderHr.model';
import attendanceAction from './attendanceAction';

/**
 * Count monthly leaves and present days from the attendance array.
 */
const countLeavesMonthly = (
  attendanceArray: {
    day: number;
    status:
      | 'Present'
      | 'Absent'
      | 'Leave'
      | 'Half Day'
      | 'NH'
      | 'Not Paid'
      | 'Earned Leave'
      | 'Casual Leave'
      | 'Festival Leave';
  }[]
): ILeavesCount => {
  const counts: ILeavesCount = {
    presentDaysCount: 0,
    earnedLeaveDaysCount: 0,
    casualLeaveDaysCount: 0,
    festivalLeaveDaysCount: 0,
  };

  attendanceArray.forEach((day) => {
    switch (day.status) {
      case 'Present':
      case 'NH':
        counts.presentDaysCount++;
        break;
      case 'Half Day':
        counts.presentDaysCount += 0.5;
        break;
      case 'Earned Leave':
        counts.earnedLeaveDaysCount++;
        counts.presentDaysCount++;
        break;
      case 'Casual Leave':
        counts.casualLeaveDaysCount++;
        counts.presentDaysCount++;
        break;
      case 'Festival Leave':
        counts.festivalLeaveDaysCount++;
        counts.presentDaysCount++;
        break;
      // Optionally handle other statuses here...
      default:
        break;
    }
  });

  return counts;
};

/**
 * Count yearly leaves (excluding the current month) by delegating to an external fetch action.
 */
const countYearlyLeavesExcludingMonth = async (
  filterData: any
): Promise<ILeavesCount> => {
  const filter = {
    year: filterData.year,
    employee: filterData.employee,
    month: { $ne: filterData.month },
  };
  return attendanceAction.FETCH.fetchYearlyLeavesAndPresentCounts(filter);
};

/**
 * Return an array of Sunday dates for a given month.
 */
function getSundays(year: number, month: number): number[] {
  const sundays: number[] = [];
  // JavaScript months are 0-indexed so adjust accordingly.
  const jsMonth = month - 1;
  let date = new Date(year, jsMonth, 1);
  while (date.getMonth() === jsMonth) {
    if (date.getDay() === 0) {
      sundays.push(date.getDate());
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
}

/**
 * Update the employee's work order attendance record for a given period.
 */
const updateEmployeeWorkOrderRecord = async (
  employeeId: string,
  period: string,
  workOrder: string,
  presentDaysCount: number,
  session: mongoose.ClientSession
): Promise<void> => {
  // Try to update an existing period record.
  // const updateResult = await EmployeeData.updateOne(
  //   {
  //     _id: employeeId,
  //     'workOrderHr.period': period,
  //     'workOrderHr.workOrderHr': workOrder,
  //   },
  //   {
  //     $set: { 'workOrderHr.$[elem].workOrderAtten': presentDaysCount },
  //   },
  //   {
  //     session,
  //     arrayFilters: [{ 'elem.period': period, 'elem.workOrderHr': workOrder }],
  //   }
  // );

  // console.log(updateResult.modifiedCount, 'DANKU_______________');

  // // If no document was modified, add a new period record.
  // if (updateResult.modifiedCount === 0) {
  //   const TEST = await EmployeeData.updateOne(
  //     { _id: employeeId },
  //     {
  //       $addToSet: {
  //         workOrderHr: {
  //           period,
  //           workOrderHr: workOrder,
  //           workOrderAtten: presentDaysCount,
  //         },
  //       },
  //     },
  //     { session }
  //   );
  //   console.log('TEST__________', TEST.modifiedCount);
  // }

  const updateResult = await EmployeeData.updateOne(
    {
      _id: employeeId,
      'workOrderHr.period': period,
      'workOrderHr.workOrderHr': workOrder,
    },
    {
      $set: { 'workOrderHr.$[elem].workOrderAtten': presentDaysCount },
    },
    {
      session,
      arrayFilters: [{ 'elem.period': period, 'elem.workOrderHr': workOrder }],
    }
  );

  console.log(updateResult.modifiedCount, 'DANKU_______________');

  // If no document was modified, check if the entry already exists
  if (updateResult.modifiedCount === 0) {
    const existingRecord = await EmployeeData.findOne(
      {
        _id: employeeId,
        'workOrderHr.period': period,
        'workOrderHr.workOrderHr': workOrder,
      },
      null,
      { session }
    );

    // If no matching entry exists, add it
    if (!existingRecord) {
      const TEST = await EmployeeData.updateOne(
        { _id: employeeId },
        {
          $push: {
            workOrderHr: {
              period,
              workOrderHr: workOrder,
              workOrderAtten: presentDaysCount,
            },
          },
        },
        { session }
      );
      console.log('TEST__________', TEST.modifiedCount);
    }
  }
};

/**
 * Main function to update or create attendance.
 */
const putAttendance = async (
  dataString: string,
  filterString: string
): Promise<ApiResponse<any>> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Connect to DB.
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;

    // Parse input data.
    const data = JSON.parse(dataString);
    const filterData = JSON.parse(filterString);
    const attendanceArray = data.arr;
    const workOrder = data.workOrder;
    filterData.workOrderHr = workOrder;

    // Fetch employee document (instead of using .exists so that we can update later).
    const employee = await EmployeeData.findById(filterData.employee).session(
      session
    );
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Validate work order existence.
    const workOrderExists = await WorkOrderHr.exists({
      _id: workOrder,
    }).session(session);
    if (!workOrderExists) {
      throw new Error('Work order not found for this employee');
    }

    // Compute leave counts.
    const {
      presentDaysCount,
      casualLeaveDaysCount,
      earnedLeaveDaysCount,
      festivalLeaveDaysCount,
    } = countLeavesMonthly(attendanceArray);

    const yearlyCounts = await countYearlyLeavesExcludingMonth(filterData);

    // Check leave constraints.
    if (casualLeaveDaysCount + yearlyCounts.casualLeaveDaysCount > 7) {
      throw new Error(
        `Cannot provide more than 7 yearly casual leaves per employee. Exceeding ${
          casualLeaveDaysCount + yearlyCounts.casualLeaveDaysCount - 7
        } casual leave(s).`
      );
    }
    if (festivalLeaveDaysCount + yearlyCounts.festivalLeaveDaysCount > 4) {
      throw new Error(
        `Cannot provide more than 4 yearly festival leaves per employee. Exceeding ${
          festivalLeaveDaysCount + yearlyCounts.festivalLeaveDaysCount - 4
        } festival leave(s).`
      );
    }
    if (earnedLeaveDaysCount + yearlyCounts.earnedLeaveDaysCount > 15) {
      throw new Error(
        `Cannot provide more than 15 yearly earned leaves per employee. Exceeding ${
          earnedLeaveDaysCount + yearlyCounts.earnedLeaveDaysCount - 15
        } earned leave(s).`
      );
    }

    // Look for existing attendance document.
    const attendanceFilter = {
      employee: filterData.employee,
      year: filterData.year,
      month: filterData.month,
      workOrderHr: workOrder,
    };
    let attendanceDoc = await Attendance.findOne(attendanceFilter).session(
      session
    );

    if (attendanceDoc) {
      const currentAttendanceInDB = attendanceDoc.days;
      console.log('H----------------------------H', attendanceDoc.docs);
      attendanceArray.forEach((ele: any) => {
        const givenDay = ele.day;
        const newStatus = ele.status;
        const existing = currentAttendanceInDB.find(
          (ele) => ele.day === givenDay
        );
        if (existing) {
          existing.status = newStatus;
        } else {
          currentAttendanceInDB.push(ele);
        }
      });

      // Prepare update data.
      const updateData = {
        days: currentAttendanceInDB,
        earnedLeaves: earnedLeaveDaysCount,
        festivalLeaves: festivalLeaveDaysCount,
        presentDays: presentDaysCount,
        casualLeaves: casualLeaveDaysCount,
      };

      attendanceDoc = await Attendance.findOneAndUpdate(
        attendanceFilter,
        updateData,
        {
          new: true,
          session,
        }
      );
    } else {
      console.log('BHOOOOOOOOOOOOT');
      // If creating a new attendance document, mark Sundays as 'Not Paid'.
      const sundays = getSundays(filterData.year, filterData.month);
      sundays.forEach((sunday) => {
        // Replace the entry for the Sunday if it exists; otherwise, set it.
        attendanceArray[sunday - 1] = { day: sunday, status: 'Not Paid' };
      });

      // Create new attendance document.
      attendanceDoc = new Attendance({
        employee: filterData.employee,
        year: filterData.year,
        month: filterData.month,
        days: attendanceArray,
        workOrderHr: workOrder,
        earnedLeaves: earnedLeaveDaysCount,
        festivalLeaves: festivalLeaveDaysCount,
        presentDays: presentDaysCount,
        casualLeaves: casualLeaveDaysCount,
      });
      await attendanceDoc.save({ session });
    }

    // Update the employee's work order attendance record.
    const period = `${filterData.month}-${filterData.year}`.trim();
    await updateEmployeeWorkOrderRecord(
      filterData.employee,
      period,
      workOrder,
      presentDaysCount,
      session
    );

    await session.commitTransaction();
    revalidatePath('/hr/CLM');

    return {
      success: true,
      status: 200,
      message: 'Attendance Saved',
      data: JSON.stringify(attendanceDoc),
      error: null,
    };
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    return {
      success: false,
      status: 500,
      message: 'Unexpected error occurred, failed to save attendance',
      error: JSON.stringify(err),
      data: null,
    };
  } finally {
    session.endSession();
  }
};

export { putAttendance };

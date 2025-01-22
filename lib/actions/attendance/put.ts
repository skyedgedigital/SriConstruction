'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import { ILeavesCount } from '@/interfaces/HR/attendances.interface';
import handleDBConnection from '@/lib/database';
import Attendance from '@/lib/models/HR/attendance.model';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';
import WorkOrderHr from '@/lib/models/HR/workOrderHr.model';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import attendanceAction from './attendanceAction';

const countLeavesMonthly = (
  attendanceArrayFromFrontend: {
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
  }[],
  _id?: string
): ILeavesCount => {
  const leavesCount: ILeavesCount = {
    presentDaysCount: 0,
    earnedLeaveDaysCount: 0,
    casualLeaveDaysCount: 0,
    festivalLeaveDaysCount: 0,
  };
  attendanceArrayFromFrontend.forEach((day) => {
    if (day.status === 'Present') {
      leavesCount.presentDaysCount++;
    } else if (day.status === 'NH') {
      leavesCount.presentDaysCount++;
    } else if (day.status === 'Half Day') {
      leavesCount.presentDaysCount += 0.5;
    } else if (day.status === 'Earned Leave') {
      leavesCount.earnedLeaveDaysCount++;
      leavesCount.presentDaysCount++;
    } else if (day.status === 'Casual Leave') {
      leavesCount.casualLeaveDaysCount++;
      leavesCount.presentDaysCount++;
    } else if (day.status === 'Festival Leave') {
      leavesCount.festivalLeaveDaysCount++;
      leavesCount.presentDaysCount++;
    }
  });
  return leavesCount;
};

const countLeavesYearlyExcludingRequestedMonth = async (
  filterData: any
): Promise<ILeavesCount> => {
  const leavesCountFilter = {
    year: filterData?.year,
    employee: filterData?.employee,
    month: { $ne: filterData?.month },
    // excluding leaves count for the month save attendance is requested for because new
    // updated leaves count for current month is already been sent from front end and added while comparing
  };
  return attendanceAction.FETCH.fetchYearlyLeavesAndPresentCounts(
    leavesCountFilter
  );
};

function getSundays(year: number, month: number) {
  let sundays = [];
  month = month - 1;
  let date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === 0) {
      sundays.push(date.getDate());
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
}

const putAttendance = async (
  dataString: string,
  filter: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    // console.log('yere month', data);
    const attendanceArrayFromFrontend = data.arr;
    // this is workorder ID
    const workOrder = data.workOrder;
    const filterData = JSON.parse(filter);
    filterData.workOrderHr = workOrder;
    console.log('yere filterss', filterData);
    // yere filterss {
    //   employee: '66e2bf4a813d9a173cba195b',
    //   year: 2025,
    //   month: 1,
    //   workOrderHr: '66abb55f9dc2f6215a1cd50f'
    // }
    // this is employeeID receiving
    const emp = filterData.employee;
    // console.log('emp to shi hai boss', emp);

    const {
      presentDaysCount,
      casualLeaveDaysCount,
      earnedLeaveDaysCount,
      festivalLeaveDaysCount,
    } = countLeavesMonthly(attendanceArrayFromFrontend);

    const {
      presentDaysCount: yearlyPresentDaysCount,
      casualLeaveDaysCount: yearlyCasualLeaveDaysCount,
      earnedLeaveDaysCount: yearlyEarnedLeaveDaysCount,
      festivalLeaveDaysCount: yearlyFestivalLeaveDaysCount,
    } = await countLeavesYearlyExcludingRequestedMonth(filterData);

    //CHECKING LEAVE CONSTRAINTS

    if (casualLeaveDaysCount + yearlyCasualLeaveDaysCount > 7) {
      return {
        data: null,
        error: null,
        message: `Can not provide more than 7 yearly casual leaves per employee. Exceeding ${
          yearlyCasualLeaveDaysCount + casualLeaveDaysCount - 7
        } Casual leave(s)`,
        status: 400,
        success: false,
      };
    }
    if (festivalLeaveDaysCount + yearlyFestivalLeaveDaysCount > 4) {
      return {
        data: null,
        error: null,
        message: `Can not provide more than 4 yearly Festival leaves per employee. Exceeding ${
          festivalLeaveDaysCount + yearlyFestivalLeaveDaysCount - 4
        } Festival leave(s)`,
        status: 400,
        success: false,
      };
    }
    if (earnedLeaveDaysCount + yearlyEarnedLeaveDaysCount > 15) {
      return {
        data: null,
        error: null,
        message: `Can not provide more than 15 yearly earned leaves per employee. Exceeding ${
          earnedLeaveDaysCount + yearlyEarnedLeaveDaysCount - 15
        } Earned leave(s)`,
        status: 400,
        success: false,
      };
    }

    const doc = await Attendance.findOne(filterData);

    if (doc) {
      // counting leaves according to constraints
      countLeavesYearlyExcludingRequestedMonth(filterData);
      if (doc?.casualLeaves) console.log('Old');
      const currentAttendanceArrayInDB = doc.days;
      attendanceArrayFromFrontend.forEach((ele: any) => {
        const givenDay = ele.day;
        const newStatus = ele.status;
        const existing = currentAttendanceArrayInDB.find(
          (ele) => ele.day === givenDay
        );
        if (existing) {
          existing.status = newStatus;
        } else {
          currentAttendanceArrayInDB.push(ele);
        }
      });

      // console.log(currentAttendanceArrayInDB)
      // console.log('This is the WorkOrder', workOrder);
      const updatedData = {
        $set: {
          days: currentAttendanceArrayInDB,
          workOrderHr: workOrder,
          earnedLeaves: earnedLeaveDaysCount,
          festivalLeaves: festivalLeaveDaysCount,
          presentDays: presentDaysCount,
          casualLeaves: casualLeaveDaysCount,
        },
      };
      const resp = await Attendance.findOneAndUpdate(filterData, updatedData, {
        new: true,
      });
      console.log(resp);

      if (resp) {
        const period = `${filterData.month}-${filterData.year}`.trim(); // mm-yyyy  format
        const employee = await EmployeeData.findById(emp);

        if (employee) {
          const existingPeriod = employee.workOrderHr.find(
            (entry) =>
              entry.period.trim() === period.trim() &&
              entry.workOrderHr.toString() === workOrder.toString()
          );

          if (existingPeriod) {
            // Update the existing period entry
            const UpdatedData = await EmployeeData.updateOne(
              {
                _id: employee._id,
                'workOrderHr.period': period,
                'workOrderHr.workOrderHr': workOrder.toString(),
              },
              {
                $set: {
                  'workOrderHr.$[elem].workOrderAtten': presentDaysCount,
                },
              },
              {
                new: true,
                arrayFilters: [
                  {
                    'elem.period': period,
                    'elem.workOrderHr': workOrder.toString(),
                  },
                ],
              }
            ).then(() => console.log('Promise Resolved', employee.workOrderHr));

            console.log('Updated Successfully:', presentDaysCount, UpdatedData);
          } else {
            // Add a new period entry
            await EmployeeData.updateOne(
              { _id: emp },
              {
                $addToSet: {
                  workOrderHr: {
                    period,
                    workOrderHr: workOrder,
                    workOrderAtten: presentDaysCount,
                  },
                },
              }
            );
            // console.log('Added Successfully:', period);
          }
        } else {
          // Handle case where the employee document is not found
          console.error('Employee not found');
        }

        revalidatePath('/hr/CLM');
        return {
          success: true,
          status: 200,
          message: 'Attendance Saved',
          data: JSON.stringify(resp),
          error: null,
        };
      } else {
        return {
          success: false,
          status: 500,
          message: 'Error Saving  Attendance,Please try later',
          error: '',
          data: null,
        };
      }
    } else {
      countLeavesYearlyExcludingRequestedMonth(filterData);

      // console.log('PUTTING NEW ATTENDANCE');
      let sundays = getSundays(filterData.month, filterData.year);
      console.log('Sundays', sundays);
      for (let i = 0; i < sundays.length; i++) {
        attendanceArrayFromFrontend[sundays[i] - 1] = {
          date: sundays[i],
          status: 'Not Paid',
        };
      }
      // console.log('The Attendance Array', attendanceArrayFromFrontend);
      const doc = new Attendance({
        employee: emp,
        year: filterData.year,
        month: filterData.month,
        days: attendanceArrayFromFrontend,
        workOrderHr: workOrder,
        earnedLeaves: earnedLeaveDaysCount,
        festivalLeaves: festivalLeaveDaysCount,
        presentDays: presentDaysCount,
        casualLeaves: casualLeaveDaysCount,
      });

      const resp = await doc.save();
      if (resp) {
        const period = `${filterData.month}-${filterData.year}`.trim(); // mm-yyyy  format
        const employee = await EmployeeData.findById(emp);

        if (employee) {
          const existingPeriod = employee.workOrderHr.find(
            (entry) =>
              entry.period.trim() === period.trim() &&
              entry.workOrderHr.toString() === workOrder.toString()
          );

          if (existingPeriod) {
            // Update the existing period entry
            const UpdatedData = await EmployeeData.updateOne(
              {
                _id: employee._id,
                'workOrderHr.period': period,
                'workOrderHr.workOrderHr': workOrder.toString(),
              },
              {
                $set: {
                  'workOrderHr.$[elem].workOrderAtten': presentDaysCount,
                },
              },
              {
                new: true,
                arrayFilters: [
                  {
                    'elem.period': period,
                    'elem.workOrderHr': workOrder.toString(),
                  },
                ],
              }
            ).then(() => console.log('Promise Resolved', employee.workOrderHr));

            console.log('Updated Successfully:', presentDaysCount, UpdatedData);
          } else {
            // Add a new period entry
            await EmployeeData.updateOne(
              { _id: emp },
              {
                $addToSet: {
                  workOrderHr: {
                    period,
                    workOrderHr: workOrder,
                    workOrderAtten: presentDaysCount,
                  },
                },
              }
            );
            console.log('Added Successfully:', period);
          }
        } else {
          // Handle case where the employee document is not found
          console.error('Employee not found');
        }

        revalidatePath('/hr/CLM');
        return {
          success: true,
          status: 200,
          message: 'Attendance Saved',
          data: JSON.stringify(resp),
          error: null,
        };
      } else {
        return {
          success: false,
          status: 500,
          message: 'Error Saving  Attendance,Please try later',
          error: '',
          data: null,
        };
      }
    }
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      error: JSON.stringify(err),
      message: 'Unexpected Error Occurred, Failed to save attendance',
      data: null,
    };
  }
};

export { putAttendance };

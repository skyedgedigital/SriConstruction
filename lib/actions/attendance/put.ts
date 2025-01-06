'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Attendance from '@/lib/models/HR/attendance.model';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';
import WorkOrderHr from '@/lib/models/HR/workOrderHr.model';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

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
    console.log('yere month', data);
    const attendanceArrayFromFrontend = data.arr;
    // this is workorder ID
    const workOrder = data.workOrder;
    const filterData = JSON.parse(filter);
    filterData.workOrderHr = workOrder;
    console.log('yere filterss', filterData);

    // this is employeeID receiving
    const emp = filterData.employee;
    console.log('emp to shi hai boss', emp);
    const doc = await Attendance.findOne(filterData);
    if (doc) {
      console.log('Old');
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
      let presentDaysCount = 0;

      attendanceArrayFromFrontend.forEach((day) => {
        if (day.status === 'Present') {
          presentDaysCount++;
        } else if (day.status === 'NH') {
          presentDaysCount++;
        } else if (day.status === 'Half Day') {
          presentDaysCount += 0.5;
        }
      });

      // console.log(currentAttendanceArrayInDB)
      console.log('This is the WorkOrder', workOrder);
      const updatedData = {
        $set: { days: currentAttendanceArrayInDB, workOrderHr: workOrder },
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
    } else {
      console.log('PUTTING NEW ATTENDANCE');
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
      });
      let presentDaysCount = 0;

      attendanceArrayFromFrontend.forEach((day) => {
        if (day.status === 'Present') {
          presentDaysCount++;
        } else if (day.status === 'NH') {
          presentDaysCount++;
        } else if (day.status === 'Half Day') {
          presentDaysCount += 0.5;
        }
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
      revalidatePath('/hr/CLM');
      return {
        success: true,
        status: 200,
        message: 'Attendance Created & Saved',
        data: JSON.stringify(resp),
        error: null,
      };
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

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
    const attendanceArray = data.arr;
    const workOrder = data.workOrder;
    const filterData = JSON.parse(filter);
    console.log('yere filterss', filterData);

    const emp = filterData.employee;
    console.log('emp to shi hai boss', emp);
    const doc = await Attendance.findOne(filterData);
    if (doc) {
      console.log('Old');
      const currentAttendanceArray = doc.days;
      attendanceArray.forEach((ele: any) => {
        const givenDay = ele.day;
        const newStatus = ele.status;
        const existing = currentAttendanceArray.find(
          (ele) => ele.day === givenDay
        );
        if (existing) {
          existing.status = newStatus;
        } else {
          currentAttendanceArray.push(ele);
        }
      });
      let presentDaysCount = 0;

      attendanceArray.forEach((day) => {
        if (day.status === 'Present') {
          presentDaysCount++;
        } else if (day.status === 'NH') {
          presentDaysCount++;
        } else if (day.status === 'Half Day') {
          presentDaysCount += 0.5;
        }
      });

      // console.log(currentAttendanceArray)
      console.log('This is the WorkOrder', workOrder);
      const updatedData = {
        $set: { days: currentAttendanceArray, workOrderHr: workOrder },
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
      console.log('New');
      let sundays = getSundays(filterData.month, filterData.year);
      console.log('Sundays', sundays);
      for (let i = 0; i < sundays.length; i++) {
        attendanceArray[sundays[i] - 1] = {
          date: sundays[i],
          status: 'Not Paid',
        };
      }
      console.log('The Attendance Array', attendanceArray);
      const doc = new Attendance({
        employee: emp,
        year: filterData.year,
        month: filterData.month,
        days: attendanceArray,
        workOrderHr: workOrder,
      });
      const resp = await doc.save();
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

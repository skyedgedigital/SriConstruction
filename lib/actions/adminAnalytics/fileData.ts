'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Attendance from '@/lib/models/HR/attendance.model';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';

let empCodeMap = new Map();
// array consist of employeeCode which does not exist in DB yet
let employeeNotFoundInDB = [];

// Helper function to determine the number of days in a given month and year
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate(); // month is 1-indexed (1=January)
};

// Initialize the employee code map from the database
const initializeValueInMap = async (): Promise<ApiResponse<any>> => {
  try {
    const allEmpCodes = await EmployeeData.find({});
    allEmpCodes.forEach((element) => {
      empCodeMap.set(element.code, element._id);
    });
    console.log(empCodeMap);
    return {
      success: true,
      status: 200,
      message: 'Initialized Map',
      error: null,
      data: null,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: err.message,
      status: 500,
      error: null,
      data: null,
    };
  }
};

// Function to get employee ID by their code from the map
const getEmpIdByCode = (empCode: string) => {
  let docId = empCodeMap.get(empCode) || null;
  // added a new line to because of the error
  if (!docId) {
    employeeNotFoundInDB.push(empCode);
    // throw new Error("Employee not Found");
  }
  return {
    success: true,
    status: 200,
    data: docId,
  };
};

// Helper to format the employee code if necessary
const changeCode = (empCode: string) => {
  let formattedEmpCode = parseInt(empCode, 10).toString();
  return formattedEmpCode;
};

// Main function to process the data from the frontend
const FileFn = async (data: string): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await initializeValueInMap();
    if (!resp.success) {
      console.log('Error in Initializing Map');
      return resp;
    }
    employeeNotFoundInDB = [];
    const fileData = JSON.parse(data);
    console.log(fileData.length);

    for (const ele of fileData) {
      let { empCode, year, month, days } = ele;
      // if 0240 -> OK , else if 240 -> 0240
      empCode = empCode.toString().padStart(0, 4);

      // Get employee ID
      // const empCodeParam = changeCode(empCode);
      const empIdResp = getEmpIdByCode(empCode);
      if (!empIdResp.success || !empIdResp.data) {
        console.log(`Employee ID not found for code: ${empCode}`);
        continue;
      }
      const empId = empIdResp.data;

      // Validate the days based on the month/year
      const maxDaysInMonth = getDaysInMonth(month, year);

      // Step 1: Find the attendance record for the employee, year, and month
      let attendanceRecord = await Attendance.findOne({
        employee: empId,
        year: year,
        month: month,
      });

      if (!attendanceRecord) {
        // If no record exists, create a new attendance record
        attendanceRecord = new Attendance({
          employee: empId,
          year: year,
          month: month,
          days: [], // Initialize empty days array
        });
      }

      // Step 2: Loop through each day and update or add the day's status
      for (const dayEntry of days) {
        const { day, status } = dayEntry;

        // Validate the day
        if (day < 1 || day > maxDaysInMonth) {
          console.log(
            `Invalid day (${day}) for month ${month} in year ${year}. Skipping entry.`
          );
          continue; // Skip invalid days
        }

        // Find the existing day entry in the record
        const dayIndex = attendanceRecord.days.findIndex((d) => d.day === day);

        if (dayIndex !== -1) {
          // If the day exists, update the status
          attendanceRecord.days[dayIndex].status = status;
        } else {
          // If the day does not exist, add a new day entry
          attendanceRecord.days.push({ day, status });
        }
      }

      // Step 3: Save the updated or new attendance record
      await attendanceRecord.save();
    }

    return {
      success: true,
      status: 200,
      message: 'Success',
      data: employeeNotFoundInDB,
      error: null,
    };
  } catch (err) {
    console.error(err);
    return {
      status: 500,
      message: err.message,
      success: false,
      data: employeeNotFoundInDB,
      error: JSON.stringify(err.message),
    };
  }
};

export default FileFn;

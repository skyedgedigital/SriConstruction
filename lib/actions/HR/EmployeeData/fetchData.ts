"use server";

import { ApiResponse } from "@/interfaces/APIresponses.interface";
import handleDBConnection from "@/lib/database";
import EmployeeData from "@/lib/models/HR/EmployeeData.model";

const fetchEmpNames = async (
  page = 0,
  limit = 20
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await EmployeeData.find({}).select("name").sort({ name: 1 });
    // .skip(page * limit)
    // .limit(limit);
    return {
      success: true,
      data: JSON.stringify(resp),
      status: 200,
      error: null,
      message: "Employee fetched successfully",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      status: 500,
      message:
        "Unexpected error occurred, Failed to fetch Employee, Please Try Later",
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const fetchEmpsJoinedOrLeftWithinDateRange = async (
  startDate,
  endDate
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;

  try {
    // Convert frontend date format (yyyy-mm-dd) to the database format (dd-mm-yyyy)
    const convertToDatabaseFormat = (date) =>
      date.split("-").reverse().join("-");

    const start = convertToDatabaseFormat(startDate); // Convert start date
    const end = convertToDatabaseFormat(endDate); // Convert end date

    // Query the database
    const result = await EmployeeData.find({
      $or: [
        {
          appointmentDate: {
            $gte: start,
            $lte: end,
          },
        },
        {
          resignDate: {
            $gte: start,
            $lte: end,
          },
        },
      ],
    });

    return {
      success: true,
      status: 200,
      data: JSON.stringify(result),
      error: null,
      message: "Employee fetched successfully",
    };
  } catch (err) {
    console.error("Error fetching employees:", err);
    return {
      success: false,
      status: 500,
      message:
        "Unexpected error occurred, Failed to fetch Employee data, Please Try Later",
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const checkDate = (
  targetDate: string,
  startDate: string,
  endDate: string
): boolean => {
  const toDateObject = (date: string): Date => {
    const [day, month, year] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  const target = toDateObject(targetDate);
  const start = toDateObject(startDate);
  const end = toDateObject(endDate);
  return target >= start && target <= end;
};

const fetchEmployeesJoined = async (
  startDate,
  endDate
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Helper function to convert dd-mm-yyyy to a Date object
    const toDatabaseDateFormat = (date) => {
      const parts = date.split("-");
      if (parts.length !== 3) throw new Error(`Invalid date format: ${date}`);
      // If format is yyyy-mm-dd, convert to dd-mm-yyyy
      return parts[0].length === 4
        ? `${parts[2]}-${parts[1]}-${parts[0]}` // yyyy-mm-dd to dd-mm-yyyy
        : date; // Assume already dd-mm-yyyy
    };

    const start = toDatabaseDateFormat(startDate);
    const end = toDatabaseDateFormat(endDate);

    console.log(start);
    console.log(end);

    const flag: boolean = checkDate("02-11-2024", start, end);

    if (flag) {
      console.log("falls withing");
    } else {
      console.log("doesnt");
    }

    // Fetch all employees from the database
    const allEmployees = await EmployeeData.find(
      {},
      {
        _id: 1,
        name: 1,
        code: 1,
        appointmentDate: 1,
        resignDate: 1,
      }
    );

    let filteredDocs = [];

    allEmployees.forEach((element) => {
      if (checkDate(element.appointmentDate, start, end)) {
        filteredDocs.push(element);
      }
    });

    return {
      success: true,
      status: 200,
      data: JSON.stringify({ filteredDocs, count: filteredDocs.length }),
      message: "Employee fetched successfully",
      error: null,
    };
  } catch (err) {
    console.error("Error fetching employees:", err);
    return {
      success: false,
      status: 500,
      message:
        "Unexpected error occurred, Failed to fetch Employee, Please Try Later",
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const fetchEmployeesResigned = async (
  startDate,
  endDate
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Helper function to convert dd-mm-yyyy to a Date object
    const toDatabaseDateFormat = (date) => {
      const parts = date.split("-");
      if (parts.length !== 3) throw new Error(`Invalid date format: ${date}`);
      // If format is yyyy-mm-dd, convert to dd-mm-yyyy
      return parts[0].length === 4
        ? `${parts[2]}-${parts[1]}-${parts[0]}` // yyyy-mm-dd to dd-mm-yyyy
        : date; // Assume already dd-mm-yyyy
    };

    const start = toDatabaseDateFormat(startDate);
    const end = toDatabaseDateFormat(endDate);

    console.log(start);
    console.log(end);

    const flag: boolean = checkDate("02-11-2024", start, end);

    if (flag) {
      console.log("falls withing");
    } else {
      console.log("doesnt");
    }
    const allEmployees = await EmployeeData.find(
      {},
      {
        _id: 1,
        name: 1,
        code: 1,
        resignDate: 1,
        appointmentDate: 1,
      }
    );
    let filteredDocs = [];
    allEmployees.forEach((element) => {
      if (checkDate(element.resignDate, start, end)) {
        filteredDocs.push(element);
      }
    });

    return {
      success: true,
      status: 200,
      data: JSON.stringify({ filteredDocs, count: filteredDocs.length }),
      error: null,
      message: "Fetch Resigned employee successfully",
    };
  } catch (err) {
    console.error("Error fetching employees:", err);
    return {
      success: false,
      status: 500,
      message:
        "Unexpected error occurred, Failed to fetch Resigned Employee, Please Try Later",
      data: null,
      error: JSON.stringify(err),
    };
  }
};

export {
  fetchEmpNames,
  fetchEmpsJoinedOrLeftWithinDateRange,
  fetchEmployeesJoined,
  fetchEmployeesResigned,
};

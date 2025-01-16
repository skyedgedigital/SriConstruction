'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Chalan from '@/lib/models/chalan.model';
import Employee from '@/lib/models/employee.model';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';
import Vehicle from '@/lib/models/vehicle.model';

const fetchVehicleHoursAnalytics = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    let totalHours = 0;
    const resp = await Chalan.find({
      verified: true,
    });
    if (resp) {
      resp.forEach((chalan) => {
        let itemsList = chalan.items;
        itemsList.forEach((item) => {
          if (item.unit === 'hours') {
            totalHours += item.hours;
          }
        });
      });
    }
    console.log("Total Hours"+totalHours);
    return {
      success: true,
      status: 200,
      data: totalHours,
      message: 'Vehicle Hours Fetched',
      error: null,
    };
  } catch (err) {
    return {
      error: JSON.stringify(err.message),
      status: 500,
      success: false,
      data: null, // data field here just to keep responses consistent
      message: 'Unexpected Error Occurred, Failed to load drivers count',
    };
  }
};

const fetchTotalVehicles = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await Vehicle.countDocuments();
    return {
      success: true,
      message: 'Vehicle Number Fetched',
      data: resp,
      status: 200,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected Error Occurred, Failed to fetch total vehicles',
      data: null, // data field here just to keep responses consistent
      error: JSON.stringify(err.message),
    };
  }
};

const fetchDriversCount = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await Employee.find({
      employeeRole: 'DRIVER',
    }).countDocuments();
    return {
      success: true,
      message: 'DRIVER Number Fetched',
      data: resp,
      status: 200,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected Error Occurred, Failed to load drivers count',
      data: null, // data field here just to keep responses consistent
      error: JSON.stringify(err.message),
    };
  }
};

const fetchFleetManagersCount = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await Employee.find({
      employeeRole: 'FLEETMANAGER',
    }).countDocuments();
    return {
      success: true,
      message: 'FLEETMANAGER Number Fetched',
      data: resp,
      status: 200,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected Error Occurred, Failed to load Fleet Manager count',
      data: null, // data field here just to keep responses consistent
      error: JSON.stringify(err.message),
    };
  }
};

const fetchHRCount = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await Employee.find({
      employeeRole: 'HR',
    }).countDocuments();
    return {
      success: true,
      message: 'HR Number Fetched',
      data: resp,
      status: 200,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected Error Occurred, Failed to load drivers count',
      data: null,
      error: JSON.stringify(err.message),
    };
  }
};

const fetchSafetyManagerCount = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await Employee.find({
      employeeRole: 'Safety',
    }).countDocuments();
    return {
      success: true,
      message: 'SAFETY Number Fetched',
      data: resp,
      status: 200,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected Error Occurred, Failed to load drivers count',
      data: null,
      error: JSON.stringify(err),
    };
  }
};

const fetchHrEmps = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await EmployeeData.find({}).countDocuments();
    return {
      success: true,
      status: 200,
      message: 'Hr Emps Fetched',
      data: resp,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected Error Occurred, Failed to load drivers count',
      data: null,
      error: JSON.stringify(err),
    };
  }
};

export {
  fetchVehicleHoursAnalytics,
  fetchTotalVehicles,
  fetchDriversCount,
  fetchFleetManagersCount,
  fetchHRCount,
  fetchSafetyManagerCount,
  fetchHrEmps,
};

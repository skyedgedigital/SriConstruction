'use server';
import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Employee from '@/lib/models/employee.model';
import { employee } from '@/types/employee.type';

const getEmployee = async (
  employeeInfo: employee
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    var employee = await Employee.findOne(employeeInfo);
    if (!employee) {
      return {
        success: false,
        status: 404,
        message: 'Employee not found',
        data: null,
        error: null,
      };
    }
    return {
      success: true,
      status: 200,
      message: 'Employee found',
      data: employee,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Internal server Error',
      error: JSON.stringify(error),
      data: null,
    };
  }
};

const fetchAllEmployees = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const result = await Employee.find({});

    // Sort the response array by engineer name in alphabetical order
    const sortedResp = result.sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      status: 200,
      message: 'List of All Employees',
      data: JSON.stringify(sortedResp),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to fetch employees, Please Try Later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const fetchEmpByPhoneNumber = async (
  phone: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await Employee.findOne({
      phoneNo: parseInt(phone, 10),
    });
    if (!resp) {
      return {
        success: false,
        status: 404,
        message: 'Emp not found',
        data: null,
        error: null,
      };
    }
    return {
      success: true,
      status: 200,
      message: 'Employee found',
      data: resp,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to Employee, Please Try Later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { getEmployee, fetchAllEmployees, fetchEmpByPhoneNumber };

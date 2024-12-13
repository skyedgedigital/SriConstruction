'use server';

import Department from '@/lib/models/department.model';
import Engineer from '@/lib/models/engineer.model';
import mongoose from 'mongoose';
import { DepartmentSchema } from '@/lib/models/department.model';
import handleDBConnection from '@/lib/database';
import { ApiResponse } from '@/interfaces/APIresponses.interface';

const departmentModel =
  mongoose.models.Department || mongoose.model('Department', DepartmentSchema);

const fetchAllEngineers = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const result = await Engineer.find({}).populate(
      'department',
      'departmentName'
    );
    // Sort the result array by engineer name in alphabetical order
    const sortedResult = result.sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      status: 200,
      message: 'List of All Engineers Fetched',
      data: JSON.stringify(sortedResult),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to update photos, Please Try Later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const fetchEngineerByDepartment = async (
  departmentName: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const departmentDoc = await Department.findOne({
      departmentName: departmentName,
    });
    if (!departmentDoc) {
      return {
        success: false,
        status: 404,
        message: `Department ${departmentName} not found`,
        data: null,
        error: null,
      };
    }
    const departmentId = departmentDoc._id;
    const resp = await Engineer.find({
      department: departmentId,
    });
    // Sort the response array by engineer name in alphabetical order
    const sortedResp = resp?.sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      status: 200,
      message: `List of Engineers for the department ${departmentName}`,
      data: JSON.stringify(sortedResp),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred,Failed to fetch Engineer by Department Please Try Later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { fetchAllEngineers, fetchEngineerByDepartment };

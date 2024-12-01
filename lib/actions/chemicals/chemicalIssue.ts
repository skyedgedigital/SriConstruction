'use server';
import { EmployeeDataSchema } from '@/lib/models/HR/EmployeeData.model';
import { EmployeeData } from './../../../components/hr/WagesColumn';

import Chemical, {
  ChemicalSchema,
} from '@/lib/models/safetyPanel/chemicals/chemical.model';
import ChemicalIssue from '@/lib/models/safetyPanel/chemicals/chemicalIssue.model';
import mongoose from 'mongoose';
import handleDBConnection from '@/lib/database';
import { ApiResponse } from '@/interfaces/APIresponses.interface';

const ChemicalModel =
  mongoose.models.Chemical || mongoose.model('Chemical', ChemicalSchema);
const EmployeeModel =
  mongoose.models.EmployeeData ||
  mongoose.model('EmployeeData', EmployeeDataSchema);
const createChemicalIssue = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const dataObj = JSON.parse(dataString);
    const docObj = new ChemicalIssue({
      ...dataObj,
    });
    const chemicalId = dataObj.chemicalId;
    const quantityIssued = dataObj.quantity;
    const chemicalDetails = await Chemical.findOne({
      _id: chemicalId,
    });
    const existingQuantity = chemicalDetails.quantity;
    const updatedChemical = await Chemical.findOneAndUpdate(
      {
        _id: chemicalId,
      },
      {
        $set: {
          quantity: existingQuantity - quantityIssued,
        },
      },
      {
        new: true,
      }
    );
    console.log(updatedChemical);
    const result = await docObj.save();
    return {
      success: true,
      message: 'Chemical Issue Added',
      status: 200,
      data: JSON.stringify(result),
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to add chemical issue,Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const deleteChemicalIssue = async (
  chemicalIssueId: any
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const chemicalIssueDetails = await ChemicalIssue.findOne({
      _id: chemicalIssueId,
    });
    const chemicalId = chemicalIssueDetails.chemicalId;
    const quantityIssued = chemicalIssueDetails.quantity;
    const chemicalDetails = await Chemical.findOne({
      _id: chemicalId,
    });
    const existingQuantity = chemicalDetails.quantity;
    const updatedChemicalDetails = await Chemical.findOneAndUpdate(
      {
        _id: chemicalId,
      },
      {
        $set: {
          quantity: existingQuantity + quantityIssued,
        },
      }
    );
    console.log(updatedChemicalDetails);
    const result = await ChemicalIssue.deleteOne({ _id: chemicalIssueId });
    return {
      success: true,
      message: 'Compliance deleted successfully',
      status: 200,
      error: null,
      data: JSON.stringify(result || ''),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to delete Chemical issue Please Try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const fetchChemicalIssues = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const chemicals = await ChemicalIssue.find({})
      .populate('chemicalId', 'name')
      .populate('issuedTo', 'name');
    return {
      success: true,
      status: 200,
      message: 'List of All Chemical Issues',
      data: JSON.stringify(chemicals),
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to fetch chemical Issue, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const fetchChemicalIssueById = async (
  chemicalIssueId: any
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const chemicals = await ChemicalIssue.findOne({
      _id: chemicalIssueId,
    });
    return {
      success: true,
      status: 200,
      message: 'List of All Chemical Issues',
      data: JSON.stringify(chemicals),
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to fetch chemical issue, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export {
  createChemicalIssue,
  deleteChemicalIssue,
  fetchChemicalIssueById,
  fetchChemicalIssues,
};

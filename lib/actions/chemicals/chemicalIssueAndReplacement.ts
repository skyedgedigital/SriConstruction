'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import ChemicalIssueAndReplacementRegister from '@/lib/models/safetyPanel/chemicals/chemicalssueAndReplacementRegister.model';

const genChemicalIssueAndReplacement = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const data = JSON.parse(dataString);
    const dataObj = new ChemicalIssueAndReplacementRegister({
      ...data,
    });
    const resp = await dataObj.save();
    return {
      success: true,
      message: 'Chemical issue successfully',
      data: JSON.stringify(resp),
      status: 200,
      error: null,
    };
  } catch (err) {
    return {
      status: 500,
      success: false,
      message:
        'Unexpected Error Occurred, Failed to generate Chemical Issue and Replacement,Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const viewChemicalIssueAndReplacementRegister = async (): Promise<
  ApiResponse<any>
> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await ChemicalIssueAndReplacementRegister.find({});
    return {
      data: JSON.stringify(resp),
      success: true,
      status: 200,
      message: 'Fetched Succesfully',
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to fetch Chemical issue & Replacement, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const deleteChemicalIssueAndReplacementRegister = async (
  id: any
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await ChemicalIssueAndReplacementRegister.findByIdAndDelete(
      id
    );
    return {
      success: true,
      message: 'Deleted Successfully',
      data: JSON.stringify(resp),
      status: 200,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected Error Occurred, Fail to delete, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export {
  genChemicalIssueAndReplacement,
  viewChemicalIssueAndReplacementRegister,
  deleteChemicalIssueAndReplacementRegister,
};

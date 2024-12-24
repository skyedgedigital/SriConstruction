'use server';
import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '../database';
import Enterprise from '../models/enterprise.model';
async function saveEnterpriseInfo(info: string) {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Check if an enterprise document already exists
    console.log('boigigig');
    const infor = await JSON.parse(info);
    console.log(infor);
    let enterprise = await Enterprise.findOne();
    console.log('wowowowmd', infor);
    if (!enterprise) {
      // If no document exists, create a new one
      enterprise = new Enterprise(infor);
    } else {
      // If a document exists, update it with the new info
      Object.assign(enterprise, infor);
    }

    // Save the enterprise document (either new or updated)
    await enterprise.save();

    return {
      success: true,
      message: 'Enterprise information saved successfully',
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: 'Failed to save enterprise information',
      error,
    };
  }
}

async function fetchEnterpriseInfo(): Promise<ApiResponse<any>> {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Fetch the enterprise details (assuming there's only one document)
    const enterprise = await Enterprise.findOne();

    if (!enterprise) {
      return {
        success: false,
        message: 'Enterprise details not found',
        error: null,
        status: 404,
        data: null,
      };
    }

    return {
      success: true,
      data: JSON.stringify(enterprise),
      error: null,
      status: 200,
      message: 'Successfully fetched enterprise details',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch enterprise details',
      error,
      status: 500,
      data: null,
    };
  }
}

export { fetchEnterpriseInfo, saveEnterpriseInfo };

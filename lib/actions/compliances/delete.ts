'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Compliance from '@/lib/models/compliances.model';

const deleteCompliance = async (
  complianceId: any
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const compliance = await Compliance.findByIdAndDelete(complianceId);
    if (!compliance) {
      return {
        success: false,
        status: 404,
        message: 'Compliance not found',
        error: null,
        data: null,
      };
    }
    return {
      success: true,
      status: 200,
      message: 'Compliance Deleted',
      data: JSON.stringify(compliance),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Internal server Error',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { deleteCompliance };

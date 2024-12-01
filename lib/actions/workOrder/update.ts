'use server';

import handleDBConnection from '@/lib/database';
import WorkOrder from '@/lib/models/workOrder.model';

const updateWorkOrder = async (workOrderNumber: string, updatedData: any) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const filter = {
      workOrderNumber: workOrderNumber,
    };
    let update = updatedData;
    const ifExists = await WorkOrder.findOne({
      workOrderNumber: workOrderNumber,
    });
    if (!ifExists) {
      return {
        message: `The Work Order ${workOrderNumber} not exists`,
        success: false,
        status: 404,
      };
    }
    const result = await WorkOrder.findOneAndUpdate(filter, update, {
      new: true,
    });
    return {
      success: true,
      status: 201,
      message: 'Successfully Updated',
      data: result,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Internal Server Error',
      status: 500,
      error: JSON.stringify(err),
    };
  }
};

export { updateWorkOrder };

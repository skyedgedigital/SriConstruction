'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import WorkOrderHr from '@/lib/models/HR/workOrderHr.model';

const createWorkOrderHr = async (dataString: string) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const dataObj = await JSON.parse(dataString);
    // console.log('dataObj', dataObj);
    const splittedValidTo = dataObj.validTo.split('-');
    const lapseTill = `${Number(splittedValidTo[0]) + 1}-${
      splittedValidTo[1]
    }-${splittedValidTo[2]}`;
    // console.log('lapseTill', lapseTill);
    const obj = new WorkOrderHr({
      ...dataObj,
      lapseTill,
    });
    const resp = await obj.save();
    return {
      success: true,
      message: 'Work Order Added',
      // data: JSON.stringify(resp),
      status: 200,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: JSON.stringify(err),
    };
  }
};

const deleteWorkOrderHr = async (id: any) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await WorkOrderHr.findByIdAndDelete(id);
    return {
      success: true,
      message: 'Work Order Deleted',
      data: JSON.stringify(resp),
      status: 200,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: JSON.stringify(err),
    };
  }
};

const fetchAllWorkOrderHr = async () => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await WorkOrderHr.find({}).sort({ workOrderNumber: 1 });
    return {
      success: true,
      message: 'Work Orders Retrieved',
      data: JSON.stringify(resp),
      status: 200,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: JSON.stringify(err),
    };
  }
};

const fetchAllValidWorkOrderHr = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await WorkOrderHr.find({}).sort({ workOrderNumber: 1 });
    // console.log('valid workorder', resp);

    if (!resp) {
      return {
        success: false,
        status: 500,
        message:
          'Unexpected error occurred, Failed to fetch workorders, Please make sure you have stable internet connection',
        error: null,
        data: null,
      };
    }
    const validWOs = [];
    const now = Date.now();
    resp.forEach((wo) => {
      const validTill = new Date(wo?.validTo).getTime();
      // console.log(x);
      if (validTill >= now) {
        validWOs.push(wo);
      }
    });
    console.log('valid res', validWOs, validWOs.length);
    return {
      success: true,
      message: 'Work Orders Retrieved',
      data: JSON.stringify(validWOs),
      status: 200,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const fetchSingleWorkOrderHr = async (filter: string) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await WorkOrderHr.findOne(JSON.parse(filter));
    return {
      success: true,
      message: 'Work Order Retrieved',
      data: JSON.stringify(resp),
      status: 200,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: JSON.stringify(err),
    };
  }
};

const getTotalWorkOrder = async () => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await WorkOrderHr.find({});
    return {
      success: true,
      status: 200,
      message: 'Fetched Count',
      data: resp.length,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
    };
  }
};

export {
  fetchAllWorkOrderHr,
  createWorkOrderHr,
  deleteWorkOrderHr,
  fetchSingleWorkOrderHr,
  getTotalWorkOrder,
  fetchAllValidWorkOrderHr,
};

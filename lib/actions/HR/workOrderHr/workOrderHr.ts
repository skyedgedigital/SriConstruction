'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import WorkOrderHr from '@/lib/models/HR/workOrderHr.model';

const createWorkOrderHr = async (
  dataString: string
): Promise<ApiResponse<any>> => {
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

    // checking validity date validity
    const validFrom = new Date(dataObj?.validFrom).getTime();
    const validTill = new Date(dataObj?.validTo).getTime();

    if (validTill < validFrom) {
      return {
        success: false,
        status: 400,
        message: 'Valid Till date must be greater than Valid From date ',
        error: null,
        data: null,
      };
    }
    const obj = new WorkOrderHr({
      ...dataObj,
      lapseTill,
    });
    const resp = await obj.save();
    return {
      success: true,
      message: 'Work Order Added',
      data: JSON.stringify(resp),
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
    resp?.forEach((wo) => {
      const lapseTill = new Date(wo?.lapseTill).getTime();
      // console.log(x);
      if (lapseTill >= now) {
        validWOs.push(wo);
      }
    });
    // console.log('valid res', validWOs, validWOs.length);
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

const updateWorkOrderHr = async (
  _id: string,
  dataString: any
): Promise<ApiResponse<any>> => {
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
    dataObj.lapseTill = lapseTill;

    // checking validity date validity
    const validFrom = new Date(dataObj?.validFrom).getTime();
    const validTill = new Date(dataObj?.validTo).getTime();

    if (validTill < validFrom) {
      return {
        success: false,
        status: 400,
        message: 'Valid Till date must be greater than Valid From date ',
        error: null,
        data: null,
      };
    }

    const existingWO = await WorkOrderHr.findById(_id);
    if (!existingWO) {
      return {
        success: false,
        status: 400,
        message: 'Did not found workorder in Database to edit',
        error: null,
        data: null,
      };
    }
    const updatedWo = await WorkOrderHr.findByIdAndUpdate(_id, dataObj, {
      new: true,
    });
    console.log('updated workorder', updatedWo);
    if (!updatedWo) {
      return {
        success: false,
        status: 404,
        message:
          'Unexpected error occurred, Failed to update workorder, Please try later',
        error: null,
        data: null,
      };
    }
    return {
      success: true,
      message: 'Work Order updated successfully',
      data: JSON.stringify(updatedWo),
      status: 200,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred in DB, Failed to update, please try later',
      error: JSON.stringify(err),
      data: null,
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
  updateWorkOrderHr,
};

'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import { IWorkOrder } from '@/interfaces/workOrder.interface';
import handleDBConnection, { connectToDB } from '@/lib/database';
import WorkOrder from '@/lib/models/workOrder.model';

const fetchAllWorkOrdersData = async () => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await WorkOrder.find({});
    return {
      success: true,
      status: 200,
      message: 'List of All Work Order Fetched',
      data: JSON.stringify(resp),
    };
  } catch (err) {
    console.log('XXXXXXXXXXX', err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: JSON.stringify(err),
    };
  }
};

const fetchWorkOrderByWorkOrderNumber = async (workOrderNumber: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const findWorkOrderExists = await WorkOrder.findOne({
      workOrderNumber: workOrderNumber,
    });
    if (!findWorkOrderExists) {
      return {
        success: false,
        status: 404,
        message: 'No WorkOrder With This Number Exists',
      };
    }
    const resp = await WorkOrder.findOne({
      workOrderNumber: workOrderNumber,
    });
    return {
      success: true,
      status: 200,
      message: `Data of WorkOrder ${workOrderNumber}`,
      data: resp,
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

const fetchWorkOrderByWorkOrderId = async (workOrderNumber: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    console.log(workOrderNumber);
    const findWorkOrderExists = await WorkOrder.findById({
      _id: workOrderNumber,
    });
    if (!findWorkOrderExists) {
      return {
        success: false,
        status: 404,
        message: 'No WorkOrder With This Number Exists',
      };
    }
    const resp = await WorkOrder.findOne({
      _id: workOrderNumber,
    });
    return {
      success: true,
      status: 200,
      message: `Data of WorkOrder ${workOrderNumber}`,
      data: resp,
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

const fetchWorkOrderUnitsByWorkOrderNameOrId = async (filter: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const findIfWorkOrderExists = await WorkOrder.findOne(JSON.parse(filter));
    if (!findIfWorkOrderExists) {
      return {
        success: false,
        status: 404,
        message: 'WorkOrder not Found',
      };
    }
    const units = findIfWorkOrderExists.units;
    return {
      success: true,
      status: 200,
      message: 'Units Fetched',
      data: JSON.stringify(units),
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
    };
  }
};
const fetchAllValidWorkOrder = async (): Promise<ApiResponse<any>> => {
  try {
    const resp: IWorkOrder[] = await WorkOrder.find({});

    if (!resp) {
      return {
        data: null,
        error: null,
        status: 500,
        success: false,
        message: 'Unexpected error occurred, Failed to fetch valid work orders',
      };
    }

    console.log('ALL WO', resp);
    const validWorkOrders: IWorkOrder[] = [];
    const now = Date.now();

    resp.forEach((wo) => {
      const validityTime = new Date(wo?.workOrderValidity).getTime();
      if (validityTime >= now) {
        validWorkOrders.push(wo);
      }
    });
    console.log('VALID WO', validWorkOrders);

    return {
      data: JSON.stringify(validWorkOrders),
      error: null,
      status: 200,
      success: true,
      message: '',
    };
  } catch (error) {
    return {
      data: null,
      error: JSON.stringify(error),
      status: 500,
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unexpected error occurred, Failed to fetch valid work orders',
    };
  }
};
export {
  fetchAllWorkOrdersData,
  fetchWorkOrderByWorkOrderNumber,
  fetchWorkOrderByWorkOrderId,
  fetchWorkOrderUnitsByWorkOrderNameOrId,
  fetchAllValidWorkOrder,
};

'use server';

import handleDBConnection from '@/lib/database';
import WorkOrderHr from '@/lib/models/HR/workOrderHr.model';

const createState = async (datastring: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataobj = JSON.parse(datastring);
    const { selectedState, address, rate, workOrderId } = dataobj;
    const updatedWorkOrder = await WorkOrderHr.findByIdAndUpdate(
      workOrderId,
      {
        StateDetails: {
          stateName: selectedState,
          stateAddress: address,
          statePayRate: rate,
        },
      },
      { new: true }
    );
    if (!updatedWorkOrder) {
      throw new Error('WorkOrder not found');
    }

    return {
      success: true,
      message: 'State details (State name,add..and payrate) added',
      data: JSON.stringify(updatedWorkOrder),
      status: 200,
    };
  } catch (err) {
    console.error('Error related to updating state details:', err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: err,
    };
  }
};

const deleteState = async (workOrderId: any) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await WorkOrderHr.findByIdAndUpdate(
      workOrderId,
      {
        StateDetails: {
          stateName: null,
          stateAddress: null,
          statePayRate: null,
        },
      },
      { new: true }
    );
    if (!resp) {
      throw new Error('workorder not found!!');
    }
    return {
      success: true,
      message: 'all details of state field set to null',
      status: 200,
      data: JSON.stringify(resp),
    };
  } catch (err) {
    console.error('Error updating state details:', err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error!!',
      error: err,
    };
  }
};

const fetchState = async () => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Find all work orders that have non-empty StateDetails
    const workOrdersWithStateData = await WorkOrderHr.find(
      { 'StateDetails.stateName': { $exists: true, $ne: null } }, // Check if StateDetails has a stateName
      '_id StateDetails' // Only retrieve the work order _id and StateDetails
    );

    // Process the results to include the workOrder ID and state details
    const workOrdersData = workOrdersWithStateData.map((order) => ({
      workOrderId: order._id,
      states: order.StateDetails,
    }));

    return {
      success: true,
      message: 'Work order IDs with state data retrieved!',
      data: JSON.stringify(workOrdersData),
      status: 200,
    };
  } catch (err) {
    console.error('State fetch error:', err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: JSON.stringify(err),
    };
  }
};

const updateStateDetail = async (datastring: string, workOrderId: any) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const updatedData = JSON.parse(datastring);
    const UpdateStateDetail = await WorkOrderHr.findOneAndUpdate(
      workOrderId,
      {
        $set: {
          StateDetails: updatedData,
        },
      },
      {
        new: true,
      }
    );
    return {
      success: true,
      message: 'State Data Updated Successfully',
      status: 200,
    };
  } catch (err) {
    console.error('Facing error in state detail update');
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error!!',
      error: JSON.stringify(err),
    };
  }
};

export { createState, deleteState, fetchState, updateStateDetail };

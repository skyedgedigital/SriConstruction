'use server';

import handleDBConnection from '@/lib/database';
import SafetyTool from '@/lib/models/safetyPanel/tools/tool.model';
import SafetyToolMaintenance from '@/lib/models/safetyPanel/tools/toolMaintenance.model';

const createService = async (
  toolId: any,
  quantity: number,
  servicetype: string,
  date: string
) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const toolDetails = await SafetyTool.findOne({
      _id: toolId,
    });
    const existingQuantity = toolDetails.quantity;
    const newQuantity = existingQuantity - quantity;
    const updatedSafetyTool = await SafetyTool.findOneAndUpdate(
      {
        _id: toolId,
      },
      {
        $set: {
          quantity: newQuantity,
        },
      },
      {
        new: true,
      }
    );
    console.log(updatedSafetyTool);
    const docObj = new SafetyToolMaintenance({
      toolId: toolId,
      quantity: quantity,
      type: servicetype,
      date: date,
    });
    const result = await docObj.save();
    return {
      success: true,
      message: 'SafetyToolPurchase Added',
      status: 200,
      data: JSON.stringify(result),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      err: JSON.stringify(err),
    };
  }
};

const deleteService = async (serviceId: any) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const serviceDetails = await SafetyToolMaintenance.findOne({
      _id: serviceId,
    });
    const toolId = serviceDetails.toolId;
    const serviceQuantity = serviceDetails.quantity;
    const toolDetails = await SafetyTool.findOne({
      _id: toolId,
    });
    const existingQuantity = toolDetails.quantity;
    const newQuantity = existingQuantity + serviceQuantity;
    const updatedSafetyTool = await SafetyTool.findOneAndUpdate(
      {
        _id: toolId,
      },
      {
        $set: {
          quantity: newQuantity,
        },
      },
      {
        new: true,
      }
    );
    console.log(updatedSafetyTool);
    const result = await SafetyToolMaintenance.deleteOne({
      _id: serviceId,
    });
    return {
      success: true,
      message: 'SafetyToolMaintenance Deleted',
      status: 200,
      data: JSON.stringify(result),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      err: JSON.stringify(err),
    };
  }
};

const fetchSafetyToolsInService = async () => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const result = await SafetyToolMaintenance.find({}).populate('toolId');
    return {
      success: true,
      status: 200,
      message: 'Tools Fetched',
      data: JSON.stringify(result),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      err: JSON.stringify(err),
    };
  }
};

export { createService, deleteService, fetchSafetyToolsInService };

'use server';

import handleDBConnection from '@/lib/database';
import Ppe from '@/lib/models/safetyPanel/ppe/ppe.model';
import PpeIssue from '@/lib/models/safetyPanel/ppe/ppeIssue.model';

const createPpeIssue = async (dataString: string) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const dataObj = JSON.parse(dataString);
    console.log(dataObj);
    const toolId = dataObj.ppeId;
    const quantity = dataObj.quantity;
    const toolDetails = await Ppe.findOne({
      _id: toolId,
    });
    const existingQuantity = toolDetails.quantity;
    const newQuantity = existingQuantity - quantity;
    const updatedSafetyTool = await Ppe.findOneAndUpdate(
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
    const docObj = new PpeIssue({
      ...dataObj,
    });
    const result = await docObj.save();
    return {
      success: true,
      status: 200,
      message: 'ToolIssued Successfully',
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

const deletePpeIssue = async (toolIssueId: any) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const toolIssueDetails = await PpeIssue.findOne({
      _id: toolIssueId,
    });
    const toolId = toolIssueDetails.ppeId;
    const toolDetails = await Ppe.findOne({
      _id: toolId,
    });
    const existingQuantity = toolDetails.quantity;
    const quantityInIssue = toolIssueDetails.quantity;
    const newQuantity = existingQuantity + quantityInIssue;
    const updatedSafetyTool = await Ppe.findOneAndUpdate(
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
    const result = await PpeIssue.deleteOne({
      _id: toolIssueId,
    });
    return {
      success: true,
      status: 200,
      message: 'ToolIssue Deleted Successfully',
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

const fetchPpeIssue = async () => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const result = await PpeIssue.find({})
      .populate('ppeId')
      .populate('issuedTo', 'name');
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

export { createPpeIssue, deletePpeIssue, fetchPpeIssue };

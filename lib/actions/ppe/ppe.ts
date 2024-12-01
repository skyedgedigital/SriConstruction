'use server';

import handleDBConnection from '@/lib/database';
import connectToDB from '@/lib/database';
import Ppe from '@/lib/models/safetyPanel/ppe/ppe.model';

const createPpe = async (dataString: string) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const dataObj = JSON.parse(dataString);
    const Obj = new Ppe({
      ...dataObj,
    });
    const result = await Obj.save();
    return {
      success: true,
      message: 'Tool Added to Inventory',
      status: 200,
      data: JSON.stringify(result),
    };
  } catch (err) {
    return {
      status: 500,
      message: 'Internal Server Error',
      err: JSON.stringify(err),
      success: false,
    };
  }
};

const deletePpe = async (ppeId: any) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const result = await Ppe.deleteOne({ _id: ppeId });
    return {
      success: true,
      status: 200,
      message: 'Tool Deleted',
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

const fetchPpeAll = async () => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const result = await Ppe.find({});
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

const fetchPpeById = async (toolId: any) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const chemicalData = await Ppe.findOne({
      _id: toolId,
    });
    return {
      success: true,
      status: 200,
      message: 'Details of the chemical',
      data: JSON.stringify(chemicalData),
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

const updatePpe = async (toolId: any, dataString: string) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const dataObj = JSON.parse(dataString);
    const result = await Ppe.findOneAndUpdate(
      {
        _id: toolId,
      },
      {
        ...dataObj,
      },
      {
        new: true,
      }
    );
    return {
      success: true,
      status: 200,
      message: 'Tool Updated',
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

export { createPpe, deletePpe, fetchPpeAll, fetchPpeById, updatePpe };

'use server';

import handleDBConnection from '@/lib/database';

import ToolMaintanence from '@/lib/models/safetyPanel/tools/toolMaintanence.model';

const genMaintanence = async (dataString: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataObj = JSON.parse(dataString);
    const Obj = new ToolMaintanence({
      ...dataObj,
    });
    const result = await Obj.save();
    return {
      success: true,
      message: 'Check List Added',
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

const getMaintanenceAll = async () => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const result = await ToolMaintanence.find({});
    return {
      success: true,
      status: 200,
      message: 'Maintanence Fetched',
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

const deleteMaintanenceById = async (ppeId: any) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const result = await ToolMaintanence.deleteOne({ _id: ppeId });
    return {
      success: true,
      status: 200,
      message: 'Maintanence Deleted',
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

export { genMaintanence, getMaintanenceAll, deleteMaintanenceById };

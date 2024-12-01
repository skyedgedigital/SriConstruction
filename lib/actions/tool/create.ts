'use server';

import handleDBConnection from '@/lib/database';
import Tool from '@/lib/models/tool.model';

const createTool = async (dataString: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataObj = JSON.parse(dataString);
    const Obj = new Tool({
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
      message:
        'Unexpected Error Occurred, Failed to add inventory, Please try later',
      err: JSON.stringify(err),
      success: false,
    };
  }
};

export { createTool };

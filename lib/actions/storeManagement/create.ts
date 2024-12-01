'use server';

import handleDBConnection from '@/lib/database';
import Store from '@/lib/models/storeManagement.model';
import Tool from '@/lib/models/tool.model';

const createStoreManagment = async (dataString: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    let dataObj = JSON.parse(dataString);
    const toolName = dataObj.tool;

    const toolDoc = await Tool.findOne({
      toolName: toolName,
    });
    if (!toolDoc) {
      return {
        success: false,
        status: 404,
        message: 'Tool Not Found',
      };
    }

    const availableQuantity = toolDoc.quantity;

    if (dataObj.quantity > availableQuantity) {
      return {
        success: false,
        status: 400,
        message: 'Not Enough Quantity in Inventory to allot',
      };
    }

    dataObj.tool = toolDoc._id;
    dataObj.totalPrice = toolDoc.price * dataObj.quantity;

    const allottedToolDoc = new Store({
      ...dataObj,
    });

    const resp = await allottedToolDoc.save();
    console.log('resp', resp);
    if (resp) {
      await Tool.findOneAndUpdate(
        {
          toolName: toolName,
        },
        {
          quantity: availableQuantity - dataObj.quantity,
        },
        {
          new: true,
        }
      );
    }

    return {
      success: true,
      status: 200,
      message: 'Tool Allotted',
      data: JSON.stringify(resp),
    };
  } catch (err) {
    return {
      err: JSON.stringify(err),
      success: false,
      status: 500,
      message: 'Error saving consumable',
    };
  }
};

export { createStoreManagment };

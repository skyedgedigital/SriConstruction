'use server';

import handleDBConnection from '@/lib/database';
import Item from '@/lib/models/item.model';

const deleteItemByItemNumber = async (itemNumber: number) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const ifExists = await Item.findOne({
      itemNumber: itemNumber,
    });
    if (!ifExists) {
      return {
        success: false,
        message: `Item with number ${itemNumber} not found`,
        status: 404,
      };
    }
    await Item.findOneAndDelete({
      itemNumber: itemNumber,
    });
    return {
      success: true,
      status: 200,
      message: `Item with Number ${itemNumber} deleted`,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to delete item,Please try later',
      error: JSON.stringify(err.message) || 'Unknown error occurred',
    };
  }
};

export { deleteItemByItemNumber };

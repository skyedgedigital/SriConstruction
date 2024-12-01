'use server';
import handleDBConnection from '@/lib/database';
import Item from '@/lib/models/item.model';
import WorkOrder from '@/lib/models/workOrder.model';

const createWorkOrder = async (workOrderData: any, items: any) => {
  console.log(workOrderData);
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const obj = new WorkOrder({ ...workOrderData });

    const workOrderExists = await WorkOrder.findOne({
      workOrderNumber: workOrderData.workOrderNumber,
    });

    if (workOrderExists) {
      return {
        success: false,
        message: 'A Work Order Exists with this Number',
        status: 400,
      };
    }

    const workOrderSaved = await obj.save();

    if (!workOrderSaved) {
      return {
        success: false,
        message: 'Error Saving Work Order',
        status: 400,
      };
    }

    const workOrderId = workOrderSaved._id;
    console.log(items, 'yeh items toh aay ehn');
    const itemsObjects = items.map((ele: any) => ({
      ...ele,
      workOrder: workOrderId,
    }));
    console.log('yerhe objects biya', itemsObjects);
    const itemsSaved = await Promise.all(
      itemsObjects.map(async (itemObj: any) => {
        const newItem = new Item(itemObj);
        console.log('Item Obj', newItem);
        await newItem.save();
      })
    );
    console.log('yeh to save hue hn', itemsSaved);
    return {
      success: true,
      message: 'Work Order With Items Saved',
      status: 200,
      data: JSON.stringify({
        workOrder: workOrderSaved,
        items: itemsSaved,
      }),
    };
  } catch (error) {
    console.error('Error saving work order and items:', error);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: error.message || 'Unknown error occurred',
    };
  }
};

export { createWorkOrder };

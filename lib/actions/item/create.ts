"use server";

import handleDBConnection from "@/lib/database";
import Item from "@/lib/models/item.model";
import WorkOrder from "@/lib/models/workOrder.model";
import mongoose, { Schema } from "mongoose";

const createItem = async (itemData: any, workOrderNumber: string) => {
      const dbConnection = await handleDBConnection();
      if (!dbConnection.success) return dbConnection;
  try {
  
    const workOrderDoc = await WorkOrder.findOne({
      workOrderNumber: workOrderNumber,
    });
    if (!workOrderDoc) {
      return {
        success: false,
        status: 404,
        message: "No WorkOrder Found for the given Number",
      };
    }
    const workOrderDocId = workOrderDoc._id;
    console.log(workOrderDocId);
    const ifExists = await Item.find({
      workOrder: workOrderDocId,
      itemNumber: itemData.itemNumber,
    });
    console.log(ifExists);
    if (!(ifExists.length === 0)) {
      return {
        success: false,
        status: 400,
        message: `item Number ${itemData.itemNumber} already associated with workORder ${workOrderNumber}`,
      };
    }

    const obj = new Item({
      ...itemData,
      workOrder: workOrderDocId,
    });

    const result = await obj.save();

    return {
      success: true,
      status: 200,
      message: "Item Added with given WorkOrder",
      data: result,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: JSON.stringify(err.message) || "An Unknown Error Occurred",
    };
  }
};

export { createItem };

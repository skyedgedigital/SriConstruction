'use server'

import handleDBConnection from "@/lib/database";
import Store from "@/lib/models/storeManagement.model";
import { ToolSchema } from "@/lib/models/tool.model";
import mongoose from "mongoose";

const ToolModel = mongoose.models.Tool || mongoose.model("Tool", ToolSchema);

const fetchStoreManagment = async(vehicleNumber:string) => {
   const dbConnection = await handleDBConnection();
   if (!dbConnection.success) return dbConnection;
    try {
        
        const resp = await Store.find({
            vehicleNumber:vehicleNumber
        }).populate("tool","toolName")
        console.log(resp)
        return {
          success: true,
          status: 200,
          message: "Consumable saved",
          data: JSON.stringify(resp),
        };
      } catch (err) {
        return {
          err: JSON.stringify(err),
          success: false,
          status: 500,
          message: "Error saving consumable",
        };
      }
}

export {fetchStoreManagment}
'use server'

import handleDBConnection from "@/lib/database";
import Store from "@/lib/models/storeManagement.model";

const deleteStoreManagment = async(toolId:any) => {
   const dbConnection = await handleDBConnection();
   if (!dbConnection.success) return dbConnection;
    try {
        const resp = await Store.findByIdAndDelete(toolId);
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

export {deleteStoreManagment}
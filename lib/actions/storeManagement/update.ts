'use server'

import handleDBConnection from "@/lib/database";
import Store from "@/lib/models/storeManagement.model";
import Tool from "@/lib/models/tool.model";

const updateStoreManagment = async(toolId:any,updatesObjString:string) => {
   const dbConnection = await handleDBConnection();
   if (!dbConnection.success) return dbConnection;
    try {
        let updatesObj = JSON.parse(updatesObjString)
        let resp = await Store.findOneAndUpdate({_id:toolId},updatesObj,{
            new:true
        })
    
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

const returnTool = async(storeManagementId:any) => {
   const dbConnection = await handleDBConnection();
   if (!dbConnection.success) return dbConnection;
  try{
    const storeUpdation = await Store.findOneAndUpdate({
      _id:storeManagementId
    },{
      returned:true
    },{
      new:true
    })
    const toolId = storeUpdation.tool;
    const quantity = storeUpdation.quantity;
    const toolQuantityUpdation = await Tool.findOneAndUpdate({
      _id:toolId
    },
    {
      $inc:{
        quantity:quantity
      }
    },
    {
      new:true
    }
    )
    return{
      success:true,
      status:200,
      message:'Tool Returned and Storage updated',
      data:JSON.stringify(toolQuantityUpdation)
    }
  }
  catch(err){
    return {
      err: JSON.stringify(err),
      success: false,
      status: 500,
      message: "Error saving consumable",
    };
  }
}

export {updateStoreManagment,returnTool}
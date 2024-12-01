'use server'

import handleDBConnection from "@/lib/database";
import Tool from "@/lib/models/tool.model";

const updateTool = async(toolId:any,updatesString:string) => {
     const dbConnection = await handleDBConnection();
     if (!dbConnection.success) return dbConnection;
    try{
        const filter = {
            _id:toolId
        }
        const updateObj = JSON.parse(updatesString)
        const updatedTool = await Tool.findOneAndUpdate(filter,updateObj,{new:true})
        return{
            success:true,
            message:'Tool updated successfully',
            data:updatedTool,
            status:200
        }
    }
    catch(err){
        return{
            success:false,
            message:'Internal Server Error',
            err:JSON.stringify(err),
            status:500
        }
    }   
}

export {updateTool}
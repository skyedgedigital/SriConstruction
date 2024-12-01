'use server'

import handleDBConnection from "@/lib/database";
import Tool from "@/lib/models/tool.model";

const deleteTool = async(toolId:any) => {
     const dbConnection = await handleDBConnection();
     if (!dbConnection.success) return dbConnection;
    try{
        const resp = await Tool.findByIdAndDelete(toolId);
        if(resp){
            return{
                success:true,
                message:'Tool Deleted Successfully',
                status:200
            }
        }
        else{
            return{
                success:false,
                message:'Tool not Found',
                status:404
            }
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

export {deleteTool}
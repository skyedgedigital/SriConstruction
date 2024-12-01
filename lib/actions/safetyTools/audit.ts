'use server'

import handleDBConnection from "@/lib/database";
import ToolAudit from "@/lib/models/safetyPanel/tools/toolAudit.model";



const genAudit = async(dataString:string) => {
     const dbConnection = await handleDBConnection();
     if (!dbConnection.success) return dbConnection;
    try{
        const dataObj = JSON.parse(dataString)
        const Obj = new ToolAudit({
            ...dataObj
        })
        const result = await Obj.save()
        return{
            success:true,
            message:'Check List Added',
            status:200,
            data:JSON.stringify(result)
        }
    }
    catch(err){
        return{
            status:500,
            message:'Internal Server Error',
            err:JSON.stringify(err),
            success:false
        }
    }
}

const getAuditAll = async() => {
     const dbConnection = await handleDBConnection();
     if (!dbConnection.success) return dbConnection;
    try{
        const result = await ToolAudit.find({});
        return{
            success:true,
            status:200,
            message:'Audit Fetched',
            data:JSON.stringify(result)
            }
    }
    catch(err){
        console.log(err);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
      err: JSON.stringify(err),
    };
    }
}

const deleteAuditById = async(ppeId:any) => {
     const dbConnection = await handleDBConnection();
     if (!dbConnection.success) return dbConnection;
    try{
        const result = await ToolAudit.deleteOne({_id:ppeId});
        return{
            success:true,
            status:200,
            message:'Audit Deleted'
        }
    }
    catch(err){
        console.log(err)
        return{
            success:false,
            status:500,
            message:'Internal Server Error',
            err:JSON.stringify(err)
        }
    }
}

export {genAudit,getAuditAll,deleteAuditById}
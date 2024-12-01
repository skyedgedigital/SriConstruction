'use server'

import handleDBConnection from "@/lib/database";
import EsiLocation from "@/lib/models/HR/EsiLocation.model";

const deleteEsiLocation = async(docId:any) => {
        const dbConnection = await handleDBConnection();
        if (!dbConnection.success) return dbConnection;
    try{
        const resp = await EsiLocation.findOneAndDelete({
            _id:docId
        })
        if(resp){
            return {
                success:true,
                status:200,
                message:'Deleted Successfully',
                data:resp
            }
        }
        else{
            return{
                success:false,
                status:404,
                message:'EsiLocation Not Found',
                data:null
            }
        }
    }
    catch(err){
        return {
            success:false,
            status:500,
            message:'Internal Server Error',
            err:JSON.stringify(err)
        }
    }
}

export {deleteEsiLocation}
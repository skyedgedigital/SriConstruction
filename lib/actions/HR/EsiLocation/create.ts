'use server'

import handleDBConnection from "@/lib/database";
import EsiLocation from "@/lib/models/HR/EsiLocation.model";

const createEsiLocation = async(dataString:string) => {
        const dbConnection = await handleDBConnection();
        if (!dbConnection.success) return dbConnection;
    try{
        const dataObj = JSON.parse(dataString)
        const Obj = new EsiLocation({...dataObj})
        const resp = await Obj.save();
        return{
            success:true,
            status:200,
            data:JSON.stringify(resp),
            message:'Entry Added'
        }
    }
    catch(err){
        return{
            success:false,
            message:'Internal Server Error',
            error:JSON.stringify(err),
            status:500
        }
    }
}

export {createEsiLocation}
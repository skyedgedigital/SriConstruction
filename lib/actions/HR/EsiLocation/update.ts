'use server'

import handleDBConnection from "@/lib/database";
import EsiLocation from "@/lib/models/HR/EsiLocation.model";

const updateEsiLocation = async(dataString:string,docId:any) => {
        const dbConnection = await handleDBConnection();
        if (!dbConnection.success) return dbConnection;
    try{
        const data = JSON.parse(dataString);
        const designation = await EsiLocation.findByIdAndUpdate(docId,data,{new:true});
        return{
            successs:true,
            status:200,
            message:'Designation Updated Successfully',
            data:JSON.stringify(designation)
        }
    }
    catch(err){
        return {
            success: false,
            message: "Internal Server Error",
            status: 500,
            error: JSON.stringify(err),
          };
    }
}

export {updateEsiLocation}
'use server'

import handleDBConnection from "@/lib/database";
import Site from "@/lib/models/HR/siteMaster.model";

const createSiteMaster = async(dataString:string) => {
        const dbConnection = await handleDBConnection();
        if (!dbConnection.success) return dbConnection;
    try{
        const data = JSON.parse(dataString);
        const Obj = new Site({
            ...data
        })
        const resp = await Obj.save()
        return{
            success: true,
            message: "Site Created Successfully",
            status: 200,
            data:JSON.stringify(resp)
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

export {createSiteMaster}
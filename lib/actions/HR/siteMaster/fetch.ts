'use server'

import handleDBConnection from "@/lib/database";
import Site from "@/lib/models/HR/siteMaster.model";

const fetchSiteMaster = async() => {
        const dbConnection = await handleDBConnection();
        if (!dbConnection.success) return dbConnection;
    try{
        const siteMaster = await Site.find({});

        return{
            success: true,
            message: "Site Master Fetched Successfully",
            status: 200,
            data:JSON.stringify(siteMaster)
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

export {fetchSiteMaster}
'use server'
import handleDBConnection from "@/lib/database";
import Site from "@/lib/models/HR/siteMaster.model";

const deleteSiteMaster = async(docId:any) => {
        const dbConnection = await handleDBConnection();
        if (!dbConnection.success) return dbConnection;
    try{
        const resp = await Site.findOneAndDelete({
            _id:docId
        })
        return {
            success:true,
            status:200,
            message:'Employee Data Deleted Successfully'
        }
    }   
    catch(err){
        return{
            success:false,
            status:500,
            message:'Internal Server Error',
            error:JSON.stringify(err)
        }
    }
}

export {deleteSiteMaster}
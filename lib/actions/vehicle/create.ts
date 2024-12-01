'use server'

import handleDBConnection from "@/lib/database";
import Vehicle from "@/lib/models/vehicle.model";

const createVehicle = async(data:any) => {
     const dbConnection = await handleDBConnection();
     if (!dbConnection.success) return dbConnection;
    try{
        console.log(data)
        const findExistingVehicle = await Vehicle.findOne({
            vehicleNumber:data.vehicleNumber
        })
        if(findExistingVehicle){
            return {
                success:false,
                status:403,
                message:'A Vehicle with the given Number already Exists'
            }
        }
        const obj = new Vehicle({
            ...data
        })
        console.table(obj)
        const resp = await obj.save();
        console.log(resp);
        return {
            success:true,
            status:201,
            message:'Vehicle Added Successfully'
        }
    }
    catch(err){
        return {
            success:false,
            status:500,
            message:'Internal Server Error',
            error:JSON.stringify(err)
        }
    }
}

export {createVehicle}
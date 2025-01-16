'use server'

import handleDBConnection, { connectToDB } from "@/lib/database";
import WorkOrder from "@/lib/models/workOrder.model";

const deleteWorkOrder = async(workOrderNumber:string) => {
     const dbConnection = await handleDBConnection();
     if (!dbConnection.success) return dbConnection;
    try{
        const findWorkOrder = await WorkOrder.findOne({
            workOrderNumber:workOrderNumber
        })
        console.log(findWorkOrder)
        if(!findWorkOrder){
            return {
                success:false,
                message:'Work Order with the given number not exists',
                status:400
            }
        }
        await WorkOrder.findByIdAndDelete({
           _id: findWorkOrder._id,
        })
        return {
            success:true,
            status:200,
            message:`${workOrderNumber} work order deleted`
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

const deleteAllWorkOrder = async() => {
    const dbConnection = await handleDBConnection();
     if (!dbConnection.success) return dbConnection;
    try{
        const result = await WorkOrder.deleteMany({})
        return{
            success:true,
            status:200,
            message:'WorkOrders Deleted'
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

export {deleteWorkOrder,deleteAllWorkOrder}
import mongoose, { Document } from "mongoose";

interface IConsumables extends Document{
    vehicle:mongoose.Schema.Types.ObjectId,
    vehicleNumber:string,
    consumableItem:string,
    quantity:number,
    amount:number,
    date:Date,
    createdAt:Date,
    updatedAt:Date,
    month:string,
    year:string,
    DocId:string
}

export default IConsumables
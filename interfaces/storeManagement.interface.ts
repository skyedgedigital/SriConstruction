import mongoose, { Document } from "mongoose";

interface IStore extends Document{
    tool:mongoose.Schema.Types.ObjectId,
    vehicleNumber:string,
    quantity:number,
    dateOfAllotment:Date,
    dateOfReturn:Date,
    createdAt:Date,
    updatedAt:Date,
    returned:boolean,
    totalPrice:number
}

export default IStore
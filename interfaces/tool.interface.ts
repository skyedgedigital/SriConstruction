import { Document } from "mongoose";

interface ITool extends Document{
    toolName:string,
    quantity:number,
    createdAt:Date,
    updatedAt:Date,
    price:number
}

export default ITool;
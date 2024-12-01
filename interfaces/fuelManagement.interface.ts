import { Document } from "mongoose";

interface IFuelManagement extends Document{
    vehicleNumber:string,
    fuel:number,
    amount:number,
    date:Date,
    meterReading:string,
    month:string,
    year:string,
    createdAt:Date,
    updatedAt:Date,
    DocId:string,
    entry:boolean,
    chalan:string,
    duration:number
}

export default IFuelManagement;
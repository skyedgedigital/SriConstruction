import mongoose from "mongoose";

export interface IWages {
    employee:mongoose.Schema.Types.ObjectId;
    designation:mongoose.Schema.Types.ObjectId;
    month:number;
    year:number;
    totalWorkingDays:number;
    attendance:number;
    netAmountPaid:number;
    total:number;
    otherCash:number;
    allowances:number;

    otherCashDescription:string;
    otherDeduction:number;
    otherDeductionDescription:string;
    payRate:number;
}
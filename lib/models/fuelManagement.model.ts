import IFuelManagement from "@/interfaces/fuelManagement.interface";
import mongoose from "mongoose";

const FuelManagementSchema: mongoose.Schema<IFuelManagement> = new mongoose.Schema({
    vehicleNumber:{
        type:String,
        required:true,
    },
    fuel:{
        type:Number,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    },
    meterReading:{
        type:String,
        required:true
    },
    month: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    DocId:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,
    }
})

FuelManagementSchema.pre('save',function(next){
    this.updatedAt = new Date();
    next();
})

const FuelManagement : mongoose.Model<IFuelManagement> = mongoose.models.FuelManagement || mongoose.model("FuelManagement", FuelManagementSchema);
export default FuelManagement;
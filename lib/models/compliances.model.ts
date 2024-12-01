import ICompliance from "@/interfaces/compliance.interface";
import mongoose, { Schema } from "mongoose";

const CompliancesSchema:mongoose.Schema<ICompliance> = new Schema({
    vehicleNumber:{
        type:String,
        required:true,
    },
    compliance:{
        type:String,
        required:true,
    },
    complianceDesc:{
        type:String,
        default:""
    },
    month:{
        type:String,
        required:true
    },
    year:{
        type:String,
        required:true
    },
    DocId:{
        type:String,
        required:true
    },
    Date:{
        type:Date,
        default:Date.now
    },
    amount:{
        type:Number,
        required:true,
    }
})

const Compliance :  mongoose.Model<ICompliance> = mongoose.models.Compliance || mongoose.model("Compliance",CompliancesSchema)

export default Compliance
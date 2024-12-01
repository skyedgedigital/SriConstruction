import mongoose, { Schema } from "mongoose";

interface IDesignation {
    designation:string;
    basic:string;
    OldBasic:string;
    DA:string;
    OldDA:string;
    PayRate:string;
    Basic2:string
}

const DesignationSchema:mongoose.Schema<IDesignation> = new Schema({
    designation:{
        type:String,
        required:true
    },
    basic:{
        type:String,
        required:true,
    },
    OldBasic:{
        type:String,
        required:true,
    },
    DA:{
        type:String,
        required:true,
    },
    OldDA:{
        type:String,
        required:true,
    },
    PayRate:{
        type:String,
        required:true,
    },
    Basic2:{
        type:String,
        required:true,
    },
})

const Designation : mongoose.Model<IDesignation> = mongoose.models.Designation || mongoose.model("Designation",DesignationSchema)

export default Designation

export {DesignationSchema}

import mongoose, { Schema } from "mongoose";

export interface IDepartmentHr {
    name:string
}

const DepartmentHrSchema:mongoose.Schema<IDepartmentHr> = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    }
})

const DepartmentHr:  mongoose.Model<IDepartmentHr> = mongoose.models.DepartmentHr|| mongoose.model("DepartmentHr",DepartmentHrSchema)

export default DepartmentHr

export {DepartmentHrSchema}
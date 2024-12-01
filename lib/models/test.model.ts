import mongoose, { Schema } from "mongoose";

// itemId:mongoose.Types.ObjectId,
//     name:String

const itemSchema = new Schema({
    itemId:mongoose.Types.ObjectId,
    vehicleNumber:String,
    hours:Number,
    unit:String,
    startTime:String,
    endTime:String
})

const testSchema = new Schema({
    workOrder:{
        type:String,
        required:true
    },
    items:[
        itemSchema
    ]
})

const Test = mongoose.models.Test || mongoose.model("Test",testSchema)

export default Test;
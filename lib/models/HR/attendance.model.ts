import mongoose from "mongoose";

const AttendanceSchema : mongoose.Schema<any> = new mongoose.Schema({
    employee:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"EmployeeData"
    },
    year:{
        type:Number,
        required:true,
    },
    month:{
        type:Number,
        required:true
    },
    days:[{
        day:{
            type:Number,
            required:true,
        },
        status:{
            type:String,
            enum:['Present','Absent','Leave','Half Day','NH','Not Paid'],
            required:true
        }
    }],
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    },
    workOrderHr:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'WorkOrderHr'
    }
})

AttendanceSchema.pre<any>('save',function(next){
    this.updatedAt = new Date();
    next();
})

const Attendance:mongoose.Model<any> = mongoose.models.Attendance || mongoose.model("Attendance",AttendanceSchema);

export default Attendance

export {AttendanceSchema}
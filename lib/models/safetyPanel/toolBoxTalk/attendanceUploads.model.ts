import mongoose , {Schema} from "mongoose";


interface IData{
    link:string;
    name:string;
    date:string;
}

const AttendanceUploadsSchema : mongoose.Schema<IData> = new Schema({
    link:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    date:{
        type:String,
    }
})

const AttendanceUploads : mongoose.Model<IData> = mongoose.models.AttendanceUploads || mongoose.model("AttendanceUploads",AttendanceUploadsSchema);
export default AttendanceUploads;
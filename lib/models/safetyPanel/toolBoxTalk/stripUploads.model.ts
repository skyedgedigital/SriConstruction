import mongoose , {Schema} from "mongoose";


interface IData{
    link:string;
    name:string;
    date:string;
}

const StripUploadsSchema : mongoose.Schema<IData> = new Schema({
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

const StripUploads : mongoose.Model<IData> = mongoose.models.StripUploads || mongoose.model("StripUploads",StripUploadsSchema);
export default StripUploads;
import mongoose , {Schema} from "mongoose";


interface IData{
    link:string;
    name:string;
    date:string;
}

const SiteUploadsSchema : mongoose.Schema<IData> = new Schema({
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

const SiteUploads : mongoose.Model<IData> = mongoose.models.SiteUploads || mongoose.model("SiteUploads",SiteUploadsSchema);
export default SiteUploads;
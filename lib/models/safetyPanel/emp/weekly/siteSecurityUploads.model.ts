import mongoose , {Schema} from "mongoose";


interface IData{
    link:string;
    name:string;
    date:string;
}

const SiteSecurityUploadsSchema : mongoose.Schema<IData> = new Schema({
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


const SiteSecurityUploads : mongoose.Model<IData> = mongoose.models.SiteSecurityUploads || mongoose.model("SiteSecurityUploads",SiteSecurityUploadsSchema)

export default SiteSecurityUploads


import mongoose,{Schema} from "mongoose";

interface ISiteMaster { 
    name:string;
}

const SiteMasterSchema:mongoose.Schema<ISiteMaster> = new Schema({
    name:{
        type:String,
        required:true
    },
})

const Site : mongoose.Model<ISiteMaster> = mongoose.models.Site || mongoose.model("Site",SiteMasterSchema)

export default Site

export {SiteMasterSchema}
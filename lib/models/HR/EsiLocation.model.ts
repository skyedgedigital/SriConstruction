import mongoose , {Schema} from "mongoose";

interface IEsiLocation {
    name:string;
    address:string;
    EsiNo:string;
    branch:string;
}

const EsiLocationSchema:mongoose.Schema<IEsiLocation> = new Schema({
    name:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    EsiNo:{
        type:String,
        required:true,
    },
    branch:{
        type:String,
        required:true,
    }
})

const EsiLocation : mongoose.Model<IEsiLocation> = mongoose.models.EsiLocation || mongoose.model("EsiLocation",EsiLocationSchema)

export default EsiLocation

export {EsiLocationSchema}
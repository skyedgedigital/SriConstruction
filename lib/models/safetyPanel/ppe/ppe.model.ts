
import mongoose, { Schema } from 'mongoose'

interface Ippe{
    category:string;
    subcategory:string;
    quantity:number;
    validity:string;
}

const PpeSchema: mongoose.Schema<Ippe> = new Schema({
    category:{
        type:String,
        required:true,
    },
    subcategory:{
        type:String,
        default:""
    },
    quantity:{
        type:Number,
        default:0,
        required:true
    },
    validity:{
        type:String,
        required:true,
        // default:Date.now
    }
})

const Ppe: mongoose.Model<Ippe> = mongoose.models.Ppe || mongoose.model("Ppe",PpeSchema);

export default Ppe
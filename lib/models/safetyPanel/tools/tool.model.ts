
import mongoose, { Schema } from 'mongoose'

interface ITool{
    category:string;
    subcategory:string;
    quantity:number;
}

const SafetyToolSchema: mongoose.Schema<ITool> = new Schema({
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
})

const SafetyTool: mongoose.Model<ITool> = mongoose.models.SafetyTool || mongoose.model("SafetyTool",SafetyToolSchema);

export default SafetyTool
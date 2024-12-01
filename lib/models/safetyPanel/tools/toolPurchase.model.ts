import mongoose, { Schema } from 'mongoose'

interface IToolP{
    toolId:any;
    date:string;
    quantity:number;
    price:number;
}

const SafetyToolPurchaseSchema:mongoose.Schema<IToolP> = new Schema({
    toolId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'SafetyTool',
        required:true
    },
    date:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    }
})

const SafetyToolPurchase:mongoose.Model<IToolP> = mongoose.models.SafetyToolPurchase || mongoose.model("SafetyToolPurchase",SafetyToolPurchaseSchema);
export default SafetyToolPurchase;
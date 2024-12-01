import mongoose, { Schema } from 'mongoose'

interface IPpeP{
    ppeId:any;
    date:string;
    quantity:number;
    price:number;
}

const PpePurchaseSchema:mongoose.Schema<IPpeP> = new Schema({
    ppeId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Ppe',
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

const PpePurchase:mongoose.Model<IPpeP> = mongoose.models.PpePurchase || mongoose.model("PpePurchase",PpePurchaseSchema);
export default PpePurchase;
import mongoose, { Schema } from 'mongoose'

const ChemicalPurchaseSchema: mongoose.Schema<any> = new Schema({
    chemicalId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Chemical',
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    date:{
        type:String,
        required:true
    }
})

const ChemicalPurchase : mongoose.Model<any> = mongoose.models.ChemicalPurchase || mongoose.model("ChemicalPurchase",ChemicalPurchaseSchema);

export default ChemicalPurchase;

export {ChemicalPurchaseSchema}
import mongoose, { Schema } from "mongoose";

interface IBank {
    name:string;
    branch:string;
    ifsc:string;
    
}

const BankSchema:mongoose.Schema<IBank> = new Schema({
    name:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true,
    },
    ifsc:{
        type:String,
        required:true,
    },

    
})

const Bank : mongoose.Model<IBank> = mongoose.models.Bank || mongoose.model("Bank",BankSchema)

export default Bank

export {BankSchema}
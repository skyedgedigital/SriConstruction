import mongoose, { Schema } from 'mongoose'


interface IChemicalIssueAndReplacementRegister {
    link:string;
    date:string;
}

const ChemicalIssueAndReplacementRegisterSchema : mongoose.Schema<IChemicalIssueAndReplacementRegister> = new Schema({
    link:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true
    },
})

const ChemicalIssueAndReplacementRegister : mongoose.Model<IChemicalIssueAndReplacementRegister> = mongoose.models.ChemicalIssueAndReplacementRegister || mongoose.model("ChemicalIssueAndReplacementRegister",ChemicalIssueAndReplacementRegisterSchema)

export default ChemicalIssueAndReplacementRegister
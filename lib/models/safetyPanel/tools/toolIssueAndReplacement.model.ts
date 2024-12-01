import mongoose, { Schema } from 'mongoose'


interface IToolIssueAndReplacementRegister {
    link:string;
    date:string;
}

const ToolIssueAndReplacementRegisterSchema : mongoose.Schema<IToolIssueAndReplacementRegister> = new Schema({
    link:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true
    },
})

const ToolIssueAndReplacementRegister : mongoose.Model<IToolIssueAndReplacementRegister> = mongoose.models.ToolIssueAndReplacementRegister || mongoose.model("ToolIssueAndReplacementRegister",ToolIssueAndReplacementRegisterSchema)

export default ToolIssueAndReplacementRegister
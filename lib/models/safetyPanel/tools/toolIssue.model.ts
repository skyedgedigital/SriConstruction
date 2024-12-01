import mongoose, { Schema } from 'mongoose'

interface IToolIssue {
    toolId:mongoose.Schema.Types.ObjectId;
    date:string;
    quantity:number;
    issuedTo:mongoose.Schema.Types.ObjectId;
}

const SafetyToolIssueSchema: mongoose.Schema<any> = new Schema({
    toolId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'SafetyTool',
        required:true
    },
    date:{
        type:String,
        required:true
    },
    issuedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'EmployeeData'
    },
    quantity:{
        type:Number,
        required:true,
    }
})

const SafetyToolIssue : mongoose.Model<IToolIssue> = mongoose.models.SafetyToolIssue || mongoose.model("SafetyToolIssue",SafetyToolIssueSchema)

export default SafetyToolIssue
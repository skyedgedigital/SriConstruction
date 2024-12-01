import mongoose, { Schema } from 'mongoose'

interface IPpeIssue {
    ppeId:mongoose.Schema.Types.ObjectId;
    date:string;
    quantity:number;
    issuedTo:mongoose.Schema.Types.ObjectId;
}

const PpeIssueSchema: mongoose.Schema<any> = new Schema({
    ppeId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Ppe',
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

const PpeIssue : mongoose.Model<IPpeIssue> = mongoose.models.PpeIssue || mongoose.model("PpeIssue",PpeIssueSchema)

export default PpeIssue
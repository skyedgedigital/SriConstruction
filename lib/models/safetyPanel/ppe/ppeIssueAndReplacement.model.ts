import mongoose, { Schema } from 'mongoose'

interface IData{
    link:string;
    date:string;
    revNo:string;
    docNo:string;
}


const PpeIssueAndReplacementSchema : mongoose.Schema<IData> = new Schema({
    link: { type: String, required: true },
    date: { type: String },
    revNo: { type: String},
    docNo: { type: String },
})

const PpeIssueAndReplacement : mongoose.Model<IData> = mongoose.models.PpeIssueAndReplacement || mongoose.model("PpeIssueAndReplacement",PpeIssueAndReplacementSchema)

export default PpeIssueAndReplacement
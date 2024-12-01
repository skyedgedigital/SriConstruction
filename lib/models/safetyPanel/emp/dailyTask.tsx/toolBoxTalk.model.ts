import mongoose, { Schema } from 'mongoose'

interface IData{
    link:string;
    docNo:string;
    revNo:string;
    date:string;
}

const ToolBoxTalkSchema : mongoose.Schema<IData> = new Schema({
    link: { type: String, required: true },
    docNo: { type: String, required: true },
    revNo: { type: String, required: true },
    date: { type: String, required: true },
})

const ToolBoxTalk: mongoose.Model<IData> = mongoose.models.ToolChecking || mongoose.model("ToolChecking",ToolBoxTalkSchema)

export default ToolBoxTalk
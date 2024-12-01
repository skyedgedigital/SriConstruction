import mongoose, { Schema } from 'mongoose'

interface IData{
    link:string;
    date:string;
    revNo:string;
    docNo:string;
}

const CorrectiveAndPreventiveSchema : mongoose.Schema<IData> = new Schema({
    link: { type: String, required: true },
    date: { type: String },
    revNo: { type: String},
    docNo: { type: String },
})

const CorrectiveAndPreventive : mongoose.Model<IData> = mongoose.models.CorrectiveAndPreventive || mongoose.model("CorrectiveAndPreventive",CorrectiveAndPreventiveSchema)

export default CorrectiveAndPreventive
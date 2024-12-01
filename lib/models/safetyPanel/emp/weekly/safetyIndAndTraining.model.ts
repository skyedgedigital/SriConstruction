import mongoose, { Schema } from 'mongoose'

interface IData{
    link:string;
    date:string;
    revNo:string;
    docNo:string;
}

const SafetyIndAndTrainingSchema : mongoose.Schema<IData> = new Schema({
    link: { type: String, required: true },
    date: { type: String },
    revNo: { type: String},
    docNo: { type: String },
})

const SafetyIndAndTraining : mongoose.Model<IData> = mongoose.models.SafetyIndAndTraining || mongoose.model("SafetyIndAndTraining",SafetyIndAndTrainingSchema)

export default SafetyIndAndTraining
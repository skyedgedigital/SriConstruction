import mongoose, { Schema } from 'mongoose'

interface IData{
    link:string;
    date:string;
    revNo:string;
    docNo:string;
}

const HouseKeepingAuditSchema : mongoose.Schema<IData> = new Schema({
    link: { type: String, required: true },
    date: { type: String },
    revNo: { type: String},
    docNo: { type: String },

})

const HouseKeepingAudit : mongoose.Model<IData> = mongoose.models.HouseKeepingAudit || mongoose.model("HouseKeepingAudit",HouseKeepingAuditSchema)

export default HouseKeepingAudit;


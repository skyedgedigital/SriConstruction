import mongoose, { Schema } from 'mongoose'

interface IAudit{
    link:string;
    date:string;
    docNo:string;
    revNo:string;
}

const AuditSchema: mongoose.Schema<IAudit> = new Schema({
    link:{
        type:String,
        required:true,
    },
    date:{
        type:String,
    },
    docNo:{
        type:String,
    },
    revNo:{
        type:String,
    }
})

const Audit : mongoose.Model<IAudit> = mongoose.models.Audit || mongoose.model("Audit",AuditSchema)

export default Audit
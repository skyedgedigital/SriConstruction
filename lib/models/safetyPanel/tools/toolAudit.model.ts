import mongoose, { Schema } from 'mongoose'

interface IToolAudit{
    link:string;
    date:string;
    docNo:string;
    revNo:string;
}

const ToolAuditSchema: mongoose.Schema<IToolAudit> = new Schema({
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

const ToolAudit : mongoose.Model<IToolAudit> = mongoose.models.ToolAudit || mongoose.model("ToolAudit",ToolAuditSchema)

export default ToolAudit
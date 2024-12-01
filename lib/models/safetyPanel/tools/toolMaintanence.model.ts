import mongoose, { Schema } from 'mongoose'

interface IToolMaintanence{
    link:string;
    date:string;
    docNo:string;
    revNo:string;
}

const ToolMaintanenceSchema: mongoose.Schema<IToolMaintanence> = new Schema({
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

const ToolMaintanence : mongoose.Model<IToolMaintanence> = mongoose.models.ToolMaintanence || mongoose.model("ToolMaintanence",ToolMaintanenceSchema)

export default ToolMaintanence
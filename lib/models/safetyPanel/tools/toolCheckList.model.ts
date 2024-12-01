import mongoose, { Schema } from 'mongoose'

interface IToolCheckList{
    link:string;
    date:string;
    docNo:string;
    revNo:string;
}

const ToolCheckListSchema: mongoose.Schema<IToolCheckList> = new Schema({
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

const ToolCheckList : mongoose.Model<IToolCheckList> = mongoose.models.ToolCheckList || mongoose.model("ToolCheckList",ToolCheckListSchema)

export default ToolCheckList
import mongoose, { Schema } from 'mongoose'


interface IToolBoxTalk {
    link:string;
    date:string;
    sheetNo:string;
    revNo:string;
}

const ToolBoxTalkSchema : mongoose.Schema<IToolBoxTalk> = new Schema({
    link:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true
    },
    sheetNo:{
        type:String
    },
    revNo:{
        type:String
    }
})

const ToolBoxTalk : mongoose.Model<IToolBoxTalk> = mongoose.models.ToolBoxTalk || mongoose.model("ToolBoxTalk",ToolBoxTalkSchema)

export default ToolBoxTalk
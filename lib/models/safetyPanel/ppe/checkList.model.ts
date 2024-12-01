import mongoose, { Schema } from 'mongoose'

interface ICheckList{
    link:string;
    date:string;
    docNo:string;
    revNo:string;
}

const CheckListSchema: mongoose.Schema<ICheckList> = new Schema({
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

const CheckList : mongoose.Model<ICheckList> = mongoose.models.CheckList || mongoose.model("CheckList",CheckListSchema)

export default CheckList
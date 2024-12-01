import mongoose, { Schema } from 'mongoose'

interface IMonthlyTask{
    day:string;
    month:string;
    year:string;
    event:string;
}

const MonthlyTaskSchema: mongoose.Schema<IMonthlyTask> = new Schema({
    day:{
        type:String,
        required:true
    },
    month:{
        type:String,
        required:true
    },
    year:{
        type:String,
        required:true
    },
    event:{
        type:String,
        required:true
    }
})

const MonthlyTask: mongoose.Model<IMonthlyTask> = mongoose.models.MonthlyTask || mongoose.model("MonthlyTask",MonthlyTaskSchema);

export default MonthlyTask
import mongoose from "mongoose";

const DailyUtilisationSchema: mongoose.Schema<any> = new mongoose.Schema({
    vehicle:{
        type:mongoose.Types.ObjectId,
        ref:"Vehicle"
    },
    date:{
        type:Date
    },
    location:{
        type:String
    },
    jobStart:{
        type:String
    },
    jobEnd:{
        type:String
    },
    permitNumber:{
        type:String
    },
    costCenter:{
        type:String
    },
    dep:{
        type:String
    },
    engineer:{
        type:String
    },
    workOrder:{
        type:mongoose.Types.ObjectId,
        ref:'WorkOrder'
    },
    month:{
        type:Number
    },
    year:{
        type:Number
    }
})

const DailyUtilisation : mongoose.Model<any> = mongoose.models.DailyUtilisation || mongoose.model('DailyUtilisation',DailyUtilisationSchema);

export default DailyUtilisation;
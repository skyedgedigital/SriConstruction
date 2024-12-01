import mongoose, { Schema } from 'mongoose'

interface IToolM{
    toolId:any;
    quantity:number;
    type:string;
    date:string;
}

const SafetyToolMaintenanceSchema : mongoose.Schema<IToolM> = new Schema({
    toolId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'SafetyTool',
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    type:{
        type:String
    },
    date:{
        type:String
    }
})

const SafetyToolMaintenance:mongoose.Model<IToolM> = mongoose.models.SafetyToolMaintenance || mongoose.model("SafetyToolMaintenance",SafetyToolMaintenanceSchema)

export default SafetyToolMaintenance
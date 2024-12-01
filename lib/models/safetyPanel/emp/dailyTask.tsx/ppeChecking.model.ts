import mongoose, { Schema } from 'mongoose'

interface IData{
    emp:mongoose.Schema.Types.ObjectId;
    status:boolean;
    remarks:string;
}

interface IToolChecking{
    data: IData[],
    finalRemarks:string;
}

const PpeCheckingSchema : mongoose.Schema<IToolChecking> = new Schema({
    data:[
        {
            emp:{
                type: mongoose.Schema.Types.ObjectId,
                ref:'EmployeeData',
                required:true
            },
            status:{
                type:String,
                required:true,
            },
            remarks:{
                type:String,
            }
        }
    ],
    finalRemarks:{
        type:String,
    }
})

const PpeChecking: mongoose.Model<IToolChecking> = mongoose.models.ToolChecking || mongoose.model("ToolChecking",PpeCheckingSchema)

export default PpeChecking
import mongoose , {Schema} from "mongoose";

interface IChemicalIssue  {
    chemicalId:mongoose.Schema.Types.ObjectId;
    date:string;
    quantity:number;
    issuedTo:mongoose.Schema.Types.ObjectId;
}

const ChemicalIssueSchema : mongoose.Schema<IChemicalIssue> = new Schema({
    chemicalId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Chemical',
        required:true
    },
    date:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    issuedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'EmployeeData'
    }
})

const ChemicalIssue : mongoose.Model<IChemicalIssue> = mongoose.models.ChemicalIssue || mongoose.model("ChemicalIssue",ChemicalIssueSchema);

export default ChemicalIssue;

export {ChemicalIssueSchema}
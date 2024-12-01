import mongoose, { Schema } from "mongoose";

const BonusSchema = new Schema({
    year: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    },
});

const LeaveSchema = new Schema({
    year: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    },
});

const FinalSettlementSchema:mongoose.Schema<any> = new Schema({
    employee:{
        type: Schema.Types.ObjectId,
        ref: 'EmployeeData',
    },
    bonus: [BonusSchema],
    leave: [LeaveSchema],

    
})

const FinalSettlement : mongoose.Model<any> = mongoose.models.FinalSettlement || mongoose.model("FinalSettlement",FinalSettlementSchema)

export default FinalSettlement

export {FinalSettlementSchema}
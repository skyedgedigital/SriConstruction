import mongoose, { Schema } from "mongoose";

const SafetyToolSchema = new Schema({
    toolNumber: {
        type: String,
        required: true,
    },
    toolSubGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ToolSubGroup',
        required: true,
    },
    purchaseDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['available', 'issued', 'returned', 'replaced'],
        default: 'available',
    },
    condition: {
        type: String,
        enum: ['ok', 'not ok'],
        default: 'ok',
    },
    actionTaken: {
        type: String,
    },
    cost: {
        type: Number,
    },
    issuedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmployeeData',
    },
    issueDate: {
        type: Date,
    },
    returnDate: {
        type: Date,
    },
});

const SafetyTool = mongoose.models.SafetyTool || mongoose.model('SafetyTool', SafetyToolSchema);

// export default SafetyTool;


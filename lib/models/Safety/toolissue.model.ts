import mongoose, { Schema } from "mongoose";

const ToolIssueSchema = new Schema({
    toolSubGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ToolSubGroup',
        required: true,
    },
    tools: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SafetyTool',
            required: true,
        }
    ],
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmployeeData',
        required: true,
    },
    issueDate: {
        type: Date,
        required: true,
    },
    returnDate: {
        type: Date,
    },
    issueStatus: {
        type: String,
        enum: ['issued', 'returned'],
        default: 'issued',
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const ToolIssue = mongoose.models.ToolIssue || mongoose.model('ToolIssue', ToolIssueSchema);

// export default ToolIssue;

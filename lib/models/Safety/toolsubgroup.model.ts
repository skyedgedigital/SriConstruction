import mongoose, { Schema } from "mongoose";


const ToolSubGroupSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    quantity: {
        type: Number,
        required: true,
    },
    // availableQuantity: {
    //     type: Number,
    // },
    toolGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ToolGroup',
        required: true,
    },
});

const ToolSubGroup = mongoose.models.ToolSubGroup || mongoose.model('ToolSubGroup', ToolSubGroupSchema);

// export default ToolSubGroup;

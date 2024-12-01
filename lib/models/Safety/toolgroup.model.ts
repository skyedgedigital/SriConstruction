import mongoose, { Schema } from "mongoose";

const ToolGroupSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
});

const ToolGroup = mongoose.models.ToolGroup || mongoose.model('ToolGroup', ToolGroupSchema);

// export default ToolGroup;

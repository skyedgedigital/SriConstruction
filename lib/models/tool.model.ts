import ITool from "@/interfaces/tool.interface";
import mongoose from "mongoose";

const ToolSchema: mongoose.Schema<ITool> = new mongoose.Schema({
  toolName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price:{
    type:Number,
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ToolSchema.pre<ITool>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Tool: mongoose.Model<ITool> =
  mongoose.models.Tool || mongoose.model("Tool", ToolSchema);

export default Tool;

export {ToolSchema}

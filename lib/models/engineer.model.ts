import { IEngineer } from "@/interfaces/engineer.interface";
import mongoose from 'mongoose'

const EngineerSchema: mongoose.Schema<IEngineer> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
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

// Update 'updatedAt' field before saving the document
EngineerSchema.pre<IEngineer>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Engineer: mongoose.Model<IEngineer> = mongoose.models.Engineer || mongoose.model("Engineer", EngineerSchema);

export default Engineer;

export {EngineerSchema}

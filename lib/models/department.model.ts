import mongoose, { MongooseError } from "mongoose";
import Engineer from "./engineer.model";
import { IDepartment } from "@/interfaces/department.interface";

const DepartmentSchema: mongoose.Schema<IDepartment> = new mongoose.Schema({
  departmentName: {
    type: String,
    required: true,
    unique:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update 'updatedAt' field before saving the document
DepartmentSchema.pre<IDepartment>('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Remove all engineers associated with this department
DepartmentSchema.pre<IDepartment>("deleteOne", async function (next) {
  try {
    await Engineer.deleteMany({ department: this._id });
    next();
  } catch (err: any) {
    next(err)
  }
});

const Department: mongoose.Model<IDepartment> = mongoose.models.Department || mongoose.model("Department", DepartmentSchema);

export default Department;

export {DepartmentSchema}

import mongoose from 'mongoose'
import { IDepartment } from "./department.interface";

export interface IEngineer extends mongoose.Document {
  name: string;
  department: mongoose.PopulatedDoc<IDepartment>;
  createdAt: Date;
  updatedAt: Date;
}

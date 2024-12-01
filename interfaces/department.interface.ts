import mongoose from 'mongoose'

export interface IDepartment extends mongoose.Document {
  departmentName: string;
  createdAt: Date;
  updatedAt: Date;
}

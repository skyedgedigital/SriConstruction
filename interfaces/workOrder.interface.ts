import mongoose from 'mongoose';

export interface IWorkOrder extends mongoose.Document {
  workOrderNumber: string;
  workDescription: string;
  workOrderValue: number;
  workOrderValidity: Date;
  shiftStatus:boolean;
  workOrderBalance: number;
  createdAt: Date;
  updatedAt: Date;
  units:[string];
}

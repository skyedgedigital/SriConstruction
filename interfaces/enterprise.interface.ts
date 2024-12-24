import mongoose from 'mongoose';

export interface IEnterprise extends mongoose.Document {
  name: string;
  pan: string;
  gstin: string;
  vendorCode: string;
  createdAt: Date;
  updatedAt: Date;
  address: string;
  email: string;
}

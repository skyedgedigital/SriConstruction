import mongoose from 'mongoose';
import { IEnterprise } from '@/interfaces/enterprise.interface';

const EnterpriseSchema: mongoose.Schema<IEnterprise> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  pan: {
    type: String,
    required: true,
  },
  gstin: {
    type: String,
    required: true,
  },
  vendorCode: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
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

// Middleware to update 'updatedAt' field before saving the document
EnterpriseSchema.pre<IEnterprise>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Enterprise: mongoose.Model<IEnterprise> =
  mongoose.models.Enterprise || mongoose.model('Enterprise', EnterpriseSchema);

export default Enterprise;

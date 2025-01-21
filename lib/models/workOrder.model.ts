import { IWorkOrder } from '@/interfaces/workOrder.interface';
import mongoose from 'mongoose';

const WorkOrderSchema: mongoose.Schema<IWorkOrder> = new mongoose.Schema({
  workOrderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  workDescription: {
    type: String,
    required: true,
    default: 'No description provided.',
    trim: true,
  },
  workOrderValue: {
    type: Number,
    required: true,
    default: 0,
  },
  workOrderValidity: {
    type: Date,
    required: true,
  },
  workOrderBalance: {
    type: Number,
    required: true,
  },
  units: {
    type: [String],
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

WorkOrderSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const WorkOrder: mongoose.Model<IWorkOrder> =
  mongoose.models.WorkOrder || mongoose.model('WorkOrder', WorkOrderSchema);

export default WorkOrder;

export { WorkOrderSchema };

import { IWages } from '@/interfaces/HR/wages.interface';
import mongoose from 'mongoose';
import { boolean, string } from 'zod';

const WagesSchema: mongoose.Schema<any> = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeData',
    required: true,
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designation',
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  totalWorkingDays: {
    type: Number,
    required: true,
  },
  attendance: {
    type: Number,
    required: true,
  },
  incentiveApplicable: {
    type: Boolean,
    default: false,
  },
  incentiveDays: {
    type: Number,
    default: 0,
  },
  incentiveAmount: {
    type: Number,
    default: 0,
  },
  netAmountPaid: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  //added basic and DA for wages collection
  basic: {
    type: Number,
  },
  DA: {
    type: Number,
  },
  payRate: {
    type: Number,
  },
  otherCash: {
    type: Number,
  },
  allowances: {
    type: Number,
  },
  otherCashDescription: {
    type: String,
  },
  otherDeduction: {
    type: Number,
  },
  advanceDeduction: {
    type: Number,
    default: 0,
  },
  damageDeduction: {
    type: Number,
    default: 0,
  },
  isAdvanceDeduction: {
    type: Boolean,
    default: false,
  },
  isDamageDeduction: {
    type: Boolean,
    default: false,
  },
  otherDeductionDescription: {
    type: String,
  },
  workOrderHr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrderHr',
  },
});

const Wages: mongoose.Model<any> =
  mongoose.models.Wages || mongoose.model('Wages', WagesSchema);

export default Wages;

export { WagesSchema };

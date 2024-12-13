import IInvoice from '@/interfaces/invoice.interface';
import mongoose, { Schema } from 'mongoose';

const InvoiceSchema: mongoose.Schema<IInvoice> = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
  },
  invoiceLink: {
    type: String,
  },
  InvoiceData: {
    type: String,
  },
  SesNo: {
    type: String,
    trim: true,
  },
  DoNo: {
    type: String,
    trim: true,
  },
  chalans: [String],
  pdfLink: {
    type: String,
    trim: true,
  },
  summaryLink: {
    type: String,
    trim: true,
  },
  mergedItems: {
    type: String,
  },
  TaxNumber: {
    type: String,
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

const Invoice: mongoose.Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

export default Invoice;

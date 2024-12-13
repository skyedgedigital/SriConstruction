import { Document, Schema, Types } from 'mongoose';

interface IInvoice extends Document {
  invoiceNumber: string;
  invoiceLink?: string;
  InvoiceData?: string;
  SesNo?: string;
  DoNo?: string;
  chalans?: Types.ObjectId[];
  pdfLink: string;
  summaryLink: string;
  createdAt: Date;
  updatedAt: Date;
  invoiceId: string;
  mergedItems: string;
  TaxNumber?: string;
}

export default IInvoice;

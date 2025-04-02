'use server';

import Invoice from '@/lib/models/invoice.model';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '@/utils/aws';
import { dataUriToBuffer } from 'data-uri-to-buffer';
import FileReader from 'filereader';
import stream from 'stream';
import handleDBConnection from '@/lib/database';
import { ApiResponse } from '@/interfaces/APIresponses.interface';
import { revalidatePath } from 'next/cache';
import { getYearForInvoiceNaming } from '@/utils/getYearForInvoiceNaming';

const checkIfInvoiceExists = async (
  chalanNumbers: string[],
  invoiceNumber: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;

  const sortedChalanNumbers = chalanNumbers.sort().join(',').trim();
  try {
    const result = await Invoice.findOne({
      $or: [
        { invoiceId: sortedChalanNumbers },
        { invoiceNumber: invoiceNumber },
      ],
    });
    console.log('Found invoice', result);
    if (!result) {
      return {
        success: true,
        message: 'No matching Invoice Found',
        status: 200,
        error: null,
        data: null,
      };
    }
    const message =
      result.invoiceId === sortedChalanNumbers
        ? 'Invoice already exists with this chalan'
        : 'Invoice number already exists';
    return {
      success: false,
      message,
      data: JSON.stringify(result),
      status: 400,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unexpected Error occurred, Please try later',
      error: JSON.stringify(err),
      status: 500,
      data: null,
    };
  }
};

const getInvoiceByInvoiceId = async (
  invoiceId: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const ifExists = await Invoice.findOne({
      invoiceId: invoiceId,
    });
    if (!ifExists) {
      return {
        success: false,
        status: 404,
        message: `The Invoice ${invoiceId} not exists`,
        error: null,
        data: null,
      };
    }
    const doc = await Invoice.findOne({
      invoiceId: invoiceId,
    });
    // .populate({
    //   path: "items",
    //   populate: {
    //     path: "item",
    //     model: "Item",
    //   },
    // });
    console.log(doc);
    return {
      success: true,
      message: `Invoice ${invoiceId} fetched`,
      status: 200,
      data: JSON.stringify(doc),
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: 'Unexpected error occurred,Please try later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

function toBase64(blob) {
  const reader = new FileReader();
  return new Promise((res, rej) => {
    reader.readAsArrayBuffer(blob);
    reader.onload = function () {
      res(reader.result);
    };
  });
}

const uploadInvoiceSummaryPDFToS3 = async (summary: string, invoice) => {
  if (!invoice?.invoiceId) {
    throw new Error('Missing invoice ID');
  }

  const elementId = `${invoice.invoiceId}-summary`;

  try {
    const fileName = `${elementId}.pdf`;
    const key = `invoices/${fileName}`; // Customize key structure if needed
    const buffer = dataUriToBuffer(summary);
    console.log(summary);
    console.log(buffer);

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      Key: key,
      Body: buffer.buffer,
      ContentType: 'application/pdf',
    };
    // @ts-ignore
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log(`Invoice PDF uploaded to S3: ${key}`);
    const filter = {
      invoiceId: invoice.invoiceId,
    };
    const update = {
      summaryLink: key,
    };
    const found = await Invoice.findOne({
      invoiceId: invoice.invoiceId,
    });
    console.log('Found Invoice', found);
    const result = await Invoice.findOneAndUpdate(filter, update, {
      new: true,
    });
    return key; // Return uploaded file key (optional)
  } catch (error) {
    console.error('Error uploading invoice PDF to S3:', error);
    throw error; // Re-throw for potential error handling in caller
  }
};

const uploadInvoicePDFToS3 = async (summary: string, invoice) => {
  if (!invoice?.invoiceId) {
    throw new Error('Missing invoice ID');
  }

  const elementId = `${invoice.invoiceId}`;

  try {
    const fileName = `${elementId}.pdf`;
    const key = `invoices/${fileName}`; // Customize key structure if needed
    const buffer = dataUriToBuffer(summary);
    console.log(summary);
    console.log(buffer);

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      Key: key,
      Body: buffer.buffer,
      ContentType: 'application/pdf',
    };
    // @ts-ignore
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log(`Invoice PDF uploaded to S3: ${key}`);
    const filter = {
      invoiceId: invoice.invoiceId,
    };
    const update = {
      pdfLink: key,
    };
    const found = await Invoice.findOne({
      invoiceId: invoice.invoiceId,
    });
    console.log('Found Invoice', found);
    const result = await Invoice.findOneAndUpdate(filter, update, {
      new: true,
    });
    console.log('hotora save', result);
    return key; // Return uploaded file key (optional)
  } catch (error) {
    console.error('Error uploading invoice PDF to S3:', error);
    throw error; // Re-throw for potential error handling in caller
  }
};

const updateInvoice = async (invoiceData): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const { invoiceNumber, SESNo, DONo, TaxNumber } = JSON.parse(invoiceData);

    // Find the invoice by invoiceNumber
    let invoice = await Invoice.findOne({ invoiceNumber });

    if (invoice) {
      // If the invoice exists, update SESNo and DONo
      invoice.SesNo = SESNo;
      invoice.DoNo = DONo;
      invoice.TaxNumber = TaxNumber;
      invoice = await invoice.save();
      return {
        success: true,
        message: 'Invoice updated',
        data: JSON.stringify(invoice),
        status: 200,
        error: null,
      };
    } else {
      // If the invoice doesn't exist, create a new one
      return {
        success: false,
        message: "Invoice doesn't exist",
        status: 400,
        error: null,
        data: null,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message:
        'Unexpected error occurred,Failed to update Invoice, Please try later',
      status: 500,
      error: JSON.stringify(error),
      data: null,
    };
  }
};

const updateInvoiceNumber = async (invoiceData): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const { invoiceNumber, invoiceId } = JSON.parse(invoiceData);

    // Find the invoice by invoiceNumber
    let invoice = await Invoice.findOne({ invoiceId });
    const currentYear = new Date().getFullYear();

    // Construct the new invoiceNumber in the format SE/currentYear/currentYear+1/invoiceNumber
    const formattedInvoiceNumber = `SE/${getYearForInvoiceNaming()}/${invoiceNumber}`;

    if (invoice) {
      // If the invoice exists, update SESNo and DONo
      invoice.invoiceNumber = formattedInvoiceNumber;
      invoice = await invoice.save();
      return {
        success: true,
        message: 'Invoice SES and DO updated',
        data: JSON.stringify(invoice),
        status: 200,
        error: null,
      };
    } else {
      // If the invoice doesn't exist, create a new one
      return {
        success: false,
        message: "Invoice doesn't exist",
        status: 400,
        error: null,
        data: null,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: 'Unexpected error occurred,Please try later',
      status: 500,
      error: JSON.stringify(error),
      data: null,
    };
  }
};

const getAllInvoices = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const docs = await Invoice.find({}).sort({ createdAt: -1 });

    return {
      success: true,
      message: `All Invoices fetched`,
      status: 200,
      data: JSON.stringify(docs),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unexpected error occurred,Please try later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const uploadInvoiceToFireBase = async (
  invoiceId,
  downloadUrl: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;

    const filter = {
      invoiceId: invoiceId,
    };
    const update = {
      pdfLink: downloadUrl,
    };
    const found = await Invoice.findOne({
      invoiceId,
    });
    console.log('Found Invoice', found);
    const result = await Invoice.findOneAndUpdate(filter, update, {
      new: true,
    });
    return {
      success: true,
      message: `Invoice uploaded to Firebase Storage`,
      status: 200,
      data: JSON.stringify(result),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unexpected error occurred,Please try later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const uploadSummaryToFireBase = async (invoiceId, downloadUrl: string) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;

    const filter = {
      invoiceId: invoiceId,
    };
    const update = {
      summaryLink: downloadUrl,
    };
    const found = await Invoice.findOne({
      invoiceId,
    });
    console.log('Found Invoice', found);
    const result = await Invoice.findOneAndUpdate(filter, update, {
      new: true,
    });
    return {
      success: true,
      message: `Invoice uploaded to Firebase Storage`,
      status: 200,
      data: JSON.stringify(result),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unexpected error occurred,Please try later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

function incrementInvoiceNumber(invoiceNumber) {
  // Split the string by '/' to get the last part (which contains the number with leading zeros)
  console.log(invoiceNumber);
  const parts = invoiceNumber.split('/');
  console.log(parts);

  // Extract the last part which is the numeric part (e.g., "0001")
  const lastPart = parts[parts.length - 1];

  // Extract the number from the last part and convert it to an integer
  console.log(lastPart);
  const lastPartNumber = lastPart;
  console.log(lastPartNumber.length);
  const lastNumber = parseInt(lastPartNumber, 10);
  console.log(lastNumber);

  // Increment the number by 1
  const incrementedNumber = lastNumber + 1;

  // Pad the incremented number with leading zeros to match the original format
  const paddedNumber = String(incrementedNumber).padStart(lastPart.length, '0');

  // Return only the incremented and padded number as a string
  return paddedNumber;
}

const generateContinuousInvoiceNumber = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;

    const allInvoiceNumbers = (
      await Invoice.find().select('invoiceNumber')
    ).toSorted(
      (a, b) =>
        Number(a.invoiceNumber.split('/')[2]) -
        Number(b.invoiceNumber.split('/')[2])
    );

    if (!allInvoiceNumbers) {
      return {
        success: false,
        status: 200,
        message:
          'Failed to look invoice numbers in data base to generate new invoice numbers, Please try later',
        data: null,
        error: null,
      };
    }
    console.log('ALL SORTED INVOICE NUMBER', allInvoiceNumbers);
    let latestInvoiceNumber: number;
    if (allInvoiceNumbers.length === 0) {
      latestInvoiceNumber = 1;
    } else {
      latestInvoiceNumber =
        Number(
          allInvoiceNumbers?.[allInvoiceNumbers.length - 1].invoiceNumber.split(
            '/'
          )[2]
        ) + 1;
    }
    console.log('latest invoice number', latestInvoiceNumber);
    if (!latestInvoiceNumber) {
      return {
        success: false,
        status: 200,
        message: 'Failed to generate next invoice number, Please try later',
        data: null,
        error: null,
      };
    }
    return {
      success: true,
      status: 200,
      message: 'Latest Doc Number recieved',
      data: JSON.stringify(latestInvoiceNumber),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected error occurred,Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};
const generateContinuousTaxInvoiceNumber = async (): Promise<
  ApiResponse<any>
> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;

    const allTaxInvoiceNumbers = (
      await Invoice.find({
        $and: [{ TaxNumber: { $ne: null } }, { TaxNumber: { $ne: '' } }],
      })
    ).toSorted((a, b) => {
      if (a.TaxNumber && b.TaxNumber)
        return (
          Number(a.TaxNumber.split('/')[2]) - Number(b.TaxNumber.split('/')[2])
        );
    });

    if (!allTaxInvoiceNumbers) {
      return {
        success: false,
        status: 200,
        message:
          'Failed to look invoice numbers in data base to generate new invoice numbers, Please try later',
        data: null,
        error: null,
      };
    }
    console.log('ALL SORTED TAX INVOICE NUMBER', allTaxInvoiceNumbers);
    const latestTaxInvoiceNumber =
      Number(
        allTaxInvoiceNumbers?.[allTaxInvoiceNumbers.length - 1].TaxNumber.split(
          '/'
        )[2]
      ) + 1;
    console.log('latest invoice number', latestTaxInvoiceNumber);
    if (!latestTaxInvoiceNumber) {
      return {
        success: false,
        status: 200,
        message: 'Failed to generate next invoice number, Please try later',
        data: null,
        error: null,
      };
    }
    return {
      success: true,
      status: 200,
      message: 'Latest Doc Number recieved',
      data: JSON.stringify(latestTaxInvoiceNumber),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected error occurred,Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const deleteInvoiceById = async (id: string) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const invoiceExist = await Invoice.find({ _id: id });
    if (!invoiceExist) {
      revalidatePath('/fleetmanager/invoice-management');
      return {
        success: false,
        status: 200,
        message: 'Invoice does not exist',
        data: null,
        error: null,
      };
    }

    await Invoice.deleteOne({ _id: id });
    revalidatePath('/fleetmanager/invoice-management');
    return {
      success: true,
      status: 204,
      message: 'Invoice Successfully Deleted',
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: err.message || 'Unexpected error occurred,Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const getLastTwoInvoiceNumbers = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const latestDoc = await Invoice.find()
      .sort({
        _id: -1,
      })
      .select('invoiceNumber')
      .limit(2);
    console.log('LATEST TWO DOC', latestDoc);

    return {
      success: true,
      status: 200,
      message: 'Latest Doc Number recieved',
      data: JSON.stringify(latestDoc),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected error occurred,Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};
export {
  updateInvoice,
  checkIfInvoiceExists,
  getInvoiceByInvoiceId,
  uploadInvoicePDFToS3,
  uploadInvoiceSummaryPDFToS3,
  updateInvoiceNumber,
  getAllInvoices,
  uploadInvoiceToFireBase,
  uploadSummaryToFireBase,
  generateContinuousInvoiceNumber,
  deleteInvoiceById,
  getLastTwoInvoiceNumbers,
  generateContinuousTaxInvoiceNumber,
};

'use server';

import Invoice from '@/lib/models/invoice.model';
import Chalan from '@/lib/models/chalan.model';
import handleDBConnection from '@/lib/database';
import { ApiResponse } from '@/interfaces/APIresponses.interface';

const getPhysicalChalansOfInvoice = async (
  invoiceNumber: string,
  createdAt: any
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const invoice = await Invoice.findOne({
      invoiceNumber: invoiceNumber,
      createdAt: createdAt,
    }).exec();
    if (!invoice) {
      return {
        success: false,
        status: 404,
        message: `Invoice number ${invoiceNumber} does not exist`,
        error: `Invoice number ${invoiceNumber} does not exist`,
        data: null,
      };
    }
    const chalansArr = invoice.chalans;
    console.log(chalansArr);
    const chalansPromises = chalansArr.map(async (ele) => {
      const chalan = await Chalan.findOne({ chalanNumber: ele }).exec(); // Add exec() to ensure the query is executed
      return { chalanNumber: chalan?.chalanNumber, file: chalan?.file }; // Return the file property
    });
    const res = await Promise.all(chalansPromises);
    return {
      success: true,
      status: 200,
      message: 'Physical Chalans Fetched',
      data: JSON.stringify(res),
      error: null,
    };
  } catch (err) {
    console.error('Error fetching chalans:', err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to fetch physical chalan,Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { getPhysicalChalansOfInvoice };

'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Bank from '@/lib/models/HR/bank.model';
import { revalidatePath } from 'next/cache';
const createBank = async (dataString: string): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataObj = JSON.parse(dataString);
    const Obj = new Bank({ ...dataObj });
    const resp = await Obj.save();
    revalidatePath('/hr/bank');
    return {
      success: true,
      status: 200,
      data: JSON.stringify(resp),
      message: 'Entry Added',
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to create bank, Please Try Later',
      error: JSON.stringify(err),
      status: 500,
      data: null,
    };
  }
};

export { createBank };

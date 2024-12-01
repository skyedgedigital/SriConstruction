'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Bank from '@/lib/models/HR/bank.model';
import { revalidatePath } from 'next/cache';

const updateBank = async (
  dataString: string,
  docId: any
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    const bank = await Bank.findByIdAndUpdate(docId, data, { new: true });
    revalidatePath('/hr/bank');
    return {
      success: true,
      status: 200,
      message: 'Bank Updated Successfully',
      data: JSON.stringify(bank),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to update bank, Please Try Later',
      status: 500,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { updateBank };

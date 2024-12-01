'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import Consumable from '@/lib/models/consumables.model';

const updateConsumables = async (
  consumableId: any,
  updatesString: string
): Promise<ApiResponse<any>> => {
  try {
    let updatesObj = JSON.parse(updatesString);
    const resp = await Consumable.findByIdAndUpdate(consumableId, updatesObj, {
      new: true,
    });
    return {
      success: true,
      status: 200,
      message: 'Consumable saved',
      data: JSON.stringify(resp),
      error: null,
    };
  } catch (err) {
    return {
      error: JSON.stringify(err),
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to create Compliance, Please try later',
      data: null,
    };
  }
};

export { updateConsumables };

'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Consumable from '@/lib/models/consumables.model';

let months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
let years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];

const createConsumables = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    let dataObj = JSON.parse(dataString);
    const dateField = new Date(dataObj.date);
    const month = months[dateField.getMonth()];
    const year = String(dateField.getFullYear());
    dataObj.month = month;
    dataObj.year = year;
    dataObj.DocId = month + year;
    const newConsumable = new Consumable({ ...dataObj });
    const resp = await newConsumable.save();

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
        'Unexpected Error Occurred, Failed to create Consumables, Please try later',
      data: null,
    };
  }
};

export { createConsumables };

'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import ChemicalPurchase from '@/lib/models/safetyPanel/chemicals/chemicalPurchase.model';
import PpePurchase from '@/lib/models/safetyPanel/ppe/ppePurchase.model';
import SafetyToolPurchase from '@/lib/models/safetyPanel/tools/toolPurchase.model';

const chemicalPurchaseSpend = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = String(currentDate.getFullYear());
    const monthYearPattern = `-${currentMonth}-${currentYear}$`;

    const resp = await ChemicalPurchase.find({
      date: { $regex: monthYearPattern },
    });

    const total = resp.reduce((sum, doc) => sum + doc.price, 0);
    console.log('Filtered Documents:', resp);
    console.log('Total Price Calculated:', total);
    return {
      success: true,
      status: 200,
      data: total,
      error: null,
      message: 'Successfully fetched total chemical purchased',
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to fetch total chemical purchased',
      error: JSON.stringify(err.message),
      data: null,
    };
  }
};

const ppePurchaseSpend = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = String(currentDate.getFullYear());
    const monthYearPattern = `-${currentMonth}-${currentYear}$`;

    const resp = await PpePurchase.find({
      date: { $regex: monthYearPattern },
    });

    const total = resp.reduce((sum, doc) => sum + doc.price, 0);
    console.log('Filtered Documents:', resp);
    console.log('Total Price Calculated:', total);
    return {
      success: true,
      status: 200,
      data: total,
      error: null,
      message: 'Total PPE purchased calculated successfully',
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected Error Occurred, Failed to fetch PPE purchased',
      data: null,
      error: JSON.stringify(err.message),
    };
  }
};

const toolPurchaseSpend = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = String(currentDate.getFullYear());
    const monthYearPattern = `-${currentMonth}-${currentYear}$`;

    const resp = await SafetyToolPurchase.find({
      date: { $regex: monthYearPattern },
    });

    const total = resp.reduce((sum, doc) => sum + doc.price, 0);
    console.log('Filtered Documents:', resp);
    console.log('Total Price Calculated:', total);
    return {
      success: true,
      status: 200,
      data: total,
      error: null,
      message: 'successfully fetched tool purchased spent',
    };
  } catch (err) {
    return {
      data: null,
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to fetch total tool purchased',
      error: JSON.stringify(err.message),
    };
  }
};

export { chemicalPurchaseSpend, ppePurchaseSpend, toolPurchaseSpend };

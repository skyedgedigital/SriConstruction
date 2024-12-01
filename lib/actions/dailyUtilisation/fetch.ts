'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import DailyUtilisation from '@/lib/models/dailyUtilisation.model';
import { VehicleSchema } from '@/lib/models/vehicle.model';
import { WorkOrderSchema } from '@/lib/models/workOrder.model';
import mongoose from 'mongoose';

const workOrderModel =
  mongoose.models.WorkOrder || mongoose.model('WorkOrder', WorkOrderSchema);

const vehicleModel =
  mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);

const fetchDailyUtilisation = async (
  vehicleId,
  month,
  year
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    console.log(vehicleId);
    console.log(month);
    console.log(year);

    const resp = await DailyUtilisation.find({
      vehicle: new mongoose.Types.ObjectId(vehicleId),
      month: month,
      year: year,
    })
      .populate('vehicle', 'vehicleNumber')
      .populate('workOrder', 'workOrderNumber');

    return {
      success: true,
      data: JSON.stringify(resp),
      message: 'Daily Utilisation Fetched',
      error: null,
      status: 200,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected Error Occurred, Failed to fetch Daily Utilization, Please try later',
      data: null,
      error: JSON.stringify(err),
    };
  }
};

export default fetchDailyUtilisation;

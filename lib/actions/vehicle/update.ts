'use server';

import handleDBConnection from '@/lib/database';
import Vehicle from '@/lib/models/vehicle.model';

const updateVehicleFields = async (vehicleNumber: string, updatedData: any) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const filter = {
      vehicleNumber: vehicleNumber,
    };

    const ifExists = await Vehicle.findOne({
      vehicleNumber: vehicleNumber,
    });
    if (!ifExists) {
      return {
        success: false,
        message: `Vehicle with number ${vehicleNumber} not exist`,
        status: 404,
      };
    }
    const resp = await Vehicle.findOneAndUpdate(filter, updatedData, {
      new: true,
    });
    return {
      success: true,
      status: 201,
      message: 'Vehicle Data Updated Successfully',
      data: resp,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: JSON.stringify(err),
    };
  }
};

export { updateVehicleFields };

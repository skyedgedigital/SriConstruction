'use server';

import handleDBConnection from '@/lib/database';
import Vehicle from '@/lib/models/vehicle.model';

const fetchAllVehicles = async () => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const vehicles = await Vehicle.find();
    return {
      success: true,
      status: 200,
      message: 'Successfully Fetched List of Vehicles',
      data: JSON.stringify(vehicles),
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected Error Occurred, Please Try Later',
      error: JSON.stringify(err),
    };
  }
};

const fetchVehicleByVehicleNumber = async (vehicleNumber: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await Vehicle.findOne({
      vehicleNumber: vehicleNumber,
    });
    if (resp) {
      return {
        success: true,
        status: 200,
        message: 'Vehicle Found',
        data: resp,
      };
    }
    return {
      success: false,
      status: 404,
      message: 'Vehicle Not Found',
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'Unexpected Error Occurred, Please Try Later',
      error: JSON.stringify(err),
    };
  }
};

export { fetchAllVehicles, fetchVehicleByVehicleNumber };

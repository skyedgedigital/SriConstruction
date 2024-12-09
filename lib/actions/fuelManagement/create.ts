'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import { IFuel, IFuelPrices } from '@/interfaces/fuel.interface';
import handleDBConnection from '@/lib/database';
import Fuel from '@/lib/models/fuel.model';
import FuelManagement from '@/lib/models/fuelManagement.model';

const createFuelManagement = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataObj = JSON.parse(dataString);
    const Obj = new FuelManagement({ ...dataObj });
    const resp = await Obj.save();
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
        'Unexpected error occurred, Failed to create fuel data, Please try later',
      error: JSON.stringify(err),
      status: 500,
      data: null,
    };
  }
};

const saveFuelPrices = async (data: IFuelPrices): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const existingSavedPrice = await Fuel.findOne({
      fuelType: data.fuelType,
    });

    if (!existingSavedPrice) {
      const newSavedPrice = await Fuel.create({
        fuelType: data.fuelType,
        price: data.price,
      });

      if (!newSavedPrice) {
        return {
          success: false,
          error: 'Failed to save prices now, Please try later',
          message:
            'Unexpected Error Occurred, Failed to save prices now, Please try later',
          status: 400,
          data: null,
        };
      }
      return {
        success: true,
        message: 'Price saved successfully',
        error: null,
        data: newSavedPrice,
        status: 201,
      };
    }

    const updatedPrice = await Fuel.updateOne(
      { fuelType: data.fuelType },
      { price: data.price }
    );

    if (updatedPrice.modifiedCount === 0) {
      return {
        success: false,
        error: 'Failed to update prices, Please try later',
        message: 'Unexpected Error Occurred, Failed to update prices',
        status: 400,
        data: null,
      };
    }
    return {
      success: true,
      message: 'Price updated successfully',
      error: null,
      data: updatedPrice,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to create/update fuel data, Please try later',
      error: JSON.stringify(error),
      status: 500,
      data: null,
    };
  }
};

export { createFuelManagement, saveFuelPrices };

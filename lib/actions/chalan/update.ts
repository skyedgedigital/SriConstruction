'use server';

import Chalan from '@/lib/models/chalan.model';
import mongoose from 'mongoose';
import WorkOrder from '@/lib/models/workOrder.model';
import Department from '@/lib/models/department.model';
import Engineer from '@/lib/models/engineer.model';
import { fn } from './calculatePrice';
import Vehicle from '@/lib/models/vehicle.model';
import fuelManagementAction from '../fuelManagement/fuelManagementAction';
import FuelManagement from '@/lib/models/fuelManagement.model';
import { revalidatePath } from 'next/cache';
import handleDBConnection from '@/lib/database';
import { ApiResponse } from '@/interfaces/APIresponses.interface';

const updateChalan = async (
  chalanId: string,
  updates: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    console.log('Running updates', updates);
    const filter = {
      _id: new mongoose.Types.ObjectId(chalanId),
    };
    let updatesObj = null;
    if (updates) {
      updatesObj = JSON.parse(updates);
      console.log(updatesObj);
      if (updatesObj.workOrder) {
        const resp = await WorkOrder.findOne({
          workOrderNumber: updatesObj.workOrder,
        });
        if (resp) {
          updatesObj.workOrder = resp._id;
        } else {
          // throw new Error(`Given WorkOrder doesn't exists`);
          return {
            success: false,
            status: 400,
            message: `workorder ${updatesObj.workOrder} does not exist`,
            error: null,
            data: null,
          };
        }
      }
      if (updatesObj.department) {
        const resp = await Department.findOne({
          departmentName: updatesObj.department,
        });
        if (resp) {
          updatesObj.department = resp._id;
        } else {
          // throw new Error(`Given Department doesn't exists`);
          return {
            success: false,
            status: 400,
            message: `workorder ${updatesObj.department} does not exist`,
            error: null,
            data: null,
          };
        }
      }
      if (updatesObj.engineer) {
        const resp = await Engineer.findOne({
          name: updatesObj.engineer,
        });
        if (resp) {
          updatesObj.engineer = resp._id;
        } else {
          // throw new Error(`Given Engineer doesn't exists`);
          return {
            success: false,
            status: 400,
            message: `workorder ${updatesObj.engineer} does not exist`,
            error: null,
            data: null,
          };
        }
      }
    }
    const updatedChalan = await Chalan.findByIdAndUpdate(filter, updatesObj, {
      new: true,
    });
    if (!updatedChalan) {
      return {
        success: false,
        status: 404,
        message: 'Chalan not found',
        error: `Chalan with ID ${chalanId} not found`,
        data: null,
      };
    } else {
      const resp = await fn(chalanId);
      console.log(resp);
    }

    return {
      success: true,
      status: 200,
      message: 'Chalan updated successfully',
      data: JSON.stringify(updatedChalan),
      error: null,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to update chalan,Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const months = [
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

const markChalanAsVerified = async (
  chalanNumber: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const filter = {
      chalanNumber: chalanNumber,
    };
    const updatesObj = {
      $set: {
        verified: true,
      },
    };
    const updatedChalan = await Chalan.findOneAndUpdate(filter, updatesObj, {
      new: true,
    });
    // this commented code was used to vcalculate vehicle fuel cost
    // if (updatedChalan) {
    //   console.log(updatedChalan);
    //   const dateString = updatedChalan.date;
    //   const date = new Date(dateString);
    //   const year = date.getFullYear();
    //   const monthIndex = date.getMonth();
    //   const monthName = months[monthIndex];
    //   let items = updatedChalan.items;
    //   const promises = items.map(async (ele) => {
    //     const EleVehicle = ele.vehicleNumber;
    //     console.log(EleVehicle);
    //     const vehicleData = await Vehicle.findOne({
    //       vehicleNumber: EleVehicle,
    //     });
    //     console.log(vehicleData);
    //     const cost = vehicleData.fuelCost;
    //     const totalCost = cost * ele.hours;
    //     const dataObj = {
    //       vehicleNumber: ele.vehicleNumber,
    //       fuel: ele.hours,
    //       month: monthName,
    //       year: year,
    //       DocId: monthName + year,
    //       entry: false,
    //       amount: totalCost,
    //       meterReading: 'Chalan',
    //       chalan: chalanNumber,
    //       duration: ele.hours,
    //     };
    //     const Obj = new FuelManagement({
    //       ...dataObj,
    //     });
    //     const savedObj = await Obj.save();
    //     console.log(savedObj);
    //     return savedObj; // Return the saved object
    //   });
    //   await Promise.all(promises);
    // }
    if (!updatedChalan) {
      return {
        success: false,
        status: 400,
        message: 'Failed to makr verified, Please try later',
        error: null,
        data: null,
      };
    }
    revalidatePath('/fleetmanager/merge-invoices');
    revalidatePath('/fleetmanager/chalans');

    return {
      success: true,
      message: 'Added',
      status: 200,
      data: JSON.stringify(updatedChalan),
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      message:
        'Unexpected error occurred, Failed to update chalan,Please try later',
      status: 500,
      success: false,
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { updateChalan, markChalanAsVerified };

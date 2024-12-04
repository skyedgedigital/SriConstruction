'use server';
import Chalan from '@/lib/models/chalan.model';
import Department from '@/lib/models/department.model';
import Engineer from '@/lib/models/engineer.model';
import WorkOrder from '@/lib/models/workOrder.model';
import mongoose from 'mongoose';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '@/utils/aws';
import { fn } from './calculatePrice';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { storage, app } from '@/utils/fireBase/config';
import { uploadFile } from '@/utils/fireBase/functions';
import handleDBConnection from '@/lib/database';
import { ApiResponse } from '@/interfaces/APIresponses.interface';
// import { initializeApp } from "firebase/app";
// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);

async function uploadFileToS3(file: any, fileName: any) {
  const key: string = `chalans/${fileName}.jpg`;
  const fileBuffer = file;
  console.log(fileBuffer);
  const params = {
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/jpg',
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log('yezzur', key);
    return `${key}`;
  } catch (error) {
    return null;
  }
}

const createChalan = async (
  chalanData: FormData
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    console.log(chalanData);
    const file = chalanData.get('file');
    console.log(file);
    const tempChalanDetails = chalanData.get('chalanDetails');
    const {
      workOrder,
      department,
      location,
      workDescription,
      items,
      chalanNumber,
      engineer,
      date,
      signed,
      commentByDriver,
      commentByFleetManager,
    } = await JSON.parse(tempChalanDetails as string);
    console.log(workOrder);

    if (file instanceof File) {
      const fileName = file.name; // Get the file name
      const storageRef = ref(storage, `images/${chalanNumber}/${fileName}`); // Create a reference in Firebase Storage

      const downloadURL = await uploadFile(storageRef, file);

      if (!downloadURL) {
        return {
          status: 404,
          error: JSON.stringify(downloadURL),
          message:
            'Could not save photo for now, Please check your Internet Connection ',
          data: null,
          success: false,
        };
      }

      const existingWorkOrderId = await WorkOrder.findOne({
        workOrderNumber: workOrder,
      });
      if (!existingWorkOrderId) {
        return {
          status: 404,
          error: JSON.stringify(existingWorkOrderId),
          message:
            'Provided workorder does not exists in database, make sure provided workorder already created',
          data: null,
          success: false,
        };
      }
      const workOrderId = existingWorkOrderId._id;
      const existingDepartment = await Department.findOne({
        departmentName: department,
      });
      if (!existingDepartment) {
        return {
          status: 404,
          error: JSON.stringify(existingWorkOrderId),
          message:
            'Provided department does not exists in database, make sure provided department already created',
          data: null,
          success: false,
        };
      }
      const departmentId = existingDepartment._id;
      const existingEngineer = await Engineer.findOne({
        name: engineer,
        department: new mongoose.Types.ObjectId(departmentId),
      });
      if (!existingEngineer) {
        return {
          status: 404,
          error: JSON.stringify(existingWorkOrderId),
          message:
            'Provided engineer does not exists in provided department, Could not create chalan',
          data: null,
          success: false,
        };
      }
      const engineerId = existingEngineer._id;
      const obj = new Chalan({
        location,
        workDescription,
        chalanNumber,

        date,
        signed,
        commentByDriver,
        commentByFleetManager,

        workOrder: new mongoose.Types.ObjectId(workOrderId),
        department: new mongoose.Types.ObjectId(departmentId),
        engineer: new mongoose.Types.ObjectId(engineerId),
        file: downloadURL,
        items: [],
      });
      console.log('The obj to be saved', obj);
      const resp = await obj.save();
      console.log('saved chalan', resp);
      if (!resp) {
        return {
          status: 500,
          success: false,
          data: null,
          error: JSON.stringify(resp),
          message:
            'Unexpected error Occurred in database, Failed to save chalan, Please try later',
        };
      }
      const objId = resp._id;
      const result = await Chalan.findOneAndUpdate(
        {
          _id: objId,
        },
        {
          $push: { items: items },
        },
        {
          new: true,
        }
      );
      const chalanId = result._id;
      const updatedResult = await fn(chalanId);
      console.log('updatedResult', updatedResult);
      if (!updatedResult) {
        return {
          status: 500,
          success: false,
          data: null,
          error: JSON.stringify(resp),
          message:
            'Unexpected error Occurred in database, Failed to save chalan, Please try later',
        };
      }
      return {
        success: true,
        status: 200,
        data: JSON.stringify(result),
        message: 'Chalan created successfully',
        error: null,
      };
    } else {
      console.error('Unexpected data type for photo:', file);
      return {
        success: false,
        status: 500,
        message: 'Unexpected data type for photo:',
        error: 'Unexpected Data Type for Photo',
        data: null,
      };
    }
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return {
        success: false,
        status: 409, // Conflict
        message: 'Chalan number already exists',
        error: JSON.stringify(err.message || err),
        data: null,
      };
    }
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to create chalan,Please try later',
      error: err.message || JSON.stringify(err),
      data: null,
    };
  }
};

export { createChalan };

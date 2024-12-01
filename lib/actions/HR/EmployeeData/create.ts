'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';
import { storage } from '@/utils/fireBase/config';
import { uploadFile } from '@/utils/fireBase/functions';
import { ref } from 'firebase/storage';
const createEmployeeData = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataObj = JSON.parse(dataString);
    const exist = await EmployeeData.findOne({ code: dataObj.code });
    console.log('oooooooo', exist);
    if (exist) {
      return {
        success: false,
        message: 'Code already exits',
        error: null,
        status: 400,
        data: null,
      };
    }
    const startYear = new Date(dataObj.appointmentDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const bonusLeaveData = [];

    for (let year = startYear; year <= currentYear; year++) {
      bonusLeaveData.push({ year, status: false });
    }

    const Obj = new EmployeeData({
      ...dataObj,
      bonus: bonusLeaveData,
      leave: bonusLeaveData,
    });
    const resp = await Obj.save();

    return {
      success: true,
      message: 'Employee Data Created Successfully',
      data: JSON.stringify(resp),
      status: 200,
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to create employee data, Please Try Later',
      error: JSON.stringify(err),
      status: 500,
      data: null,
    };
  }
};

const createEmployeeDataBulk = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataArray = JSON.parse(dataString);
    const resp = await EmployeeData.insertMany(dataArray);
    return {
      success: true,
      message: 'Employee Data Created Successfully',
      data: JSON.stringify(resp),
      status: 200,
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to create employee in bulk, Please Try Later',
      error: JSON.stringify(err),
      status: 500,
      data: null,
    };
  }
};

const uploadEmployeeDataPhotos = async (
  photosData: FormData
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Extract files from FormData
    const driverLicense = photosData.get('driverLicense');
    const aadharCard = photosData.get('aadharCard');
    const bankPassbook = photosData.get('bankPassbook');
    const profilePhoto = photosData.get('profilePhoto');
    const employeeCode = photosData.get('code');

    const updateblelURLs = {
      profilePhotoURL: undefined,
      drivingLicenseURL: undefined,
      aadharCardURL: undefined,
      bankPassbookURL: undefined,
    };
    if (driverLicense && driverLicense instanceof File) {
      const fileName = driverLicense.name; // Get the file name
      const storageRef = ref(
        storage,
        `images/${employeeCode}/Driving_License_${fileName}`
      ); // Create a reference in Firebase Storage
      const DLdownloadURL = await uploadFile(storageRef, driverLicense);
      console.log('Driving License URL', DLdownloadURL);
      //   console.log('TYPE OF', typeof DLdownloadURL);
      if (DLdownloadURL) {
        updateblelURLs.drivingLicenseURL = DLdownloadURL as string;
      }
    }
    if (aadharCard && aadharCard instanceof File) {
      const fileName = aadharCard.name; // Get the file name
      const storageRef = ref(
        storage,
        `images/${employeeCode}/Aadhar_Card_${fileName}`
      ); // Create a reference in Firebase Storage
      const ACdownloadURL = await uploadFile(storageRef, aadharCard);
      console.log('AAdhar URL', ACdownloadURL);
      if (ACdownloadURL) {
        updateblelURLs.aadharCardURL = ACdownloadURL as string;
      }
    }
    if (bankPassbook && bankPassbook instanceof File) {
      const fileName = bankPassbook.name; // Get the file name
      const storageRef = ref(
        storage,
        `images/${employeeCode}/Bank_Passbook_${fileName}`
      ); // Create a reference in Firebase Storage
      const BPdownloadURL = await uploadFile(storageRef, bankPassbook);
      console.log('Bank Passbook URL', BPdownloadURL);
      if (BPdownloadURL) {
        updateblelURLs.bankPassbookURL = BPdownloadURL as string;
      }
    }
    if (profilePhoto && profilePhoto instanceof File) {
      const fileName = profilePhoto.name; // Get the file name
      const storageRef = ref(
        storage,
        `images/${employeeCode}/Profile_Photo_${fileName}`
      ); // Create a reference in Firebase Storage
      const PPdownloadURL = await uploadFile(storageRef, profilePhoto);
      console.log('Profile URL', PPdownloadURL);
      if (PPdownloadURL) {
        updateblelURLs.profilePhotoURL = PPdownloadURL as string;
      }
    }

    // updating photo urls in EmployeeData

    const res = await EmployeeData.findOneAndUpdate(
      { code: employeeCode },
      {
        $set: updateblelURLs,
      },
      { new: true }
    );
    return {
      success: true,
      message: 'Photos uploaded successfully',
      status: 200,
      error: null,
      data: JSON.stringify(res),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to update  Employee Data, Please Try Later',
      error: JSON.stringify(err),
      status: 500,
      data: null,
    };
  }
};

export { createEmployeeData, createEmployeeDataBulk, uploadEmployeeDataPhotos };

'use server';
import Admin from '@/lib/models/admin.model';
import Employee from '@/lib/models/employee.model';
import { employee } from '@/types/employee.type';
import userAction from '../user/userAction';
import { user } from '@/types/user.type';
import { access } from '@/utils/enum';
import { revalidatePath } from 'next/cache';
import { storage } from '@/utils/fireBase/config';
import { uploadFile } from '@/utils/fireBase/functions';
import { ref } from 'firebase/storage';
import handleDBConnection from '@/lib/database';
import toast from 'react-hot-toast';
import { ApiResponse } from '@/interfaces/APIresponses.interface';

const createEmployee = async (
  employeeInfo: employee
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    console.log(employeeInfo);
    // check if admin or employee already exists
    const admin = await Admin.findOne({ phoneNo: employeeInfo.phoneNo });
    if (admin) {
      return {
        success: false,
        status: 403,
        message: 'This phone number is already in use',
        error: null,
        data: null,
      };
    }
    const user = await Employee.findOne({ phoneNo: employeeInfo.phoneNo });
    if (user) {
      return {
        success: false,
        status: 403,
        message: 'This phone number is already in use',
        error: null,
        data: null,
      };
    }

    // Add a new Employee
    const employee = new Employee({
      name: employeeInfo.name,
      phoneNo: employeeInfo.phoneNo,
      drivingLicenseNo: employeeInfo.drivingLicenseNo,
      gatePassNo: employeeInfo.gatePassNo,
      safetyPassNo: employeeInfo.safetyPassNo,
      aadharNo: employeeInfo?.aadharNo,
      employeeRole: employeeInfo.employeeRole,
      UAN: employeeInfo.UAN,
      bankDetails: employeeInfo.bankDetails,
    });
    console.log('wowoowoww', employee);
    var savedEmployee = await employee.save();
    console.log(savedEmployee);
    if (
      employeeInfo.employeeRole.toUpperCase() === 'FLEETMANAGER' ||
      'DRIVER' ||
      'HR' ||
      'Safety'
    ) {
      const user: user = {
        employee: employee._id,
        hashedpassword: employeeInfo.phoneNo.toString(),
        access:
          employeeInfo.employeeRole.toUpperCase() === 'DRIVER'
            ? access.DRIVER
            : employeeInfo.employeeRole.toUpperCase() === 'FLEETMANAGER'
            ? access.FLEET_MANAGER
            : employeeInfo.employeeRole.toUpperCase() === 'HR'
            ? access.HR
            : access.Safety,
      };
      console.log(user);
      const res = await userAction.CREATE.createUser(user);
      console.log('yeic to res hai', res);
      if (res.success) {
        return {
          success: true,
          status: res.status,
          message: res.message,
          error: res?.error,
          data: res.data,
        };
      } else {
        toast.error(
          res.message ||
            'Unexpected error occurred, Failed to create employee,Please try later'
        );
      }
    }
    const employeeObject = {
      _id: savedEmployee._id.toString(),
      name: savedEmployee.name,
      phoneNo: savedEmployee.phoneNo,
      drivingLicenseNo: savedEmployee.drivingLicenseNo,
      UAN: savedEmployee.UAN,
      gatePassNo: savedEmployee.gatePassNo,
      safetyPassNo: savedEmployee.safetyPassNo,
    };
    revalidatePath('/admin/employees');
    return {
      success: true,
      status: 201,
      message: 'Employee added successfully',
      data: employeeObject,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to create employee,Please try later',
      error: JSON.stringify(error),
      data: null,
    };
  }
};

const uploadPhotos = async (
  photosData: FormData
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Extract files from FormData
    const driverLicense = photosData.get('driverLicense');
    const aadharCard = photosData.get('aadharCard');
    const profilePhoto = photosData.get('profilePhoto');
    const phoneNo = Number(photosData.get('phoneNo'));

    const updateblelURLs = {
      profilePhotoURL: undefined,
      drivingLicenseURL: undefined,
      aadharCardURL: undefined,
    };
    if (driverLicense && driverLicense instanceof File) {
      const fileName = driverLicense.name; // Get the file name
      const storageRef = ref(
        storage,
        `images/${phoneNo}/Driving_License_${fileName}`
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
        `images/${phoneNo}/Aadhar_Card_${fileName}`
      ); // Create a reference in Firebase Storage
      const ACdownloadURL = await uploadFile(storageRef, aadharCard);
      console.log('AAdhar URL', ACdownloadURL);
      if (ACdownloadURL) {
        updateblelURLs.aadharCardURL = ACdownloadURL as string;
      }
    }

    if (profilePhoto && profilePhoto instanceof File) {
      const fileName = profilePhoto.name; // Get the file name
      const storageRef = ref(
        storage,
        `images/${phoneNo}/Profile_Photo_${fileName}`
      ); // Create a reference in Firebase Storage
      const PPdownloadURL = await uploadFile(storageRef, profilePhoto);
      console.log('Profile URL', PPdownloadURL);
      if (PPdownloadURL) {
        updateblelURLs.profilePhotoURL = PPdownloadURL as string;
      }
    }

    // updating photo urls in EmployeeData

    try {
      const res = await Employee.findOneAndUpdate(
        { phoneNo: phoneNo },
        {
          $set: updateblelURLs,
        },
        { new: true }
      );
      return {
        success: true,
        message: 'Photos uploaded successfully',
        status: 200,
        data: JSON.stringify(res),
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        message:
          'Unexpected error occurred, Failed to update photos, Please Try Later',
        error: JSON.stringify(error),
        data: null,
        status: 500,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: 'Error uploading photos',
      error: JSON.stringify(err),
      status: 500,
      data: null,
    };
  }
};
export { createEmployee, uploadPhotos };

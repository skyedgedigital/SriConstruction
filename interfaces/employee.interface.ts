import mongoose from 'mongoose';

export interface IBankDetails {
  accountNo: number;
  IFSC: string;
}

export interface IEmployee extends mongoose.Document {
  name: string;
  phoneNo: number;
  drivingLicenseNo: string;
  gatePassNo: string;
  safetyPassNo: string;
  UAN: number;
  aadharNo: number;
  bankDetails: IBankDetails;
  employeeRole: String;
  createdAt: Date;
  updatedAt: Date;
  profilePhotoURL: String;
  drivingLicenseURL: String;
  aadharCardURL: String;
}

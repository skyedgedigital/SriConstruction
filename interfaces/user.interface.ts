import { access } from "@/utils/enum";
import mongoose from 'mongoose'
import { IEmployee } from "./employee.interface";

export interface IUser extends mongoose.Document {
  employee: mongoose.PopulatedDoc<IEmployee>;
  hashedpassword: string;
  access: access
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmin extends mongoose.Document {
  phoneNo: Number;
  name: string;
  hashedpassword: string;
  access: "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}
import mongoose, { Types } from "mongoose";
import { IWorkOrder } from "./workOrder.interface";
import { IDepartment } from "./department.interface";
import { IEngineer } from "./engineer.interface";
import { IItem } from "./item.interface";
import { IEmployee } from "./employee.interface";
export interface IChalanItem {
  // item: mongoose.PopulatedDoc<IItem>;
  item:mongoose.Types.ObjectId
  
}

export interface Item{
  item:mongoose.Types.ObjectId;
  vehicleNumber:string,
  unit?: "minutes" | "hours" | "days" | "months" | "fixed" | "shift";
  hours:number;
  itemCosting:number,
  startTime:string,
  endTime:string
}

export interface IChalan extends mongoose.Document {
  // workOrder: mongoose.PopulatedDoc<IWorkOrder>;
  workOrder:mongoose.Schema.Types.ObjectId
  // department: mongoose.PopulatedDoc<IDepartment>;
  department:mongoose.Schema.Types.ObjectId
  // engineer: mongoose.PopulatedDoc<IEngineer>;
  engineer:mongoose.Schema.Types.ObjectId
  // driver: mongoose.PopulatedDoc<IEmployee>;
  date: Date;
  chalanNumber?: string;
  location?: string;
  workDescription?: string;
  file?: string;
  status?: "approved" | "pending" | "unsigned" | "generated";
  chalanSignedStatus?: "signed" | "unsigned";
  chalanRevert: boolean;
  verified:boolean;
  signed: boolean;
  invoiceCreated: boolean;

  // items: IChalanItem[];
  items:Item[]
  createdAt: Date;
  updatedAt: Date;
  totalCost:number;
  commentByDriver:string;
  commentByFleetManager:string;
}

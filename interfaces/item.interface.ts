import mongoose from "mongoose";
import { IWorkOrder } from "./workOrder.interface";

export interface IItem extends mongoose.Document {
  itemNumber: number;
  itemName?: string;
  hsnNo?: string;
  itemPrice: number;
  workOrder:mongoose.PopulatedDoc<IWorkOrder>;
  createdAt: Date;
  updatedAt: Date;
}

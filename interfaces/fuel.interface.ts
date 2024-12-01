import mongoose from 'mongoose'

export interface IFuel extends mongoose.Document {
  fuelType: string;
  price: Number;
  createdAt: Date;
  updatedAt: Date;
}

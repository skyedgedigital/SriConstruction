import { IFuel } from "@/interfaces/fuel.interface";
import mongoose from 'mongoose'

const FuelSchema: mongoose.Schema<IFuel> = new mongoose.Schema({
  fuelType: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update 'updatedAt' field before saving the document
FuelSchema.pre<IFuel>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Fuel: mongoose.Model<IFuel> = mongoose.models.Fuel || mongoose.model("Fuel", FuelSchema);

export default Fuel;

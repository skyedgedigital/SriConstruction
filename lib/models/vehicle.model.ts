import IVehicle from '@/interfaces/vehicle.interface';
import mongoose from 'mongoose';

const VehicleSchema: mongoose.Schema<IVehicle> = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
    },
    location: {
      type: String,
    },
    vendor: {
      type: String,
    },
    insuranceNumber: {
      type: String,
    },
    insuranceExpiryDate: {
      type: Date,
      default: null,
    },
    gatePassNumber: {
      type: String,
    },
    gatePassExpiry: {
      type: Date,
      default: null,
    },
    tax: {
      type: String,
    },
    taxExpiryDate: {
      type: Date,
      default: null,
    },
    fitness: {
      type: String,
    },
    fitnessExpiry: {
      type: Date,
      default: null,
    },
    loadTest: {
      type: String,
    },
    loadTestExpiry: {
      type: Date,
      default: null,
    },
    safety: {
      type: String,
    },
    safetyExpiryDate: {
      type: Date,
      default: null,
    },
    puc: {
      type: String,
    },
    pucExpiryDate: {
      type: Date,
      default: null,
    },
    fuelType: {
      type: String,
      enum: ['Diesel', 'Petrol'],
      default: 'Diesel',
    },
    emi: {
      type: Number,
      default: 0,
      min: [0, 'EMI cannot be negative.'],
    },
    emiStatus: {
      type: String,
      enum: ['Open', 'Close'],
      default: 'Close',
    },
  },
  { timestamps: true }
);

const Vehicle: mongoose.Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);

export default Vehicle;
export { VehicleSchema };

import IVehicle from '@/interfaces/vehicle.interface';
import mongoose from 'mongoose';

const VehicleSchema: mongoose.Schema<IVehicle> = new mongoose.Schema({
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
  },
  gatePassNumber: {
    type: String,
  },
  gatePassExpiry: {
    type: Date,
  },
  tax: {
    type: String,
  },
  taxExpiryDate: {
    type: Date,
  },
  fitness: {
    type: String,
  },
  fitnessExpiry: {
    type: Date,
  },
  loadTest: {
    type: String,
  },
  loadTestExpiry: {
    type: Date,
  },
  safety: {
    type: String,
  },
  safetyExpiryDate: {
    type: Date,
  },
  puc: {
    type: String,
  },
  pucExpiryDate: {
    type: Date,
  },
  fuelType: {
    type: String,
    default: 'Diesel',
  },
  emi: {
    type: Number,
    default: 0,
  },
  emiStatus: {
    type: String,
    default: 'Close',
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

VehicleSchema.pre<IVehicle>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Vehicle: mongoose.Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);

export default Vehicle;

export { VehicleSchema };

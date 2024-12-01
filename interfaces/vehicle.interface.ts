import { Document } from 'mongoose';

interface IVehicle extends Document {
  vehicleNumber: string;
  vehicleType?: string;
  location?: string;
  vendor?: string;
  insuranceNumber?: string;
  insuranceExpiryDate?: Date;
  gatePassNumber?: string;
  gatePassExpiry?: Date;
  tax?: string;
  taxExpiryDate?: Date;
  fitness?: string;
  fitnessExpiry?: Date;
  loadTest?: string;
  loadTestExpiry?: Date;
  safety?: string;
  safetyExpiryDate?: Date;
  puc?: string;
  pucExpiryDate?: Date;
  fuelType?: string;
  fuelCost?: number;
  emiStatus:string;
  emi:number;
  createdAt: Date;
  updatedAt: Date;
}

export default IVehicle;

import { IBankDetails, IEmployee } from "@/interfaces/employee.interface";
import mongoose from 'mongoose'
import User from "./user.model";
import { employeeRole } from "@/utils/enum";

const BankDetailsSchema = new mongoose.Schema<IBankDetails>({
    accountNo: {
        type: Number,
    },
    IFSC: {
        type: String,
        uppercase: true,
    }
});

const EmployeeSchema = new mongoose.Schema<IEmployee>({
  name: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: Number,
    unique: true,
    required: true,
  },
  drivingLicenseNo: {
    type: String,
    required: true,
    uppercase: true,
  },
  gatePassNo: {
    type: String,
    required: true,
  },
  safetyPassNo: {
    type: String,
    required: true,
  },
  UAN: {
    type: Number,
    required: true,
  },
  aadharNo: {
    type: Number,
    required: true,
  },
  bankDetails: BankDetailsSchema,
  employeeRole: {
    type: String,
    enum: Object.values(employeeRole),
    required: true,
  },
  profilePhotoURL: {
    type: String,
    default: '',
  },
  drivingLicenseURL: {
    type: String,
    default: '',
  },
  aadharCardURL: {
    type: String,
    default: '',
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

// Middleware to update 'updatedAt' field before saving the document
EmployeeSchema.pre<IEmployee>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Remove user associated with this employee
EmployeeSchema.pre<IEmployee>("deleteOne", async function (next) {
    try {
        await User.deleteOne({ phoneNo: this.phoneNo });
        next();
    } catch (err: any) {
        next(err)
    }
});

const Employee: mongoose.Model<IEmployee> = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

export default Employee;

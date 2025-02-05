import mongoose, { Schema } from 'mongoose';

// Damage Register Schema
const DamageRegisterSchema = new Schema({
  particularsOfDamageOrLoss: {
    type: String,
    required: true,
  },
  dateOfDamageOrLoss: {
    type: Date,
    required: true,
  },
  didWorkmanShowCause: {
    type: Boolean,
    required: true,
  },
  personWhoHeardExplanation: {
    type: String,
    required: true,
  },
  amountOfDeductionImposed: {
    type: Number,
    required: true,
  },
  numberOfInstallments: {
    type: Number,
    default: 1,
  },
  installmentsLeft: {
    type: Number,
    default: 1,
  },
  remarks: {
    type: String,
  },
});

// Advance Register Schema
const AdvanceRegisterSchema = new Schema({
  amountOfAdvanceGiven: {
    type: Number,
    required: true,
  },
  dateOfAdvanceGiven: {
    type: Date,
    required: true,
  },
  purposeOfAdvanceGiven: {
    type: String,
    required: true,
  },
  numberOfInstallments: {
    type: Number,
    default: 1,
  },
  installmentsLeft: {
    type: Number,
    default: 1,
  },
  remarks: {
    type: String,
  },
});

// Existing Schemas: Bonus, Leave, WorkOrderHr (as in your provided code)
const BonusSchema = new Schema({
  year: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
});

const LeaveSchema = new Schema({
  year: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
});

const WorkOrderHrSchema = new Schema({
  period: {
    type: String, // Format: 'mm-yyyy'
    required: true,
  },
  workOrderHr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrderHr',
    required: true,
  },
  workOrderAtten: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Main EmployeeData Schema
const EmployeeDataSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  workManNo: {
    type: String,
  },
  name: {
    type: String,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DepartmentHr',
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designation',
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
  },
  accountNumber: {
    type: String,
  },
  pfApplicable: {
    type: Boolean,
  },
  pfNo: {
    type: String,
  },
  UAN: {
    type: String,
  },
  ESICApplicable: {
    type: Boolean,
  },
  ESICNo: {
    type: String,
  },
  ESILocation: {
    type: Schema.Types.ObjectId,
    ref: 'EsiLocation',
  },
  adhaarNumber: {
    type: String,
  },
  sex: {
    type: String,
  },
  maritalStatus: {
    type: String,
  },
  dob: {
    type: String,
  },
  attendanceAllowance: {
    type: Boolean,
  },
  fathersName: {
    type: String,
  },
  address: {
    type: String,
  },
  landlineNumber: {
    type: String,
  },
  mobileNumber: {
    type: String,
  },
  workingStatus: {
    type: Boolean,
  },
  appointmentDate: {
    type: String,
  },
  resignDate: {
    type: String,
  },
  bonus: [BonusSchema],
  leave: [LeaveSchema],
  safetyPassNumber: {
    type: String,
  },
  SpValidity: {
    type: String,
  },
  policeVerificationValidityDate: {
    type: String,
  },
  gatePassNumber: {
    type: String,
  },
  gatePassValidTill: {
    type: String,
  },
  basic: {
    type: String,
  },
  DA: {
    type: String,
  },
  HRA: {
    type: String,
  },
  CA: {
    type: String,
  },
  food: {
    type: String,
  },
  incentives: {
    type: String,
  },
  uniform: {
    type: String,
  },
  medical: {
    type: String,
  },
  loan: {
    type: String,
  },
  LIC: {
    type: String,
  },
  oldBasic: {
    type: String,
  },
  oldDA: {
    type: String,
  },
  workOrderHr: [WorkOrderHrSchema],
  damageRegister: [DamageRegisterSchema], // Added Damage Register
  advanceRegister: [AdvanceRegisterSchema], // Added Advance Register
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
  bankPassbookURL: {
    type: String,
    default: '',
  },
});

EmployeeDataSchema.index(
  { _id: 1, 'workOrderHr.period': 1, 'workOrderHr.workOrderHr': 1 },
  { unique: true }
);

// Model initialization
let EmployeeData;

if (mongoose.models.EmployeeData) {
  EmployeeData = mongoose.model('EmployeeData');
} else {
  EmployeeData = mongoose.model('EmployeeData', EmployeeDataSchema);
}

export { EmployeeDataSchema, DamageRegisterSchema, AdvanceRegisterSchema };
export default EmployeeData;

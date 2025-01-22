import mongoose from 'mongoose';

const AttendanceSchema: mongoose.Schema<any> = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'EmployeeData',
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  days: [
    {
      day: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: [
          'Present',
          'Absent',
          'Half Day',
          'NH',
          'Not Paid',
          'Earned Leave',
          'Casual Leave',
          'Festival Leave',
        ],
        required: true,
      },
    },
  ],
  presentDays: {
    type: Number,
    default: 0,
  },
  earnedLeaves: {
    type: Number,
    default: 0,
  },
  casualLeaves: {
    type: Number,
    default: 0,
  },
  festivalLeaves: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  workOrderHr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrderHr',
  },
});

AttendanceSchema.pre<any>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Attendance: mongoose.Model<any> =
  mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

export default Attendance;

export { AttendanceSchema };

import mongoose from 'mongoose'
import { IUser } from "@/interfaces/user.interface";
import { access } from "@/utils/enum";


const UserSchema: mongoose.Schema<IUser> = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  hashedpassword: {
    type: String,
    required: true,
  },
  access: {
    type: String,
    enum: Object.values(access),
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

// Middleware to update 'updatedAt' field before saving the document
UserSchema.pre<IUser>('save', function (next) {
  this.updatedAt = new Date();
  next();
});


const User: mongoose.Model<IUser> = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;

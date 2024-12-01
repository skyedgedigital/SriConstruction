import mongoose from 'mongoose'
import { IAdmin } from "@/interfaces/user.interface";


const AdminSchema: mongoose.Schema<IAdmin> = new mongoose.Schema({
    phoneNo: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    hashedpassword: {
        type: String,
        required: true,
    },
    access: {
        type: String,
        default: "ADMIN"
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
AdminSchema.pre<IAdmin>('save', function (next) {
    this.updatedAt = new Date();
    next();
});


const Admin: mongoose.Model<IAdmin> = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;

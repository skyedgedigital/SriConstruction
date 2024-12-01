import IStore from "@/interfaces/storeManagement.interface";
import mongoose from "mongoose";

const StoreSchema : mongoose.Schema<IStore> = new mongoose.Schema({
    tool:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tool",
        // required:true
    },
    vehicleNumber:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    dateOfAllotment:{
        type:Date,
        default:Date.now
    },
    dateOfReturn:{
        type:Date,
        default:Date.now
    },
    returned:{
        type:Boolean,
        default:false
    },
    totalPrice:{
        type:Number,
        required:true
    }
})

StoreSchema.pre<IStore>('save',function(next){
    this.updatedAt = new Date();
    next();
})

const Store : mongoose.Model<IStore> = mongoose.models.Store || mongoose.model("Store",StoreSchema);

export default Store;
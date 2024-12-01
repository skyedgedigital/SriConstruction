import IConsumables from "@/interfaces/consumables.interface";
import mongoose from "mongoose";

const ConsumableSchema : mongoose.Schema<IConsumables> = new mongoose.Schema({
    vehicle:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        // required:true,
    },
    vehicleNumber:{
        type:String,
        required:true,
    },
    consumableItem:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
        default:1
    },
    date:{
        type:Date,
        required:true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    month:{
        type:String,
    },
    year:{
        type:String,
    },
    DocId:{
        type:String
    }
})

const Consumable : mongoose.Model<IConsumables> = mongoose.models.Consumable || mongoose.model("Consumable", ConsumableSchema);
export default Consumable;
import { IItem } from "@/interfaces/item.interface";
import mongoose from "mongoose";

const ItemSchema: mongoose.Schema<IItem> = new mongoose.Schema({
  itemNumber: {
    type: Number,
    required: true
  },
  itemName: {
    type: String,
  },
  hsnNo: {
    type: String,
  },
  itemPrice: {
    type: Number,
    required: true,
  },
  workOrder:{
    type:mongoose.Types.ObjectId,
    ref:'WorkOrder',
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
});

ItemSchema.pre<IItem>('save',function(next){
    this.updatedAt = new Date();
    next();
})

const Item: mongoose.Model<IItem> = mongoose.models.Item || mongoose.model("Item",ItemSchema);

export default Item

export {ItemSchema}

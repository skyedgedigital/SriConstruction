import mongoose, { Schema } from 'mongoose'
import { IChalan } from '@/interfaces/chalan.interface';

const ChalanSchema: mongoose.Schema<IChalan> = new Schema({
    workOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkOrder',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    engineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Engineer',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    chalanNumber: {
      type: String,
      unique:true
    },
    location: {
      type: String,
    },
    workDescription: {
      type: String,
    },
    file: {
      type: String,
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'unsigned','generated','signed'],
    },
    signed:{
      type:Boolean
    },
    verified:{
      type:Boolean,
      default:false
    },
    invoiceCreated:{
      type:Boolean,
      default:false
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: true,
        },
        vehicleNumber: {
          type: String,
        },
        unit: {
          type: String,
          enum:['minutes','hours','days','months','shift','ot']
        },
        hours: {
          type: Number,
        },
        startTime: {
          type: String,
          validate: {
            validator: (v: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: (props) => `${props.value} is not a valid time format. Time should be in HH:MM format for startTime`,
          },
        },
        endTime: {
          type: String,
          validate: {
            validator: (v: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: (props) => `${props.value} is not a valid time format. Time should be in HH:MM format for endTime`,
          },
        },
        itemCosting:{
          type:Number,
          default:0
        }
      },
    ],
    commentByDriver:{
      type:String,
    },
    commentByFleetManager:{
      type:String,
    },
    totalCost:{
      type:Number,
      default:0
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

ChalanSchema.pre<IChalan>('save',function(next){
    this.updatedAt = new Date();
    next();
})

const Chalan : mongoose.Model<IChalan> = mongoose.models.Chalan || mongoose.model("Chalan", ChalanSchema);

export default Chalan;

export {ChalanSchema}

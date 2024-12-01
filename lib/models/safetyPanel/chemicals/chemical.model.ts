import mongoose, { Schema } from 'mongoose'

interface Chemical{
    name: string,
    quantity:number;
}

const ChemicalSchema: mongoose.Schema<Chemical> = new Schema({
    name:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        default:0,
        required:true
    }
})

// const Chemical : mongoose.Model<Chemical> = mongoose.models.Chemical || mongoose.model("Chemical",ChemicalSchema);

let Chemical;

if(mongoose.models.Chemical){
    Chemical = mongoose.model('Chemical');
}
else{
    Chemical = mongoose.model('Chemical',ChemicalSchema);
}

export default Chemical;

export {ChemicalSchema}

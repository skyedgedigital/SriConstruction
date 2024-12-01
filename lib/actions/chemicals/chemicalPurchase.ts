'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Chemical, {
  ChemicalSchema,
} from '@/lib/models/safetyPanel/chemicals/chemical.model';
import ChemicalPurchase from '@/lib/models/safetyPanel/chemicals/chemicalPurchase.model';
import mongoose from 'mongoose';

const ChemicalModel =
  mongoose.models.Chemical || mongoose.model('Chemical', ChemicalSchema);

const createChemicalPurchase = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const dataObj = JSON.parse(dataString);
    const chemicalId = dataObj.chemicalId;
    const quantity = dataObj.quantity;
    const chemicalDetails = await Chemical.findOne({ _id: chemicalId });

    const existingQuantity = chemicalDetails.quantity;
    const newQuantity = existingQuantity + quantity;
    const name = chemicalDetails.name;
    const updatedChemical = await Chemical.findOneAndUpdate(
      {
        _id: chemicalId,
      },
      {
        name: name,
        quantity: newQuantity,
      },
      {
        new: true,
      }
    );
    console.log(updatedChemical);
    const docObj = new ChemicalPurchase({
      ...dataObj,
    });
    const result = await docObj.save();
    return {
      success: true,
      message: 'chemicalPurchase Added',
      status: 200,
      data: JSON.stringify(result),
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      message:
        'Unexpected Error Occurred, Failed to create chemical Purchase, Please try later',
      error: JSON.stringify(err),
      status: 500,
      data: null,
    };
  }
};

const deleteChemicalPurchase = async (
  purchaseId: any
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const purchaseInfo = await ChemicalPurchase.findOne({
      _id: purchaseId,
    });
    const chemicalId = purchaseInfo.chemicalId;
    const purchaseQuantity = purchaseInfo.quantity;
    const chemicalDetails = await Chemical.findOne({
      _id: chemicalId,
    });
    const existingQuantity = chemicalDetails.quantity;
    const newQuantity = existingQuantity - purchaseQuantity;
    const updatedChemical = await Chemical.findOneAndUpdate(
      {
        _id: chemicalId,
      },
      {
        $set: {
          quantity: newQuantity,
        },
      },
      {
        new: true,
      }
    );

    console.log(updatedChemical);

    const result = await ChemicalPurchase.deleteOne({ _id: purchaseId });
    return {
      success: true,
      message: 'Compliance Added',
      status: 200,
      error: null,
      data: JSON.stringify(result),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message: 'Unexpected error occurred, Failed to delete, Please try later ',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const fetchChemicalPurchases = async (): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const result = await ChemicalPurchase.find({}).populate(
      'chemicalId',
      'name'
    );
    return {
      success: true,
      status: 200,
      data: JSON.stringify(result),
      error: null,
      message: 'Successfully fetched Chemical issue',
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to fetch Chemical purchases, Please try later',

      error: JSON.stringify(err),
      data: null,
    };
  }
};

export {
  createChemicalPurchase,
  deleteChemicalPurchase,
  fetchChemicalPurchases,
};

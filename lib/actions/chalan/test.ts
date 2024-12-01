'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Test from '@/lib/models/test.model';

const testFunction = async (chalanDetails: any): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    console.log('Chalan Details', chalanDetails);
    // const obj = new Test({
    //     ...chalanDetails
    // })
    // const obj = new  Test(JSON.parse(JSON.stringify(chalanDetails)));
    const obj = new Test({
      workOrder: chalanDetails.workOrder,
      // items:[
      //     {
      //         itemId:chalanDetails.items[0].itemId,
      //         name:chalanDetails.items[0].name
      //     }
      // ]
    });
    const resp = await obj.save();
    const ChalanId = console.log(resp._id);
    const result = await Test.findOneAndUpdate(
      {
        workOrder: chalanDetails.workOrder,
      },
      {
        $push: {
          items: chalanDetails.items,
        },
      },
      {
        new: true,
      }
    );
    console.log('The Results ', result);
    return {
      success: true,
      message: 'Data inserted successfully in the database.',
      data: JSON.stringify(result),
      error: null,
      status: 200,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message: 'Unexpected error occurred, Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

export { testFunction };

'use server';

interface MergedItems {
  itemCost: number;
  unit: string;
  hours: number;
}

import Chalan from '@/lib/models/chalan.model';
import Invoice from '@/lib/models/invoice.model';
import Item from '@/lib/models/item.model';
import { generateContinuousInvoiceNumber } from './invoice';
import { checkIfInvoiceExists } from './invoice';
import { ApiResponse } from '@/interfaces/APIresponses.interface';
import { getYearForInvoiceNaming } from '@/utils/getYearForInvoiceNaming';

const prepareMergedItems = async (
  selectedChalanNumbers: string[]
): Promise<ApiResponse<any>> => {
  try {
    const chalans = await Promise.all(
      selectedChalanNumbers.map(async (chalanNumber) => {
        return await Chalan.findOne({
          chalanNumber: chalanNumber,
        }).maxTimeMS(30000);
      })
    );
    if (!chalans || chalans.length === 0) {
      return {
        success: false,
        status: 404,
        message: 'No chalans found with the provided numbers',
        error: null,
        data: null,
      };
    }
    // console.log(chalans);
    // MERGED ITEMS KO RAKHNE WALA ARRAY
    const mergedItems: { [itemId: string]: MergedItems } = {};

    chalans.forEach((chalan) => {
      // Iterate over items in the current chalan
      chalan.items.forEach((item) => {
        const itemId = item.item.toString();
        const itemCosting = item.itemCosting || 0;
        const unit = item.unit;
        const hours = item.hours || 0;

        // Check if the itemId already exists in mergedItems
        if (mergedItems[itemId] && mergedItems[itemId].unit === unit) {
          // If it exists, update the totalCost and other properties as needed
          mergedItems[itemId].itemCost += itemCosting;
          mergedItems[itemId].unit = unit; // Assuming unit is the same across all entries
          mergedItems[itemId].hours += hours; // Accumulate hours if needed
        } else {
          // If it doesn't exist, create a new entry for the itemId
          mergedItems[itemId] = {
            itemCost: itemCosting,
            unit: unit,
            hours: hours,
          };
        }
      });
    });
    console.log('MERGED ITEMS', mergedItems);
    return {
      data: JSON.stringify(mergedItems),
      error: null,
      status: 200,
      success: true,
      message: 'Successfully prepared merged items',
    };
  } catch (error) {
    return {
      success: false,
      status: 404,
      message:
        'Unexpected error occurred, Failed to prepare merged common items in Please try later',
      error: null,
      data: null,
    };
  }
};
// THIS FUNCTION FUNCTIONALITY SEQUENCE
// - TAKING ARRAY OF CHALAN NUMBERS AND CHECKING ANY IF INVOICE ALREADY EXISTS
// - FETCHING ALL CHALANS
// - PREPARING ITEMS ARRAY FROM ALL CHALANS
// - GENERATING CONTINUOUS INVOICE NUMBER
// - SAVING INVOICE
// - UPDATING ALL CHALANS WITH NEWLY CREATED INVOICE NUMBER
// - RETURNING NEWLY CREATED INVOICE

const mergeChalans = async (
  chalanNumbers: string[],
  invoiceNumber: string
): Promise<ApiResponse<any>> => {
  try {
    // checking any existing invoices with array of chalan number. returning TRUE if NO INVOICE already exists
    // const existresp = await checkIfExisting(chalanNumbers);
    // console.log('existing resp', existresp);
    // IF KE ANDAR SARA CHALAN FETCH KAR KE USKA ITEMS - SIMILAR ITEMS KO MERGE KAR KE - EK ARRAY IN DAAL RHA HAI

    const chalans = await Promise.all(
      chalanNumbers.map(async (chalanNumber) => {
        return await Chalan.findOne({
          chalanNumber: chalanNumber,
        }).maxTimeMS(30000);
      })
    );
    if (!chalans || chalans.length === 0) {
      return {
        success: false,
        status: 404,
        message: 'No chalans found with the provided numbers',
        error: null,
        data: null,
      };
    }
    console.log(chalans);
    // MERGED ITEMS KO RAKHNE WALA ARRAY
    const mergedItems: { [itemId: string]: MergedItems } = {};

    chalans.forEach((chalan) => {
      // Iterate over items in the current chalan
      chalan.items.forEach((item) => {
        const itemId = item.item.toString();
        const itemCosting = item.itemCosting || 0;
        const unit = item.unit;
        const hours = item.hours || 0;

        // Check if the itemId already exists in mergedItems
        if (mergedItems[itemId] && mergedItems[itemId].unit === unit) {
          // If it exists, update the totalCost and other properties as needed
          mergedItems[itemId].itemCost += itemCosting;
          mergedItems[itemId].unit = unit; // Assuming unit is the same across all entries
          mergedItems[itemId].hours += hours; // Accumulate hours if needed
        } else {
          // If it doesn't exist, create a new entry for the itemId
          mergedItems[itemId] = {
            itemCost: itemCosting,
            unit: unit,
            hours: hours,
          };
        }
      });
    });

    // You can now use itemGroups to handle duplicates with different units

    console.log(chalanNumbers);

    const sortedChalanNumbers = chalanNumbers.sort().join(',').trim();

    const invoiceObj = new Invoice({
      invoiceId: sortedChalanNumbers,
      invoiceNumber: `SE/${getYearForInvoiceNaming()}/${invoiceNumber}`,
      mergedItems: JSON.stringify(mergedItems),
      chalans: chalanNumbers,
    });

    const invoiceSaved = await invoiceObj.save();

    console.log(invoiceSaved);
    await Promise.all(
      chalans.map(async (chalan) => {
        chalan.invoiceCreated = true;
        await chalan.save();
      })
    );
    return {
      success: true,
      status: 200,
      message: 'Chalans merged succesfully',
      data: JSON.stringify(invoiceSaved),
      error: null,
    };
    // if (existresp.success && existresp.status == 200) {
    // } else if (existresp.status == 400) {
    //   return {
    //     success: false,
    //     status: 400,
    //     message: 'Invoice already exists',
    //     data: null,
    //     error: null,
    //   };
    // } else {
    //   return {
    //     success: false,
    //     message:
    //       'Unexpected error occurred, Failed merge chalans,Please try later',
    //     status: 500,
    //     error: null,
    //     data: null,
    //   };
    // }
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      error: JSON.stringify(err),
      message:
        'Unexpected error occurred, Failed merge chalans,Please try later',
      data: null,
    };
  }
};
// const mergeChalans = async (
//   chalanNumbers: string[]
// ): Promise<ApiResponse<any>> => {
//   try {
//     // checking any existing invoices with array of chalan number. returning TRUE if NO INVOICE already exists
//     const existresp = await checkIfExisting(chalanNumbers);
//     console.log('existing resp', existresp);
//     if (existresp.success && existresp.status == 200) {
//       // IF KE ANDAR SARA CHALAN FETCH KAR KE USKA ITEMS - SIMILAR ITEMS KO MERGE KAR KE - EK ARRAY IN DAAL RHA HAI
//       const chalans = await Promise.all(
//         chalanNumbers.map(async (chalanNumber) => {
//           return await Chalan.findOne({
//             chalanNumber: chalanNumber,
//           }).maxTimeMS(30000);
//         })
//       );
//       if (!chalans || chalans.length === 0) {
//         return {
//           success: false,
//           status: 404,
//           message: 'No chalans found with the provided numbers',
//           error: null,
//           data: null,
//         };
//       }
//       console.log(chalans);
//       // MERGED ITEMS KO RAKHNE WALA ARRAY
//       const mergedItems: { [itemId: string]: MergedItems } = {};

//       chalans.forEach((chalan) => {
//         // Iterate over items in the current chalan
//         chalan.items.forEach((item) => {
//           const itemId = item.item.toString();
//           const itemCosting = item.itemCosting || 0;
//           const unit = item.unit;
//           const hours = item.hours || 0;

//           // Check if the itemId already exists in mergedItems
//           if (mergedItems[itemId] && mergedItems[itemId].unit === unit) {
//             // If it exists, update the totalCost and other properties as needed
//             mergedItems[itemId].itemCost += itemCosting;
//             mergedItems[itemId].unit = unit; // Assuming unit is the same across all entries
//             mergedItems[itemId].hours += hours; // Accumulate hours if needed
//           } else {
//             // If it doesn't exist, create a new entry for the itemId
//             mergedItems[itemId] = {
//               itemCost: itemCosting,
//               unit: unit,
//               hours: hours,
//             };
//           }
//         });
//       });

//       // chalans.forEach((chalan) => {
//       //     // Iterate over items in the current chalan
//       //     chalan.items.forEach((item) => {
//       //         const itemId = item.item.toString();
//       //         const itemCosting = item.itemCosting || 0;
//       //         const unit = item.unit;
//       //         const hours = item.hours || 0;

//       //         // Create a unique identifier for items based on both itemId and unit
//       //         const uniqueKey = `${itemId}_${unit}`;

//       //         // Check if the unique key already exists in mergedItems
//       //         if (mergedItems[uniqueKey]) {
//       //             // Update the existing entry with the same unique key
//       //             mergedItems[uniqueKey].itemCost += itemCosting;
//       //             mergedItems[uniqueKey].hours += hours;
//       //         } else {
//       //             // Create a new entry with the unique key
//       //             mergedItems[uniqueKey] = {
//       //                 itemCost: itemCosting,
//       //                 unit: unit,
//       //                 hours: hours
//       //             };
//       //         }
//       //     });
//       // });

//       // Retain duplicate values for items with different units by using an array for duplicate itemIds
//       // const itemGroups: { [itemId: string]: MergedItems[] } = {};

//       // Object.keys(mergedItems).forEach((uniqueKey) => {
//       //     const [itemId] = uniqueKey.split('_');
//       //     if (itemGroups[itemId]) {
//       //         // Push the unique entry into the array for this itemId
//       //         itemGroups[itemId].push(mergedItems[uniqueKey]);
//       //     } else {
//       //         // Initialize the array with the first entry for this itemId
//       //         itemGroups[itemId] = [mergedItems[uniqueKey]];
//       //     }
//       //     // Delete the original unique key entry
//       //     delete mergedItems[uniqueKey];
//       // });

//       // You can now use itemGroups to handle duplicates with different units

//       console.log(chalanNumbers);

//       const sortedChalanNumbers = chalanNumbers.sort().join(',').trim();

//       console.log(typeof sortedChalanNumbers);
//       // NEW INVOICE NUMBER GENERATE KAR RHA HAI JO SAVE HO JA RHA HAI BEFORE GENERATING OR ENTERING ANY NUMBER ON enter-inovice-number page
//       let generatedInvoiceNumber = await generateContinuousInvoiceNumber();

//       const finalInvoiceNumber = generatedInvoiceNumber.data.slice(1, -1);

//       const invoiceObj = new Invoice({
//         invoiceId: sortedChalanNumbers,
// invoiceNumber: `SE/${getYearForInvoiceNaming()}/${finalInvoiceNumber}`,
//         mergedItems: JSON.stringify(mergedItems),
//         chalans: chalanNumbers,
//       });

//       const invoiceSaved = await invoiceObj.save();

//       console.log(invoiceSaved);
//       await Promise.all(
//         chalans.map(async (chalan) => {
//           chalan.invoiceCreated = true;
//           await chalan.save();
//         })
//       );
//       return {
//         success: true,
//         status: 200,
//         message: 'Chalans merged succesfully',
//         data: JSON.stringify(invoiceSaved),
//         error: null,
//       };
//     } else if (existresp.status == 400) {
//       return {
//         success: false,
//         status: 400,
//         message: 'Invoice already exists',
//         data: null,
//         error: null,
//       };
//     } else {
//       return {
//         success: false,
//         message:
//           'Unexpected error occurred, Failed merge chalans,Please try later',
//         status: 500,
//         error: null,
//         data: null,
//       };
//     }
//   } catch (err) {
//     console.log(err);
//     return {
//       success: false,
//       status: 500,
//       error: JSON.stringify(err),
//       message:
//         'Unexpected error occurred, Failed merge chalans,Please try later',
//       data: null,
//     };
//   }
// };

export { mergeChalans, prepareMergedItems };

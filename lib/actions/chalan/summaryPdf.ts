'use server';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Chalan from '@/lib/models/chalan.model';
import Invoice from '@/lib/models/invoice.model';
import Item from '@/lib/models/item.model';

const getSummaryPdfData = async (
  invoiceId: string
): Promise<ApiResponse<any>> => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const items = await Item.find({});
    const itemsMap = new Map<string, string>();
    items.forEach((item) => {
      itemsMap.set(item._id.toString(), item.itemName);
    });

    console.log('Items Map', itemsMap);
    const invoice = await Invoice.findOne({ invoiceId });

    if (!invoice) {
      return {
        success: false,
        status: 404,
        message: 'Invoice not found',
        error: null,
        data: null,
      };
    }

    const chalans = invoice.chalans;
    const map = new Map<
      string,
      { from: Date; to: Date; locations: Set<string> }
    >();
    const addValueToMap = (key: string, date: Date, location: string) => {
      const dateObj = new Date(date);

      if (!map.has(key)) {
        map.set(key, {
          from: dateObj,
          to: dateObj,
          locations: new Set([location]),
        });
      } else {
        const currentValue = map.get(key)!;
        if (dateObj < currentValue.from) {
          currentValue.from = dateObj;
        }
        if (dateObj > currentValue.to) {
          currentValue.to = dateObj;
        }
        currentValue.locations.add(location);
      }
    };
    const chalanPromises = chalans.map(async (chalanNumber) => {
      const chalan = await Chalan.findOne({ chalanNumber });

      if (chalan) {
        const chalanItems = chalan.items;
        const chalanDate = chalan.date;
        const chalanLocation = chalan.location;

        chalanItems.forEach((ele) => {
          const itemName = itemsMap.get(ele.item.toString());

          if (itemName) {
            addValueToMap(itemName, chalanDate, chalanLocation);
          }
        });
      }
    });
    await Promise.all(chalanPromises);

    return {
      success: true,
      status: 200,
      message: 'Fetched successfully',
      data: map,
      error: null,
    };
  } catch (err) {
    console.error('Error fetching summary PDF data', err);
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to fetch summary pdf,Please try later',
      error: JSON.stringify(err),
      data: null,
    };
  }
};

const getDistinguishedSummaryData = async (chalanNumbers: string[]) => {
  try {
    // Connect to the database
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    // Fetch items and create a mapping of item IDs to names
    const items = await Item.find({});
    const itemsMap = new Map();
    items.forEach((item) => {
      itemsMap.set(item._id.toString(), item.itemName);
    });
    console.log('Items Map:', itemsMap);

    // Fetch the invoice document
    // const invoice = await Invoice.findOne({ invoiceId });
    // if (!invoice) {
    //   return {
    //     success: false,
    //     status: 404,
    //     message: 'Invoice not found',
    //     error: null,
    //     data: null,
    //   };
    // }

    // Collect results
    const result: any = {};

    // Process each chalan in the invoice
    await Promise.all(
      chalanNumbers?.map(async (chalanNumber) => {
        const chalanDoc = await Chalan.findOne({ chalanNumber });
        if (chalanDoc) {
          const { items: chalanItems, date, location } = chalanDoc;

          // Process each item in the chalan
          chalanItems.forEach((chalanItem) => {
            const itemId = chalanItem.item.toString();
            if (itemsMap.has(itemId)) {
              // Initialize structure if not present
              if (!result[itemId]) {
                result[itemId] = {
                  totalHours: 0,
                  details: [],
                };
              }

              // Update total hours
              result[itemId].totalHours += chalanItem.hours;

              // Add details to the result
              result[itemId].details.push({
                itemDescription: itemsMap.get(itemId),
                chalanNumber,
                chalanDate: date,
                location,
                workingHour: chalanItem.hours,
              });
            }
          });
        }
      })
    );

    // Log the result with details
    console.log('Result Summary:');
    for (const [itemId, data] of Object.entries(result) as [string, any][]) {
      console.log(`Item ID: ${itemId}`);

      console.log(`  Total Hours: ${data.totalHours}`);
      console.log(`  Details:`);
      data.details.forEach((detail: any, index: number) => {
        console.log(`    ${index + 1}. ${JSON.stringify(detail, null, 2)}`);
      });
    }

    return {
      success: true,
      status: 200,
      message: 'Data fetched successfully',
      data: result,
    };
  } catch (err) {
    console.error('Error in getDistinguishedSummaryData:', err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: JSON.stringify(err),
    };
  }
};
// const getDistinguishedSummaryData = async (invoiceId) => {
//   try {
//     // Connect to the database
//  const dbConnection = await handleDBConnection();
//  if (!dbConnection.success) return dbConnection;
//     // Fetch items and create a mapping of item IDs to names
//     const items = await Item.find({});
//     const itemsMap = new Map();
//     items.forEach((item) => {
//       itemsMap.set(item._id.toString(), item.itemName);
//     });
//     console.log('Items Map:', itemsMap);

//     // Fetch the invoice document
//     const invoice = await Invoice.findOne({ invoiceId });
//     if (!invoice) {
//       return {
//         success: false,
//         status: 404,
//         message: 'Invoice not found',
//         error: null,
//         data: null,
//       };
//     }

//     // Collect results
//     const result: any = {};

//     // Process each chalan in the invoice
//     await Promise.all(
//       invoice.chalans.map(async (chalanNumber) => {
//         const chalanDoc = await Chalan.findOne({ chalanNumber });
//         if (chalanDoc) {
//           const { items: chalanItems, date, location } = chalanDoc;

//           // Process each item in the chalan
//           chalanItems.forEach((chalanItem) => {
//             const itemId = chalanItem.item.toString();
//             if (itemsMap.has(itemId)) {
//               // Initialize structure if not present
//               if (!result[itemId]) {
//                 result[itemId] = {
//                   totalHours: 0,
//                   details: [],
//                 };
//               }

//               // Update total hours
//               result[itemId].totalHours += chalanItem.hours;

//               // Add details to the result
//               result[itemId].details.push({
//                 itemDescription: itemsMap.get(itemId),
//                 chalanNumber,
//                 chalanDate: date,
//                 location,
//                 workingHour: chalanItem.hours,
//               });
//             }
//           });
//         }
//       })
//     );

//     // Log the result with details
//     console.log('Result Summary:');
//     for (const [itemId, data] of Object.entries(result) as [string, any][]) {
//       console.log(`Item ID: ${itemId}`);

//       console.log(`  Total Hours: ${data.totalHours}`);
//       console.log(`  Details:`);
//       data.details.forEach((detail: any, index: number) => {
//         console.log(`    ${index + 1}. ${JSON.stringify(detail, null, 2)}`);
//       });
//     }

//     return {
//       success: true,
//       status: 200,
//       message: 'Data fetched successfully',
//       data: result,
//     };
//   } catch (err) {
//     console.error('Error in getDistinguishedSummaryData:', err);
//     return {
//       success: false,
//       status: 500,
//       message: 'Internal Server Error',
//       error: JSON.stringify(err),
//     };
//   }
// };

export { getDistinguishedSummaryData };

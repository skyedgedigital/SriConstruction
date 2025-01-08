'use server';

import { PaymentReportResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import Wages from '@/lib/models/HR/wages.model';
import mongoose from 'mongoose';

const fetchPaymentReport = async (
  filter: string
): Promise<PaymentReportResponse> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const searchFilter = JSON.parse(filter);
    const { year, month } = searchFilter;

    const aggregatedData = await Wages.aggregate([
      { $match: { year: parseInt(year), month: parseInt(month) } },
      {
        $lookup: {
          from: 'workorderhrs',
          localField: 'workOrderHr',
          foreignField: '_id',
          as: 'workOrderHr',
        },
      },
      { $unwind: '$workOrderHr' },
      {
        $lookup: {
          from: 'employeedatas',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData',
        },
      },
      {
        $unwind: {
          path: '$employeeData',
          preserveNullAndEmptyArrays: true, // Keep records even if employee data is missing
        },
      },
      {
        $group: {
          _id: '$workOrderHr.workOrderNumber',
          workOrderDetails: { $first: '$workOrderHr' },
          employeeCount: { $addToSet: '$employee' },
          totalAttendance: { $sum: '$attendance' },
          totalAmount: { $sum: '$total' },
          totalNetAmount: { $sum: '$netAmountPaid' },
          totalIncentiveAmount: { $sum: '$incentiveAmount' },
          totalAllowancesAmount: { $sum: '$allowances' },
          totalPF: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ifNull: ['$employeeData', false] }, // Check if employee data exists
                    { $ifNull: ['$employeeData.pfApplicable', false] }, // Check if pfApplicable exists and is true
                  ],
                },
                {
                  $multiply: [
                    {
                      $subtract: [
                        '$total',
                        { $add: ['$incentiveAmount', '$allowances'] },
                      ],
                    },
                    0.12,
                  ],
                },
                0,
              ],
            },
          },
          totalESIC: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ifNull: ['$employeeData', false] }, // Check if employee data exists
                    { $ifNull: ['$employeeData.ESICApplicable', false] }, // Check if ESICApplicable exists and is true
                  ],
                },
                { $multiply: ['$total', 0.0075] },
                0,
              ],
            },
          },
          // Keep track of missing data for reporting
          missingPFCount: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$employeeData', null] },
                    { $eq: ['$employeeData.pfApplicable', null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          missingESICCount: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$employeeData', null] },
                    { $eq: ['$employeeData.ESICApplicable', null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          workOrderNumber: '$_id',
          workOrderDetails: 1,
          employeeCount: { $size: '$employeeCount' },
          totalAttendance: 1,
          totalAmount: { $round: ['$totalAmount', 2] },
          totalNetAmount: { $round: ['$totalNetAmount', 2] },
          totalIncentiveAmount: { $round: ['$totalIncentiveAmount', 2] },
          totalAllowancesAmount: { $round: ['$totalAllowancesAmount', 2] },
          totalPF: { $round: ['$totalPF', 2] },
          totalESIC: { $round: ['$totalESIC', 2] },
          missingPFCount: 1,
          missingESICCount: 1,
        },
      },
    ]);

    // Add warning if there's missing data
    const hasMissingData = aggregatedData.some(
      (data) => data.missingPFCount > 0 || data.missingESICCount > 0
    );

    if (hasMissingData) {
      const missingDataSummary = aggregatedData.reduce((acc, data) => {
        if (data.missingPFCount > 0) {
          acc.push(
            `${data.workOrderNumber}: ${data.missingPFCount} employees missing PF status`
          );
        }
        if (data.missingESICCount > 0) {
          acc.push(
            `${data.workOrderNumber}: ${data.missingESICCount} employees missing ESIC status`
          );
        }
        return acc;
      }, [] as string[]);

      return {
        success: true,
        message:
          'Payment report fetched with warnings: ' +
          missingDataSummary.join('; '),
        data: JSON.stringify(aggregatedData),
        status: 200,
        error: null,
        warnings: missingDataSummary,
      };
    }

    return {
      success: true,
      message: 'Payment report fetched successfully.',
      data: JSON.stringify(aggregatedData),
      status: 200,
      error: null,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: 'Failed to fetch payment report.',
      data: null,
      status: 500,
      error: JSON.stringify(err.message),
    };
  }
};

export { fetchPaymentReport };

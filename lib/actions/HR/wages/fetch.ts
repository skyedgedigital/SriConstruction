'use server';

import { EmployeeDataSchema } from '@/lib/models/HR/EmployeeData.model';
import { DesignationSchema } from '@/lib/models/HR/designation.model';
import Wages from '@/lib/models/HR/wages.model';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';
import WorkOrderHr from '@/lib/models/HR/workOrderHr.model';
import attendanceAction from '../../attendance/attendanceAction';
import mongoose, { PipelineStage } from 'mongoose';
import { DepartmentHrSchema } from '@/lib/models/HR/department_hr';
import { BankSchema } from '@/lib/models/HR/bank.model';
import { endOfYear } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import handleDBConnection from '@/lib/database';
import { ApiResponse } from '@/interfaces/APIresponses.interface';
import Attendance from '@/lib/models/HR/attendance.model';
import { employee } from '../../../../types/employee.type';
import { YearlyWageInfo } from './types';
const designationModel =
  mongoose.models.Designation ||
  mongoose.model('Designation', DesignationSchema);
const employeeDataModel =
  mongoose.models.EmployeeData ||
  mongoose.model('EmployeeData', EmployeeDataSchema);
const DepartmentHrModel =
  mongoose.models.DepartmentHr ||
  mongoose.model('DepartmentHr', DepartmentHrSchema);
const BankModel = mongoose.models.Bank || mongoose.model('Bank', BankSchema);

const fetchFilledWages = async (
  month: number,
  year: number,
  workOrderHr: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const filter: Record<string, any> = { month, year };

    if (workOrderHr !== 'Default') {
      filter.workOrderHr = workOrderHr;
    }

    const resp = await Wages.find(filter)
      .populate('designation')
      .populate({
        path: 'employee',
        populate: [
          {
            path: 'designation',
            model: 'Designation',
          },
          {
            path: 'bank',
            model: 'Bank', // Assuming you have a Bank model
          },
        ],
      });
    // console.log('bbbbbbbbbbbbbb', resp);
    const sortedResp = resp?.sort((a, b) =>
      a.employee?.name.localeCompare(b.employee?.name)
    );

    // TEMPORARY ALLOWING EMPLOYEE TO PASS WITHOUT ATTENDANCE DAYS
    // DID BECAUSE OF A BUG THAT DID NOT FOUND RECORD FOR AN EMPLOYEE, YET ALLOWED TO PASS

    const tempArrayToPass = [];
    for (let i = 0; i < sortedResp.length; i++) {
      if (sortedResp[i].employee) {
        tempArrayToPass.push(sortedResp[i]);
      }
    }

    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Wages',
      data: JSON.stringify(tempArrayToPass),
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      status: 500,
      message:
        'Unexpected error occures, Failed to fetch Filled wages, Please try later',
      error: JSON.stringify(err),
      success: false,
      data: null,
    };
  }
};
const fetchFilledWagesWithAttendanceDays = async (
  month: number,
  year: number,
  workOrderHr: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const filter: Record<string, any> = { month, year };

    if (workOrderHr !== 'Default') {
      filter.workOrderHr = workOrderHr;
    }

    const wages = await Wages.find(filter)
      .populate('designation')
      .populate({
        path: 'employee',
        populate: [
          {
            path: 'designation',
            model: 'Designation',
          },
          {
            path: 'bank',
            model: 'Bank', // Assuming you have a Bank model
          },
        ],
      });
    // console.log('bbbbbbbbbbbbbb', wages);
    if (!wages) {
      return {
        status: 500,
        message:
          'Unexpected error occures, Failed to fetch Filled wages, Please try later',
        error: null,
        success: false,
        data: null,
      };
    }

    const employees = wages?.map((employee) => employee?.employee?._id);
    // console.log('included employees', employees);
    const attendances = await Attendance.find({
      employee: { $in: employees },
      year,
      month,
    }).select('days employee');

    // console.log('attendances', attendances);
    const wagesResponseWithAttendanceDays = [];
    wages.forEach((wemployee) => {
      const x = attendances?.find(
        (emp) =>
          emp?.employee.toString() === wemployee?.employee?._id.toString()
      );

      // TEMPORARY ALLOWING EMPLOYEE TO PASS WITHOUT ATTENDANCE DAYS
      // DID BECAUSE OF A BUG THAT DID NOT FOUND RECORD FOR AN EMPLOYEE, YET ALLOWED TO PASS
      if (x) {
        wagesResponseWithAttendanceDays.push({
          ...wemployee._doc,
          days: x.days,
        });
      }
      // console.log('final array pushed', wagesResponseWithAttendanceDays);
    });

    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Wages',
      data: JSON.stringify(wagesResponseWithAttendanceDays),
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      status: 500,
      message:
        'Unexpected error occures, Failed to fetch Filled wages, Please try later',
      error: JSON.stringify(err),
      success: false,
      data: null,
    };
  }
};

const fetchWageForAnEmployee = async (dataString: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    const { employee, month, year } = data;
    const empData = await EmployeeData.findOne({
      _id: employee,
    })
      .populate('department')
      .populate('designation')
      .populate('ESILocation');
    if (!empData) {
      return {
        status: 404,
        message: 'Employee Not Found',
        success: false,
      };
    }
    const filter = {
      employee: employee,
      month: month,
      year: year,
    };
    const attendanceRecords = await attendanceAction.FETCH.fetchStatus(
      JSON.stringify(filter)
    );
    if (!attendanceRecords) {
      return {
        status: 404,
        message: 'Attendance for the Employee Not Found',
        success: false,
      };
    }
    const resp = await Wages.find({
      employee: employee,
      month: month,
      year: year,
    })
      .populate('designation')
      .populate('employee');
    // console.log(resp);
    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Wages for the Employee',
      data: JSON.stringify(resp),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      err: JSON.stringify(err),
      message: 'Internal Server Error',
    };
  }
};

const fetchWagesForFinancialYear = async (dataString) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    const { year, workOrder, bonusPercentage } = data;
    const startDate = new Date(year, 3, 1); // April of the given year
    const endDate = new Date(year + 1, 2, 31); // March of the following year

    const resEmployees = await EmployeeData.aggregate([
      {
        $addFields: {
          appointmentDateObj: {
            $cond: {
              if: { $eq: ['$appointmentDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$appointmentDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
          resignDateObj: {
            $cond: {
              if: { $eq: ['$resignDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$resignDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
        },
      },
      {
        $match: {
          appointmentDateObj: { $lte: endDate },
          $or: [
            { resignDateObj: { $gte: startDate } },
            { resignDateObj: null },
          ],
        },
      },
      {
        $lookup: {
          from: 'designations',
          localField: 'designation',
          foreignField: '_id',
          as: 'designation_details',
        },
      },
      {
        $lookup: {
          from: 'departmenthrs',
          localField: 'department',
          foreignField: '_id',
          as: 'department_details',
        },
      },
    ]);
    const employees = resEmployees.sort((a, b) => {
      return Number(a.workManNo) - Number(b.workManNo);
    });
    // console.log('yere employees vaiii', employees);

    if (employees.length === 0) {
      return {
        status: 404,
        message: 'No Employees Found',
        success: false,
      };
    }

    // Fetch wages for each employee
    const wagesData = [];
    for (const employee of employees) {
      if (
        employee.workOrderHr.find(
          (entry) => entry.workOrderHr.toString() === workOrder.toString()
        )
      ) {
        // console.log(employee.appointmentDate);
        const wages = await Wages.find({
          employee: employee._id,
          //removed

          $or: [
            { year: year, month: { $in: [4, 5, 6, 7, 8, 9, 10, 11, 12] } },
            { year: year + 1, month: { $in: [1, 2, 3] } },
          ],
        })
          .populate('designation')
          .populate('employee');
        // console.log('Wages data', wages);
        if (wages.length == 0) continue;

        const employeeDoc = await EmployeeData.findById(employee._id);

        const currentYear = new Date().getFullYear();

        // Check for missing months
        const monthsInYear = new Set([4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]);
        const fetchedMonths = new Set(wages.map((wage) => wage.month));
        // @ts-ignore
        const missingMonths = [...monthsInYear].filter(
          (month) => !fetchedMonths.has(month)
        );

        // Calculate bonus and totalAttendance

        // Create objects for missing months with attendance as 0 and netAmountPaid as 0
        const missingWages = missingMonths.map((month) => ({
          employee: employee._id,
          designation: null, // or handle as needed
          month: month,
          year: month >= 4 ? year : year + 1,
          attendance: 0,
          netAmountPaid: 0,
        }));

        // Concatenate missingWages with fetched wages
        const allWages = [...wages, ...missingWages];

        // Sort allWages by year and month
        allWages.sort((a, b) => {
          if (a.year === b.year) {
            return a.month - b.month;
          } else {
            return a.year - b.year;
          }
        });
        // Find the work order by workOrderNumber and update the bonusRate
        const Store_Update_bp = await WorkOrderHr.findOneAndUpdate(
          { workOrder },
          { bonusRate: bonusPercentage }, // Update the bonus rate field
          { new: true } // Return the updated document
        );

        if (!Store_Update_bp) {
          console.log('Not Found!!!');
        } else {
          console.log('Updated SuccessFully');
        }
        // Calculate bonus and totalAttendance
        const totalNetAmountPaid = allWages.reduce(
          (sum, wage) => sum + wage.netAmountPaid,
          0
        );
        const totalAttendance = allWages.reduce(
          (sum, wage) => sum + wage.attendance,
          0
        );
        const bonus = totalNetAmountPaid * (bonusPercentage / 100); //bonusPercentage -> Url
        wagesData.push({
          employee: employee,
          wages: allWages,
          missingMonths: missingMonths,
          bonus: bonus,
          totalNetAmountPaid: totalNetAmountPaid,
          totalAttendance: totalAttendance,
        });
      }
    }

    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Wages for the Financial Year',
      data: JSON.stringify(wagesData),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      err: JSON.stringify(err),
      message: 'Internal Server Error',
    };
  }
};

const fetchWagesForFinancialYearStatement = async (dataString) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    data.bonusPercentage = data.bonusPercentage || 8.33;
    const { year, workOrder, bonusPercentage } = data;
    // console.log('bonusPercentage', bonusPercentage);
    const startDate = new Date(year, 3, 1); // April of the given year
    const endDate = new Date(year + 1, 2, 31); // March of the following year

    const resEmployees = await EmployeeData.aggregate([
      {
        $addFields: {
          appointmentDateObj: {
            $cond: {
              if: { $eq: ['$appointmentDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$appointmentDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
          resignDateObj: {
            $cond: {
              if: { $eq: ['$resignDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$resignDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
        },
      },
      {
        $match: {
          appointmentDateObj: { $lte: endDate },
          $or: [
            { resignDateObj: { $gte: startDate } },
            { resignDateObj: null },
          ],
        },
      },
      {
        $lookup: {
          from: 'designations',
          localField: 'designation',
          foreignField: '_id',
          as: 'designation_details',
        },
      },
      {
        $lookup: {
          from: 'departmenthrs',
          localField: 'department',
          foreignField: '_id',
          as: 'department_details',
        },
      },
    ]);
    const employees = resEmployees.sort((a, b) => {
      return Number(a.workManNo) - Number(b.workManNo);
    });
    // console.log('yere employees vaiii', employees);
    if (employees.length === 0) {
      return {
        status: 404,
        message: 'No Employees Found',
        success: false,
      };
    }

    // Fetch wages for each employee
    const wagesData = [];
    for (const employee of employees) {
      const query = {
        employee: employee._id,
        $or: [
          { year: year, month: { $in: [4, 5, 6, 7, 8, 9, 10, 11, 12] } },
          { year: year + 1, month: { $in: [1, 2, 3] } },
        ],
      };

      // Conditionally add workOrderHr only when workOrder is not "Default"
      if (workOrder !== 'Default') {
        //@ts-ignore
        query.workOrderHr = workOrder;
      }

      // console.log('kkkkkkkkkkkkkk', query);
      // Perform the query
      const wages = await Wages.find(query)
        .populate('designation')
        .populate('employee');
      if (wages.length == 0) continue;
      const employeeDoc = await EmployeeData.findById(employee._id);

      const currentYear = new Date().getFullYear();

      // Fetch the employee's bonus data
      if (!employeeDoc.bonus || employeeDoc.bonus.length == 0) {
        const startYear = new Date(employeeDoc.appointmentDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const bonusLeaveData = [];

        for (let year = startYear; year <= currentYear; year++) {
          bonusLeaveData.push({ year, status: false });
        }
        employeeDoc.bonus = bonusLeaveData;
      }
      const lastBonusYear =
        employeeDoc.bonus[employeeDoc.bonus.length - 1].year;

      if (lastBonusYear < currentYear) {
        for (let year = lastBonusYear + 1; year <= currentYear; year++) {
          employeeDoc.bonus.push({ year, status: false });
        }
      }

      employeeDoc.bonus = employeeDoc.bonus.map((bonusEntry) => {
        if (bonusEntry.year === year) {
          bonusEntry.status = true;
        }
        return bonusEntry;
      });
      await employeeDoc.save();

      // Check for missing months
      const monthsInYear = new Set([4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]);
      const fetchedMonths = new Set(wages.map((wage) => wage.month));
      // @ts-ignore
      const missingMonths = [...monthsInYear].filter(
        (month) => !fetchedMonths.has(month)
      );

      // Calculate bonus and totalAttendance

      // Create objects for missing months with attendance as 0 and netAmountPaid as 0
      const missingWages = missingMonths.map((month) => ({
        employee: employee._id,
        designation: null, // or handle as needed
        month: month,
        year: month >= 4 ? year : year + 1,
        attendance: 0,
        netAmountPaid: 0,
      }));

      // Concatenate missingWages with fetched wages
      const allWages = [...wages, ...missingWages];

      // Sort allWages by year and month
      allWages.sort((a, b) => {
        if (a.year === b.year) {
          return a.month - b.month;
        } else {
          return a.year - b.year;
        }
      });

      // Calculate bonus and totalAttendance
      const totalNetAmountPaid = allWages.reduce(
        (sum, wage) => sum + wage.netAmountPaid,
        0
      );
      const totalAttendance = allWages.reduce(
        (sum, wage) => sum + wage.attendance,
        0
      );

      const bonus = totalNetAmountPaid * (bonusPercentage / 100);
      wagesData.push({
        employee: employee,
        wages: allWages,
        missingMonths: missingMonths,
        bonus: bonus,
        totalNetAmountPaid: totalNetAmountPaid,
        totalAttendance: totalAttendance,
      });
    }
    // console.log(wagesData, WorkOrderHr, 'yeiiii hai bhaiii');
    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Wages for the Financial Year',
      data: JSON.stringify(wagesData),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      err: JSON.stringify(err),
      message: 'Internal Server Error',
    };
  }
};

const fetchWagesForFinancialYearStatement2 = async (dataString) => {
  const startTime = Date.now();
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;

  try {
    const data = JSON.parse(dataString);
    data.bonusPercentage = data.bonusPercentage || 8.33;
    const { year, workOrder, bonusPercentage } = data;
    const workOrderId =
      workOrder !== 'Default' ? new mongoose.Types.ObjectId(workOrder) : null;
    const startDate = new Date(year, 3, 1); // April of the given year
    const endDate = new Date(year + 1, 2, 31); // March of following year

    // Main aggregation pipeline
    const pipeline: PipelineStage[] = [
      {
        $addFields: {
          appointmentDateObj: {
            $cond: {
              if: { $eq: ['$appointmentDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$appointmentDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
          resignDateObj: {
            $cond: {
              if: { $eq: ['$resignDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$resignDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
        },
      },
      {
        $match: {
          appointmentDateObj: { $lte: endDate },
          $or: [
            { resignDateObj: { $gte: startDate } },
            { resignDateObj: null },
          ],
        },
      },
      {
        $lookup: {
          from: 'designations',
          localField: 'designation',
          foreignField: '_id',
          as: 'designation_details',
        },
      },
      {
        $unwind: {
          path: '$designation_details',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'departmenthrs',
          localField: 'department',
          foreignField: '_id',
          as: 'department_details',
        },
      },
      {
        $unwind: {
          path: '$department_details',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'wages',
          let: { empId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$employee', '$$empId'] },
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ['$year', year] },
                            { $in: ['$month', [4, 5, 6, 7, 8, 9, 10, 11, 12]] },
                          ],
                        },
                        {
                          $and: [
                            { $eq: ['$year', year + 1] },
                            { $in: ['$month', [1, 2, 3]] },
                          ],
                        },
                      ],
                    },
                    ...(workOrderId
                      ? [{ $eq: ['$workOrderHr', workOrderId] }]
                      : []),
                  ],
                },
              },
            },
          ],
          as: 'wages',
        },
      },
      { $sort: { workManNo: 1 } },
    ];

    const employees = await EmployeeData.aggregate(pipeline);
    if (employees.length === 0) {
      return { status: 404, message: 'No Employees Found', success: false };
    }

    // Prepare bulk operations and wages data
    const currentYear = new Date().getFullYear();
    const bulkOps = [];
    const wagesData = [];

    for (const employee of employees) {
      // Process bonus data
      const startYear = new Date(employee.appointmentDate).getFullYear();
      let bonusData = employee.bonus || [];

      // Update bonus array structure
      if (bonusData.length === 0) {
        bonusData = Array.from(
          { length: currentYear - startYear + 1 },
          (_, i) => ({
            year: startYear + i,
            status: false,
          })
        );
      } else {
        const lastYear = bonusData[bonusData.length - 1].year;
        if (lastYear < currentYear) {
          bonusData.push(
            ...Array.from({ length: currentYear - lastYear }, (_, i) => ({
              year: lastYear + i + 1,
              status: false,
            }))
          );
        }
      }

      // Update bonus status for current year
      const updatedBonus = bonusData.map((entry) =>
        entry.year === year ? { ...entry, status: true } : entry
      );

      bulkOps.push({
        updateOne: {
          filter: { _id: employee._id },
          update: { $set: { bonus: updatedBonus } },
        },
      });

      // Process wages
      const financialYearMonths = [
        ...Array.from({ length: 9 }, (_, i) => ({ month: i + 4, year: year })),
        ...Array.from({ length: 3 }, (_, i) => ({
          month: i + 1,
          year: year + 1,
        })),
      ];

      const wageMap = new Map(
        employee.wages.map((w: any) => [`${w.year}-${w.month}`, w])
      );

      const allWages = financialYearMonths
        .map(
          ({ month, year }) =>
            wageMap.get(`${year}-${month}`) || {
              employee: employee._id,
              designation: null,
              month,
              year,
              attendance: 0,
              netAmountPaid: 0,
            }
        )
        .sort((a: any, b: any) =>
          a.year === b.year ? a.month - b.month : a.year - b.year
        );

      // Calculate totals
      const totalNetAmountPaid: any = allWages.reduce(
        (sum, w: any) => sum + w.netAmountPaid,
        0
      );
      const totalAttendance = allWages.reduce(
        (sum, w: any) => sum + w.attendance,
        0
      );
      const bonus = totalNetAmountPaid * (bonusPercentage / 100);

      wagesData.push({
        employee,
        wages: allWages,
        missingMonths: allWages
          .filter((w: any) => w.attendance === 0)
          .map((w: any) => w.month),
        bonus,
        totalNetAmountPaid,
        totalAttendance,
      });
    }

    // Execute bulk update
    if (bulkOps.length > 0) {
      await EmployeeData.bulkWrite(bulkOps);
    }

    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Wages for the Financial Year',
      data: JSON.stringify(wagesData),
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      err: JSON.stringify(err),
    };
  }
};

const fetchWagesForCalendarYear = async (dataString) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;

  try {
    const data = JSON.parse(dataString);
    const { year, workOrder } = data;
    // console.log(workOrder);
    const startDate = new Date(year, 0, 1); // January 1st of the given year
    const endDate = new Date(year, 11, 31); // December 31st of the given year

    // Fetch all employees whose appointment and resignation dates meet the criteria
    const employees = await EmployeeData.aggregate([
      {
        $addFields: {
          appointmentDateObj: {
            $cond: {
              if: { $eq: ['$appointmentDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$appointmentDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
          resignDateObj: {
            $cond: {
              if: { $eq: ['$resignDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$resignDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
        },
      },
      {
        $match: {
          appointmentDateObj: { $lte: endDate },
          $or: [
            { resignDateObj: { $gte: startDate } },
            { resignDateObj: null },
          ],
        },
      },
      {
        $lookup: {
          from: 'designations',
          localField: 'designation',
          foreignField: '_id',
          as: 'designation_details',
        },
      },
      {
        $lookup: {
          from: 'departmenthrs',
          localField: 'department',
          foreignField: '_id',
          as: 'department_details',
        },
      },
    ]);
    // console.log('yetirerererrere', employees);
    if (employees.length === 0) {
      return {
        status: 404,
        message: 'No Employees Found',
        success: false,
      };
    }

    // Fetch wages for each employee
    const wagesData = [];
    for (const employee of employees) {
      if (
        employee.workOrderHr.find(
          (entry) => entry.workOrderHr.toString() === workOrder.toString()
        )
      ) {
        const wages = await Wages.find({
          employee: employee._id,
          year: year,
          month: { $in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
        })
          .populate('designation')
          .populate('employee');
        if (wages.length == 0) continue;

        const attendances = await Attendance.find({
          employee: employee._id,
          year: year,
          month: { $in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
        }).sort({ month: 1 });
        if (!attendances) {
          throw new Error('attendances not found for employee');
        }
        // const employeeDoc = await EmployeeData.findById(employee._id);
        const currentYear = new Date().getFullYear();

        const monthsInYear = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        const monthsInAYear = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const fetchedMonths = new Set(wages.map((wage) => wage.month));
        // @ts-ignore
        const missingMonths = [...monthsInYear].filter(
          (month) => !fetchedMonths.has(month)
        );
        // console.log('okay yeh nh 2');
        const employeeLeaves = monthsInAYear.map((month) => {
          const current_month_att = attendances[month - 1];
          if (current_month_att && current_month_att.month === month) {
            return {
              usedEL: current_month_att?.earnedLeaves || 0,
              usedCL: current_month_att?.casualLeaves || 0,
              usedFL: current_month_att?.festivalLeaves || 0,
            };
          } else {
            return {
              usedEL: 0,
              usedCL: 0,
              usedFL: 0,
            };
          }
        });

        // console.log(
        //   employeeLeaves,
        //   '-----------------------------------------EMPLOYEE LEAVES'
        // );

        // Calculate totalAttendance
        const missingWages = missingMonths.map((month) => ({
          employee: employee._id,
          designation: null, // or handle as needed
          month: month,
          year: year,
          attendance: 0,
          netAmountPaid: 0,
        }));

        // Concatenate missingWages with fetched wages
        const allWages = [...wages, ...missingWages];

        // Sort allWages by year and month
        allWages.sort((a, b) => {
          return a.month - b.month;
        });

        // Calculate bonus and totalAttendance
        const totalNetAmountPaid = allWages.reduce(
          (sum, wage) => sum + wage.netAmountPaid,
          0
        );
        const totalAttendance = allWages.reduce(
          (sum, wage) => sum + wage.attendance,
          0
        );
        // Calculate EL, CL, FL
        const EL = Math.round(totalAttendance / 20);
        const CL = Math.round(totalAttendance / 35);
        const FL = Math.round(totalAttendance / 60);
        const tot = EL + CL + FL;
        const Net =
          employee.designation_details[0].basic * tot +
          employee.designation_details[0].DA * tot;
        wagesData.push({
          employee: employee,
          wages: allWages,
          missingMonths: missingMonths,
          totalAttendance: totalAttendance,
          EL: EL,
          CL: CL,
          FL: FL,
          tot: tot,
          basicWages: employee.designation_details[0].basic * tot,
          totalDA: employee.designation_details[0].DA * tot,
          Net: Net,
          employeeLeaves,
        });
      }
    }

    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Wages for the Calendar Year',
      data: JSON.stringify(wagesData),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      err: JSON.stringify(err),
      message: 'Internal Server Error',
    };
  }
};

const fetchWagesForCalendarYearStatement = async (dataString) => {
  const startTime = Date.now();
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    const { year, workOrder } = data;
    const startDate = new Date(year, 0, 1); // January 1st of the given year
    const endDate = new Date(year, 11, 31); // December 31st of the given year

    // Fetch all employees whose appointment and resignation dates meet the criteria
    const employees = await EmployeeData.aggregate([
      {
        $addFields: {
          appointmentDateObj: {
            $cond: {
              if: { $eq: ['$appointmentDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$appointmentDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
          resignDateObj: {
            $cond: {
              if: { $eq: ['$resignDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$resignDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
        },
      },
      {
        $match: {
          appointmentDateObj: { $lte: endDate },
          $or: [
            { resignDateObj: { $gte: startDate } },
            { resignDateObj: null },
          ],
        },
      },
      {
        $lookup: {
          from: 'designations',
          localField: 'designation',
          foreignField: '_id',
          as: 'designation_details',
        },
      },
      {
        $lookup: {
          from: 'departmenthrs',
          localField: 'department',
          foreignField: '_id',
          as: 'department_details',
        },
      },
    ]);
    // const names = employees.map((emp) => emp._id);
    // console.log('yetirerererrere', names);
    if (employees.length === 0) {
      return {
        status: 404,
        message: 'No Employees Found',
        success: false,
      };
    }

    // Fetch wages for each employee
    const wagesData = [];
    for (const employee of employees) {
      const query = {
        employee: employee._id,
        $or: [
          {
            year: year,
            month: { $in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
          },
        ],
      };

      // Conditionally add workOrderHr only when workOrder is not "Default"
      if (workOrder !== 'Default') {
        //@ts-ignore
        query.workOrderHr = new mongoose.Types.ObjectId(workOrder);
      }

      // console.log('kkkkkkkkkkkkkk', query);
      // Perform the query
      const wages = await Wages.find(query)
        .populate('designation')
        .populate('employee');

      // console.log('okay yeh bh', wages);
      if (wages.length == 0) continue;
      const employeeDoc = await EmployeeData.findById(employee._id);
      const currentYear = new Date().getFullYear();

      // Fetch the employee's bonus data
      if (!employeeDoc.leave || employeeDoc.leave.length == 0) {
        const startYear = new Date(employeeDoc.appointmentDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const bonusLeaveData = [];

        for (let year = startYear; year <= currentYear; year++) {
          bonusLeaveData.push({ year, status: false });
        }
        employeeDoc.leave = bonusLeaveData;
      }

      const lastBonusYear =
        employeeDoc.leave[employeeDoc.leave.length - 1].year;

      if (lastBonusYear < currentYear) {
        for (let year = lastBonusYear + 1; year <= currentYear; year++) {
          employeeDoc.leave.push({ year, status: false });
        }
      }

      employeeDoc.leave = employeeDoc.leave.map((bonusEntry) => {
        if (bonusEntry.year === year) {
          bonusEntry.status = true;
        }
        return bonusEntry;
      });
      await employeeDoc.save();
      // Check for missing months
      const monthsInYear = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      const fetchedMonths = new Set(wages.map((wage) => wage.month));
      // @ts-ignore
      const missingMonths = [...monthsInYear].filter(
        (month) => !fetchedMonths.has(month)
      );
      // console.log('okay yeh nh 2');

      // Calculate totalAttendance
      const missingWages = missingMonths.map((month) => ({
        employee: employee._id,
        designation: null, // or handle as needed
        month: month,
        year: year,
        attendance: 0,
        netAmountPaid: 0,
      }));

      // Concatenate missingWages with fetched wages
      const allWages = [...wages, ...missingWages];

      // Sort allWages by year and month
      allWages.sort((a, b) => {
        return a.month - b.month;
      });

      // Calculate bonus and totalAttendance
      const totalNetAmountPaid = allWages.reduce(
        (sum, wage) => sum + wage.netAmountPaid,
        0
      );
      const totalAttendance = allWages.reduce(
        (sum, wage) => sum + wage.attendance,
        0
      );
      // Calculate EL, CL, FL
      const EL = Math.round(totalAttendance / 20);
      const CL = Math.round(totalAttendance / 35);
      const FL = Math.round(totalAttendance / 60);
      const tot = EL + CL + FL;
      // console.log(employee.designation_details[0].basic);
      const Net =
        employee.designation_details[0].basic * tot +
        employee.designation_details[0].DA * tot;
      const leave = employee.designation_details[0].PayRate * tot;
      wagesData.push({
        employee: employee,
        wages: allWages,
        missingMonths: missingMonths,
        totalAttendance: totalAttendance,
        EL: EL,
        CL: CL,
        FL: FL,
        tot: tot,
        basicWages: employee.designation_details[0].basic * tot,
        totalDA: employee.designation_details[0].DA * tot,
        Net: Net,
        leave: leave,
      });
    }
    // console.log('okay yeh nh 3');

    const endTime = Date.now();
    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Wages for the Calendar Year',
      data: JSON.stringify(wagesData),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      err: JSON.stringify(err),
      message: 'Internal Server Error',
    };
  }
};

const fetchWagesForCalendarYearStatement2 = async (dataString) => {
  const startTime = Date.now();
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;

  try {
    const data = JSON.parse(dataString);
    const { year, workOrder } = data;
    const workOrderId =
      workOrder !== 'Default' ? new mongoose.Types.ObjectId(workOrder) : null;

    // Base aggregation pipeline
    const pipeline = [
      {
        $addFields: {
          appointmentDateObj: {
            $cond: {
              if: { $eq: ['$appointmentDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$appointmentDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
          resignDateObj: {
            $cond: {
              if: { $eq: ['$resignDate', ''] },
              then: null,
              else: {
                $dateFromString: {
                  dateString: '$resignDate',
                  format: '%d-%m-%Y',
                },
              },
            },
          },
        },
      },
      {
        $match: {
          appointmentDateObj: { $lte: new Date(year, 11, 31) },
          $or: [
            { resignDateObj: { $gte: new Date(year, 0, 1) } },
            { resignDateObj: null },
          ],
        },
      },
      {
        $lookup: {
          from: 'designations',
          localField: 'designation',
          foreignField: '_id',
          as: 'designation_details',
        },
      },
      {
        $unwind: {
          path: '$designation_details',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'departmenthrs',
          localField: 'department',
          foreignField: '_id',
          as: 'department_details',
        },
      },
      {
        $unwind: {
          path: '$department_details',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'wages',
          let: { empId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$employee', '$$empId'] },
                    { $eq: ['$year', year] },
                    ...(workOrderId
                      ? [{ $eq: ['$workOrderHr', workOrderId] }]
                      : []),
                  ],
                },
              },
            },
          ],
          as: 'wages',
        },
      },
    ];

    const employees = await EmployeeData.aggregate(pipeline);
    if (employees.length === 0) {
      return { status: 404, message: 'No Employees Found', success: false };
    }

    // Prepare bulk update operations for leave arrays
    const currentYear = new Date().getFullYear();
    const bulkOps = [];
    const wagesData = [];

    for (const employee of employees) {
      // Process leave array updates
      const startYear = new Date(employee.appointmentDate).getFullYear();
      let leave = employee.leave || [];

      if (leave.length === 0) {
        for (let y = startYear; y <= currentYear; y++) {
          leave.push({ year: y, status: false });
        }
      } else {
        const lastYearInLeave = leave[leave.length - 1].year;
        if (lastYearInLeave < currentYear) {
          for (let y = lastYearInLeave + 1; y <= currentYear; y++) {
            leave.push({ year: y, status: false });
          }
        }
      }

      leave = leave.map((entry) => ({
        ...entry,
        status: entry.year === year ? true : entry.status,
      }));

      bulkOps.push({
        updateOne: {
          filter: { _id: employee._id },
          update: { $set: { leave } },
        },
      });

      // Process wages data
      const monthsInYear = new Set(Array.from({ length: 12 }, (_, i) => i + 1));
      const fetchedMonths = new Set(employee.wages.map((w) => w.month));
      const missingMonths = Array.from(monthsInYear).filter(
        (m) => !fetchedMonths.has(m)
      );

      const allWages = [
        ...employee.wages,
        ...missingMonths.map((month) => ({
          employee: employee._id,
          month,
          year,
          attendance: 0,
          netAmountPaid: 0,
        })),
      ].sort((a, b) => a.month - b.month);

      const totalAttendance = allWages.reduce(
        (sum, w) => sum + w.attendance,
        0
      );
      const totalNetPaid = allWages.reduce(
        (sum, w) => sum + w.netAmountPaid,
        0
      );
      const EL = Math.round(totalAttendance / 20);
      const CL = Math.round(totalAttendance / 35);
      const FL = Math.round(totalAttendance / 60);
      const tot = EL + CL + FL;
      const basic = employee.designation_details?.basic || 0;
      const DA = employee.designation_details?.DA || 0;

      wagesData.push({
        employee,
        wages: allWages,
        missingMonths,
        totalAttendance,
        EL,
        CL,
        FL,
        tot,
        basicWages: basic * tot,
        totalDA: DA * tot,
        Net: (basic + DA) * tot,
        leave: (employee.designation_details?.PayRate || 0) * tot,
      });
    }

    // Execute bulk update
    if (bulkOps.length > 0) {
      await EmployeeData.bulkWrite(bulkOps);
    }

    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Wages for the Calendar Year',
      data: JSON.stringify(wagesData),
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      err: JSON.stringify(err),
    };
  }
};

const fetchFinalSettlement = async (dataString) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    const { employee } = data;

    // Fetch employee data
    const empData = await EmployeeData.findOne({ _id: employee }).populate(
      'designation'
    );

    if (!empData) {
      return {
        status: 404,
        message: 'Employee Not Found',
        success: false,
      };
    }

    const payRate = (empData.designation as any)?.PayRate || 0;

    const appointmentDate = new Date(empData.appointmentDate);
    const currentDate = new Date();
    // Fetch all wages for the employee from the appointment date to the current month
    const wages = await Wages.find({
      employee: employee,
      year: {
        $gte: appointmentDate.getFullYear(),
        $lte: currentDate.getFullYear(),
      },
      $or: [
        { month: { $gte: appointmentDate.getMonth() + 1 } },
        { month: { $lte: currentDate.getMonth() + 1 } },
      ],
    })
      .populate('designation')
      .populate('employee');

    if (wages.length === 0) {
      return {
        status: 404,
        message: 'No Wages Found for the Employee',
        success: false,
      };
    }

    // Organize wages by month-year and calculate total attendance and total net amount paid per year
    const wagesByMonthYear = {};
    const totalAttendancePerYear: YearlyWageInfo[] = [];
    let totAtt = 0;
    for (const wage of wages) {
      const {
        year,
        month,
        attendance,
        netAmountPaid,
        total,
        incentiveAmount,
        allowances,
        otherCash,
      } = wage;
      const key = `${year}-${month}`;

      if (!wagesByMonthYear[key]) {
        wagesByMonthYear[key] = wage;
      }
      let attendanceYear = totalAttendancePerYear.find(
        (item) => item.year === year
      );
      const paidStatus =
        empData.leave.find((b) => b.year === year)?.status || false;

      if (!attendanceYear) {
        attendanceYear = {
          year,
          totalAttendance: 0,
          totalNetAmountPaid: 0,
          status: paidStatus,
          grossAmountYearly: 0,
          CL: 0,
          EL: 0,
          FL: 0,
          leave: 0,
        };
        totalAttendancePerYear.push(attendanceYear);
      }

      attendanceYear.totalAttendance += attendance;
      totAtt += attendance;
      attendanceYear.totalNetAmountPaid += netAmountPaid;
      attendanceYear.grossAmountYearly +=
        total - incentiveAmount - allowances - otherCash;
    }

    const startYear = appointmentDate.getFullYear();
    const endYear = currentDate.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      if (!totalAttendancePerYear.some((item) => item.year === year)) {
        totalAttendancePerYear.push({
          year: year,
          totalAttendance: 0,
          totalNetAmountPaid: 0,
          status: false, // assuming default paid status as false for years with no data
          grossAmountYearly: 0,
          EL: 0,
          CL: 0,
          FL: 0,
          leave: 0,
        });
      }
    }
    for (let i = 0; i < totalAttendancePerYear.length; i++) {
      totalAttendancePerYear[i].EL = Math.round(
        totalAttendancePerYear[i].totalAttendance / 20
      );
      totalAttendancePerYear[i].CL = Math.round(
        totalAttendancePerYear[i].totalAttendance / 35
      );
      totalAttendancePerYear[i].FL = Math.round(
        totalAttendancePerYear[i].totalAttendance / 60
      );

      totalAttendancePerYear[i].leave =
        (totalAttendancePerYear[i].EL +
          totalAttendancePerYear[i].CL +
          totalAttendancePerYear[i].FL) *
        payRate;
    }

    // Add missing months with zero values
    let totWages = 0;
    let totalGrossWages = 0;
    const allYears = totalAttendancePerYear.map((item) => item.year);
    const allWgaes = [];
    for (const year of allYears) {
      for (let month = 1; month <= 12; month++) {
        const key = `${year}-${month}`;
        if (!wagesByMonthYear[key]) {
          wagesByMonthYear[key] = {
            employee: employee,
            designation: null, // or handle as needed
            month: month,
            year,
            attendance: 0,
            netAmountPaid: 0,
            totalWorkingDays: 0,
            total: 0,
            payRate: 0,
            otherCash: 0,
            allowances: 0,
            otherCashDescription: '{}',
            otherDeduction: 0,
            otherDeductionDescription: '{}',
          };
        }
      }
    }

    // Convert the wagesByMonthYear object to a sorted array
    const sortedWages = Object.values(wagesByMonthYear).sort((a, b) => {
      // @ts-ignore
      if (a.year === b.year) {
        // @ts-ignore
        return a.month - b.month;
      } else {
        // @ts-ignore
        return a.year - b.year;
      }
    });
    const dataByMonth = {};
    sortedWages.forEach((wage: any) => {
      // @ts-ignore
      const {
        month,
        year,
        attendance,
        netAmountPaid,
        total,
        allowances,
        otherCash,
      } = wage;

      if (!dataByMonth[month]) {
        dataByMonth[month] = [];
      }

      totWages += netAmountPaid;
      const monthlyGrossWage =
        total - (wage?.incentiveAmount || 0) - allowances - otherCash;
      totalGrossWages += monthlyGrossWage;

      dataByMonth[month].push({
        year,
        attendance,
        netAmountPaid,
        monthlyGrossWage: monthlyGrossWage,
      });
    });

    const aggregateDataByMonth = (data) => {
      Object.keys(data).forEach((month) => {
        const yearData = data[month];

        // Reduce the array by grouping by year and summing attendance and netAmountPaid
        const aggregated = yearData.reduce(
          (acc, { year, attendance, netAmountPaid, monthlyGrossWage }) => {
            if (!acc[year]) {
              acc[year] = {
                year,
                attendance: 0,
                netAmountPaid: 0,
                monthlyGrossWage: 0,
              };
            }
            acc[year].attendance += attendance;
            acc[year].netAmountPaid += netAmountPaid;
            acc[year].monthlyGrossWage += monthlyGrossWage;
            return acc;
          },
          {}
        );

        // Convert the aggregated data back to an array
        data[month] = Object.values(aggregated);
      });

      return data;
    };

    const aggregatedData = aggregateDataByMonth(dataByMonth);
    // console.log("data!!!", aggregatedData);
    // Calculate gross wages and bonus details
    const bonusDetails = [];
    let currentYear = appointmentDate.getFullYear();

    while (currentYear <= currentDate.getFullYear()) {
      const startMonth = 4;
      const endMonth = 3;

      let grossWages = 0;
      const keys = Object.keys(wagesByMonthYear); //array
      for (let month = startMonth; month <= 12; month++) {
        const key = `${currentYear}-${month}`;
        if (wagesByMonthYear[key]) {
          const { total, allowances, otherCash, incentiveAmount } =
            wagesByMonthYear[key];
          // grossWages += wagesByMonthYear[key].netAmountPaid;
          grossWages += total - incentiveAmount - allowances - otherCash;
        }
      }
      let nex = currentYear + 1;
      for (let month = 1; month <= endMonth; month++) {
        const key = `${nex}-${month}`;
        if (wagesByMonthYear[key]) {
          // grossWages += wagesByMonthYear[key].netAmountPaid;
          const { total, allowances, otherCash, incentiveAmount } =
            wagesByMonthYear[key];
          grossWages += total - incentiveAmount - allowances - otherCash;
        }
      }
      const bonusStatus =
        empData.bonus.find((b) => b.year === currentYear)?.status || false;

      bonusDetails.push({
        year: currentYear,
        grossWages: grossWages,
        bonus: grossWages * 0.0833,
        status: bonusStatus,
      });

      currentYear++;
    }

    totalAttendancePerYear.sort((a, b) => a.year - b.year);
    const finalData = {
      wages: dataByMonth,
      totalAttendancePerYear: totalAttendancePerYear,
      designation: empData.designation,
      employee: empData,
      totalAttendance: totAtt,
      totalWages: totWages,
      bonusDetails: bonusDetails,
      totalGrossWages,
    };

    return {
      success: true,
      status: 200,
      message: 'Successfully Retrieved Final Settlement Wages for the Employee',
      data: JSON.stringify(finalData),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      err: JSON.stringify(err),
      message: 'Internal Server Error',
    };
  }
};

export {
  fetchFilledWages,
  fetchWageForAnEmployee,
  fetchWagesForFinancialYear,
  fetchWagesForCalendarYear,
  fetchFinalSettlement,
  fetchWagesForFinancialYearStatement,
  fetchWagesForCalendarYearStatement,
  fetchFilledWagesWithAttendanceDays,
  fetchWagesForCalendarYearStatement2,
  fetchWagesForFinancialYearStatement2,
};

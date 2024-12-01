'use server';

import EmployeeData from '@/lib/models/HR/EmployeeData.model';
import { EsiLocationSchema } from '@/lib/models/HR/EsiLocation.model';
import { DepartmentHrSchema } from '@/lib/models/HR/department_hr';
import { DesignationSchema } from '@/lib/models/HR/designation.model';
import convert_to_number from '@/utils/convert_to_number';
import calcSundays from '@/utils/sundays';
import mongoose from 'mongoose';
import attendanceAction from '../../attendance/attendanceAction';
import Wages from '@/lib/models/HR/wages.model';
import handleDBConnection from '@/lib/database';
const departmentHrModel =
  mongoose.models.DepartmentHr ||
  mongoose.model('DepartmentHr', DepartmentHrSchema);
const designationModel =
  mongoose.models.Designation ||
  mongoose.model('Designation', DesignationSchema);
const EsiLocationModel =
  mongoose.models.EsiLocation ||
  mongoose.model('EsiLocation', EsiLocationSchema);

const createWageForAnEmployee = async (dataString: string) => {
        const dbConnection = await handleDBConnection();
        if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    const {
      employee,
      month,
      year,
      otherCash,
      otherDeduction,
      incentiveApplicable,
      damageDeduction,
      advanceDeduction,
      isAdvanceDeduction,
      isDamageDeduction,
    } = data;
    const { sundays, totalDays, sundayDates } = calcSundays(month, year);
    const totalWorkingDays = totalDays - sundays;
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
    console.log('dddddd', empData.designation);
    const attendanceRecords = await attendanceAction.FETCH.fetchStatus(
      JSON.stringify(filter)
    );
    const attendanceOfEmp = await attendanceAction.FETCH.fetchAttendance(
      JSON.stringify(filter)
    );

    console.log(
      attendanceOfEmp,
      attendanceRecords,
      'I am attendance & record of employee'
    );

    const responseData = await JSON.parse(attendanceOfEmp.data);
    console.log('yerha wage mein work order', responseData.workOrderHr);
    //@ts-ignore
    const days = responseData.days;
    const workOrder1 = responseData.workOrderHr._id.toString();
    const workOrder = workOrder1.trim();
    console.log(workOrder, 'Mein work order hun');

    let consecutiveDays = 0;
    let workedWeeks = 0;
    let incentiveDays = 0; // New field for incentive days
    let incentiveAmount = 0; // New field for amount of incentive

    for (let i = 0; i < days.length; i++) {
      const { status, day } = days[i];

      console.log('fds date: ', day);
      console.log(days[i]);

      // Check for Sundays and if the employee was present
      if (sundayDates.includes(day) && status === 'Present') {
        incentiveDays++; // Increment incentive days if present on a Sunday
      }

      if (status === 'Present' || status === 'off') {
        if (status === 'Present') {
          consecutiveDays++;
        }
        // If we encounter 'off', we skip counting it, but we don't break the streak

        if (consecutiveDays === 6) {
          workedWeeks++;
          consecutiveDays = 0; // Reset the count after a full week
        }
      } else {
        // If we encounter 'Absent' or 'Leave', we reset the count
        consecutiveDays = 0;
      }
    }

    console.log('&&&&fdjkshfkjdsh', incentiveDays);
    console.log(JSON.stringify(sundayDates));

    const otherCashTotal = workedWeeks * 1.4;

    if (attendanceRecords.status !== 200) {
      return {
        success: false,
        status: 404,
        message: 'Attendance not found',
      };
    }

    const attendanceRecordsData = JSON.parse(attendanceRecords.data);
    const presentDays = attendanceRecordsData.Present;

    // console.log(empData)
    const designationaData = empData.designation;
    console.log('fffffff', designationaData);

    const esiLocationData = empData.ESILocation;
    const departmentData = empData.department;
    const basicWage = convert_to_number(designationaData.basic);
    const da = convert_to_number(designationaData.DA);
    const payRate = convert_to_number(designationaData.PayRate);
    const perDayPay = basicWage / totalWorkingDays;
    let totalPay: number = (basicWage + da) * presentDays;
    totalPay = totalPay + otherCashTotal;
    let allowances = 0;

    let otherDeductionTotal = 0;
    for (let value in otherCash) {
      totalPay = totalPay + convert_to_number(otherCash[value]);
      allowances = allowances + convert_to_number(otherCash[value]);
    }
    let netAmountPaid = totalPay;

    const pf = 0.12 * totalPay;
    const esi = 0.0075 * totalPay;
    if (empData.pfApplicable) {
      console.log('Subtracting PF');
      netAmountPaid = netAmountPaid - pf;
    }
    // if(empData.ESICApplicable){
    console.log('Subtracting ESI');
    netAmountPaid = netAmountPaid - esi;
    // }

    // For incentive payment - Adding 1000+ no of days * designation.basic pay
    // const incentiveAmount = 4*360; // for example

    console.log('previous amount', netAmountPaid);

    // add the incentive amount
    if (incentiveApplicable && incentiveDays > 0) {
      incentiveAmount = 1000 + designationaData.basic * incentiveDays;
      console.log('incentive added and the incentive days is greater then 0');
    } else {
      incentiveAmount = 0;
    }
    netAmountPaid = netAmountPaid + incentiveAmount;

    console.log(
      'Net amount here after incentive added: updated',
      netAmountPaid
    );

    // advance and damage deduction here

    if (isAdvanceDeduction) {
      netAmountPaid = netAmountPaid - advanceDeduction;
    }

    if (isDamageDeduction) {
      netAmountPaid = netAmountPaid - damageDeduction;
    }

    console.log(
      'Net amount here after advance and damage deduction: updated',
      netAmountPaid
    );

    for (let value in otherDeduction) {
      netAmountPaid = netAmountPaid - convert_to_number(otherDeduction[value]);
      otherDeductionTotal =
        otherDeductionTotal + convert_to_number(otherDeduction[value]);
    }
    console.log('PayRate', typeof payRate);
    const existingWage = await Wages.findOne({
      employee,
      month,
      year,
      workOrderHr: workOrder,
    });
    if (existingWage) {
      console.log(
        'wages exists and :',
        advanceDeduction,
        isAdvanceDeduction,
        damageDeduction,
        isDamageDeduction
      );
      // Update existing wage record
      existingWage.total = totalPay;
      existingWage.netAmountPaid = netAmountPaid; // Refactored for reuse
      existingWage.otherCash = otherCashTotal;
      existingWage.allowances = allowances;

      existingWage.otherCashDescription = JSON.stringify(otherCash);
      existingWage.otherDeduction = otherDeductionTotal;
      existingWage.otherDeductionDescription = JSON.stringify(otherDeduction);
      existingWage.workOrderHr = responseData.workOrderHr._id;
      existingWage.incentiveApplicable = incentiveApplicable;
      existingWage.incentiveDays = incentiveDays; // Update incentive days
      existingWage.incentiveAmount = incentiveAmount; // Update incentive days
      existingWage.damageDeduction = damageDeduction;
      existingWage.advanceDeduction = advanceDeduction;
      existingWage.isAdvanceDeduction = isAdvanceDeduction;
      existingWage.isDamageDeduction = isDamageDeduction;
      existingWage.attendance = presentDays; // Update Attendance workOrderwise
      console.log('fdsfds', incentiveDays);
      const updatedWage = await existingWage.save();
      console.log('obj is Updated and saved', updatedWage);

      const refreshedWage = await Wages.findOne({
        employee,
        month,
        year,
        workOrderHr: workOrder,
      });
      console.log('Refreshed Wage Data:', refreshedWage);

      return {
        status: 200,
        message: 'Wage Updated Successfully',
        success: true,
        data: JSON.stringify(updatedWage),
      };
    } else {
      const obj = new Wages({
        employee: employee,
        designation: designationaData._id,
        month: month,
        year: year,
        totalWorkingDays: totalWorkingDays,
        attendance: presentDays,
        total: totalPay,
        netAmountPaid: netAmountPaid,
        otherCash: otherCashTotal,
        allowances: allowances,
        otherCashDescription: JSON.stringify(otherCash),
        otherDeduction: otherDeductionTotal,
        otherDeductionDescription: JSON.stringify(otherDeduction),
        payRate: payRate,
        incentiveApplicable: incentiveApplicable,
        incentiveDays: incentiveDays, // Add incentive days
        incentiveAmount: incentiveAmount, // Add incentive amount
        damageDeduction: damageDeduction,
        advanceDeduction: advanceDeduction,
        isAdvanceDeduction: isAdvanceDeduction,
        isDamageDeduction: isDamageDeduction,
        workOrderHr: responseData.workOrderHr._id,
      });
      console.log('obj is saved', obj);
      const resp = await obj.save();
      return {
        status: 200,
        message: 'Success',
        success: true,
        data: JSON.stringify(resp),
      };
    }
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

export { createWageForAnEmployee };

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
      wo,
      basic,
      DA,
      employee,
      month,
      year,
      otherCash: otherCashDescription,
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
    console.log('FOUND EMPLOYEE', empData);
    const filter = {
      employee: employee,
      month: month,
      year: year,
      workOrderHr: wo,
    };
    // console.log('dddddd', empData.designation);
    const attendanceRecords = await attendanceAction.FETCH.fetchStatus(
      JSON.stringify(filter)
    );
    const attendanceOfEmp = await attendanceAction.FETCH.fetchAttendance(
      JSON.stringify(filter)
    );

    // console.log(
    //   attendanceOfEmp,
    //   attendanceRecords,
    //   'I am attendance & record of employee'
    // );

    const responseData = await JSON.parse(attendanceOfEmp.data);
    // console.log('yerha wage mein work order', responseData.workOrderHr);
    //@ts-ignore
    const days = responseData.days;
    const workOrder1 = responseData.workOrderHr._id.toString();
    const workOrder = workOrder1.trim();
    // console.log(workOrder, 'Mein work order hun');

    let consecutiveDays = 0;
    let workedWeeks = 0;
    let incentiveDays = 0; // New field for incentive days
    let incentiveAmount = 0; // New field for amount of incentive

    for (let i = 0; i < days.length; i++) {
      const { status, day } = days[i];

      // console.log('fds date: ', day);
      // console.log(days[i]);

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

    // console.log('&&&&fdjkshfkjdsh', incentiveDays);
    // console.log(JSON.stringify(sundayDates));

    // OtherCash should not contain only eoc calculation
    const otherCashTotal = empData?.attendanceAllowance ? workedWeeks * 1.4 : 0;
    otherCashDescription.eoc = empData?.attendanceAllowance
      ? workedWeeks * 1.4
      : 0;

    if (attendanceRecords.status !== 200) {
      return {
        success: false,
        status: 404,
        message: 'Attendance not found',
      };
    }

    const attendanceRecordsData = JSON.parse(attendanceRecords.data);
    // console.log(
    //   '_________________________________________________________________________'
    // );
    // console.log(
    //   '------------------------------',
    //   attendanceRecordsData,
    //   '---------------------------------------'
    // );
    const presentDays = attendanceRecordsData.Present;

    // console.log(empData)
    const designationaData = empData.designation;
    // console.log('fffffff', designationaData);

    const esiLocationData = empData.ESILocation;
    const departmentData = empData.department;
    //changed the basic, da and payrate to be calculated from the designation data if not provided otherwise from the data coming from the frontend
    const basicWage = basic || convert_to_number(designationaData.basic);
    const da = DA || convert_to_number(designationaData.DA);
    const payRate =
      basicWage + da || convert_to_number(designationaData.PayRate);
    const perDayPay = basicWage / totalWorkingDays;
    // console.log(
    //   'PAYRATE:____________________________________________________________',
    //   payRate
    // );
    // console.log(
    //   basicWage,
    //   da,
    //   'I am basic and da-----------------------------------------------------------'
    // );
    // totalPay = (basic + da) * presentDays
    let totalPay: number = (basicWage + da) * presentDays;
    // totalPay = totalPay + otherCashTotal; // otherCashTotal is eoc(+)
    totalPay = totalPay + otherCashTotal;
    let allowances = 0;
    // gross_2 is only (basic + da) * presentDays + otherCashTotal(eoc)
    // ---------------------> I have to remove eoc from gross_2

    //RULE CHANGE: GROSS_2 calculation won't include EOC, so gross_2 = totalPay - otherCashTotal(EOC)
    let gross_2 = totalPay - otherCashTotal;

    let otherDeductionTotal = 0;
    //totalPay = totalPay + allowances;
    // allowances = allowances + otherCashTotal - eoc field in otherCashDescription;
    for (let value in otherCashDescription) {
      // in case of eoc , it won't be added to the total pay and allowances
      if (value === 'eoc') continue;
      totalPay = totalPay + convert_to_number(otherCashDescription[value]);
      allowances = allowances + convert_to_number(otherCashDescription[value]);
    }

    if (incentiveApplicable && incentiveDays > 0) {
      // replaced the designationaData.basic with basicWage (same thing)
      // incentiveAmount = 1000 + designationaData.basic * incentiveDays;
      incentiveAmount = 1000 + basicWage * incentiveDays;
      // adding incentive amount in the total pay (gross pay)
      // totalPay = totalPay + incentiveAmount;
      totalPay += incentiveAmount;
      // console.log('incentive added and the incentive days is greater then 0');
    } else {
      incentiveAmount = 0;
    }

    let netAmountPaid = totalPay;

    // pf should not be calculated based on the total pay, only esic should be calculated on the total pay
    //pf is being calculated on the gross_2 and not on the total pay, and gross_2 is (basic + da) * presentDays + otherCashTotal(eoc)
    const pf = 0.12 * gross_2;
    const esi = 0.0075 * totalPay;
    if (empData.pfApplicable) {
      // console.log('Subtracting PF');
      netAmountPaid = netAmountPaid - pf;
    }
    // esic will only be calculated when totalPay(gross) is less than 21K, otherwise it will be zero
    if (empData.ESICApplicable && totalPay < 21000) {
      // console.log('Subtracting ESI');
      netAmountPaid = netAmountPaid - esi;
    }

    // For incentive payment - Adding 1000+ no of days * designation.basic pay
    // const incentiveAmount = 4*360; // for example

    // console.log('previous amount', netAmountPaid);

    // add the incentive amount

    //removed the incentive amount from the net amount paid since it is already being added to total
    // netAmountPaid = netAmountPaid + incentiveAmount;

    // console.log(
    //   'Net amount here after incentive added: updated',
    //   netAmountPaid
    // );
    // console.log(
    //   'Net amount here after not adding the incentive: updated',
    //   netAmountPaid
    // );

    // advance and damage deduction here

    if (isAdvanceDeduction) {
      netAmountPaid = netAmountPaid - advanceDeduction;
    }

    if (isDamageDeduction) {
      netAmountPaid = netAmountPaid - damageDeduction;
    }

    // console.log(
    //   'Net amount here after advance and damage deduction: updated',
    //   netAmountPaid
    // );

    for (let value in otherDeduction) {
      netAmountPaid = netAmountPaid - convert_to_number(otherDeduction[value]);
      otherDeductionTotal =
        otherDeductionTotal + convert_to_number(otherDeduction[value]);
    }
    // console.log('PayRate', typeof payRate);
    const existingWage = await Wages.findOne({
      employee,
      month,
      year,
      workOrderHr: workOrder,
    });
    if (existingWage) {
      // console.log(
      //   'wages exists and :',
      //   advanceDeduction,
      //   isAdvanceDeduction,
      //   damageDeduction,
      //   isDamageDeduction
      // );
      // Update existing wage record
      existingWage.payRate = parseFloat(payRate).toFixed(2);
      existingWage.basic = parseFloat(basicWage).toFixed(2);
      existingWage.DA = parseFloat(da).toFixed(2);
      existingWage.total = totalPay.toFixed(2);
      existingWage.netAmountPaid = netAmountPaid.toFixed(2); // Refactored for reuse
      existingWage.otherCash = otherCashTotal.toFixed(2);
      existingWage.allowances = allowances.toFixed(2);

      existingWage.otherCashDescription = JSON.stringify(otherCashDescription);
      existingWage.otherDeduction = otherDeductionTotal.toFixed(2);
      existingWage.otherDeductionDescription = JSON.stringify(otherDeduction);
      existingWage.workOrderHr = responseData.workOrderHr._id;
      existingWage.incentiveApplicable = incentiveApplicable;
      existingWage.incentiveDays = incentiveDays; // Update incentive days
      existingWage.incentiveAmount = incentiveAmount.toFixed(2); // Update incentive days
      existingWage.damageDeduction = parseFloat(damageDeduction).toFixed(2);
      existingWage.advanceDeduction = parseFloat(advanceDeduction).toFixed(2);
      existingWage.isAdvanceDeduction = isAdvanceDeduction;
      existingWage.isDamageDeduction = isDamageDeduction;
      existingWage.attendance = presentDays; // Update Attendance workOrderwise
      // console.log('fdsfds', incentiveDays);
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
        basic: parseFloat(basicWage).toFixed(2),
        DA: parseFloat(da).toFixed(2),
        employee: employee,
        designation: designationaData._id,
        month: month,
        year: year,
        totalWorkingDays: totalWorkingDays,
        attendance: presentDays,
        total: totalPay.toFixed(2),
        netAmountPaid: netAmountPaid.toFixed(2),
        otherCash: otherCashTotal.toFixed(2),
        allowances: allowances.toFixed(2),
        otherCashDescription: JSON.stringify(otherCashDescription),
        otherDeduction: otherDeductionTotal.toFixed(2),
        otherDeductionDescription: JSON.stringify(otherDeduction),
        payRate: parseFloat(payRate).toFixed(2),
        incentiveApplicable: incentiveApplicable,
        incentiveDays: incentiveDays.toFixed(2), // Add incentive days
        incentiveAmount: incentiveAmount.toFixed(2), // Add incentive amount
        damageDeduction: parseFloat(damageDeduction).toFixed(2),
        advanceDeduction: parseFloat(advanceDeduction).toFixed(2),
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

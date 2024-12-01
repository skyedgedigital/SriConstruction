import mongoose from "mongoose";


export interface IEmployeeData {

    // employeeDetails:{
        code:string;
        workManNo:string;
        name:string;
        department:mongoose.Schema.Types.ObjectId;
        site:mongoose.Schema.Types.ObjectId;
        designation:mongoose.Schema.Types.ObjectId;
        bank:mongoose.Schema.Types.ObjectId;
        accountNumber:string;
        pfApplicable:boolean;
        pfNo:string;
        UAN:string;
        ESICApplicable:boolean;
        ESICNo:string;
        ESILocation:mongoose.Schema.Types.ObjectId;
        adhaarNumber:string;
    // },
    // personalInformation:{
        sex:"Male"|"Female"|"TransGender";
        martialStatus:"married"|"unmarried"|"choose to not disclose";
        dob:string;
        attendanceAllowance:boolean;
        fathersName:string;
        address:string;
        landlineNumber:string;
        mobileNumber:string;
        workingStatus:boolean;
        appointmentDate:string;
        resignDate:string;
    // },
    // otherDetails:{
        safetyPassNumber:string;
        SpValidity:string;
        policeVerificationValidityDate:string;
        gatePassNumber:string;
        gatePassValidTill:string;
    // }
}
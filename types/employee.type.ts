export type employee = {
    _id?: string,
    name?: string;
    phoneNo?: number;
    drivingLicenseNo?: string;
    gatePassNo?: string;
    safetyPassNo?: string;
    UAN?: number;
    aadharNo?: Number;
    bankDetails?: {
        accountNo: number;
        IFSC: string;
    };
    employeeRole?: string;
};

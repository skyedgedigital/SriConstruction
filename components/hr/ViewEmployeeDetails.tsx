import React, { useEffect, useState } from 'react';
import { IEmployeeData } from '@/interfaces/HR/EmployeeData.interface';
import departmentAction from '@/lib/actions/department/departmentAction';
import toast from 'react-hot-toast';
import { set } from 'mongoose';
import siteMasterAction from '@/lib/actions/HR/siteMaster/siteMasterAction';
import BankAction from '@/lib/actions/HR/Bank/bankAction';
import EsiLocationAction from '@/lib/actions/HR/EsiLocation/EsiLocationAction';
import Image from 'next/image';

const ViewEmployeeDetails = ({ employeeData }: { employeeData: any }) => {
  // console.log('employee data response', employeeData);
  // any can be replaced by IEmployeeData but it is giving warning
  const [employee, setEmployee] = useState<any>(employeeData);
  console.log('employee  response', employee);

  useEffect(() => {
    const fnDept = async () => {
      const resp = await departmentAction.FETCH.fetchAllDepartments();
      if (resp.success) {
        // console.log('dept response', resp.data);
        const dept = JSON.parse(resp.data).find(
          (data) => data._id === JSON.stringify(employeeData?.department)
        );
        // console.log('mil gya department', dept);
        setEmployee({ ...employeeData, department: dept?.departmentName });
      } else {
        toast.error(resp.message);
      }
    };
    fnDept();
  }, [employeeData]);

  useEffect(() => {
    const fnSite = async () => {
      const resp = await siteMasterAction.FETCH.fetchSiteMaster();
      //   console.log('aaya site response', resp);
      const parsedSites = JSON.parse(resp.data);
      if (resp.success) {
        // console.log('parsed site response', parsedSites);
        const foundSite = parsedSites.find(
          (data) => data._id === employeeData?.site
        );
        // console.log('mil gya site', site);
        setEmployee((prev) => ({ ...prev, site: foundSite?.name }));
      } else {
        toast.error('can not fetch Site');
      }
    };

    fnSite();
  }, [employeeData]);

  useEffect(() => {
    const fnBank = async () => {
      const resp = await BankAction.FETCH.fetchBanks();
      //   console.log('aaya bank response', resp);
      const parsedBanks = JSON.parse(resp.data);

      if (resp) {
        // console.log('parsed bank response', parsedBanks);
        const foundBank = parsedBanks.find(
          (data) => data._id === employeeData?.bank
        );
        // console.log('mil gya bank', foundBank);
        setEmployee((prev) => ({ ...prev, bank: foundBank?.name }));
      } else {
        toast.error('can not fetch Bank');
      }
    };

    fnBank();
  }, [employeeData]);
  useEffect(() => {
    const esiLocationFn = async () => {
      const resp = await EsiLocationAction.FETCH.fetchEsiLocation();
      //   console.log('aaya esi location response', resp);
      const parsedESILocation = JSON.parse(resp.data);

      if (resp) {
        console.log('parsed bank response', parsedESILocation);
        const foundESILocation = parsedESILocation.find(
          (data) => data._id === employeeData?.ESILocation
        );
        // console.log('mil gya esi location', foundESILocation);
        setEmployee((prev) => ({
          ...prev,
          ESILocation: foundESILocation?.name,
        }));
      } else {
        toast.error('can not fetch ESI Location');
      }
    };

    esiLocationFn();
  }, [employeeData]);

  return (
    <div className='flex flex-col gap-2'>
      <h1 className='text-lg text-black'>Employee Details</h1>
      <div className='flex justify-center md:justify-start items-center'>
        <Image
          src={employee?.profilePhotoURL}
          width={100}
          height={100}
          alt='profile photo'
        />
      </div>
      <div className='border-t-2 border-gray-300 pt-2 grid grid-cols-2 gap-16'>
        <div className='left flex flex-col gap-2 items-start'>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Employee Code:</label>
            <span>{employee?.code}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Employee name:</label>
            <span>{employee?.name}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Workman No:</label>
            <span>{employee?.workManNo}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Department:</label>
            <span>{employee?.department}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Site:</label>
            <span>{employee?.site}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Designation:</label>
            <span>{employee?.designation.designation}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Bank:</label>
            <span>{employee?.bank}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Account No:</label>
            <span>{employee?.accountNumber}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Pf Applicable:</label>
            <span>{JSON.stringify(employee?.pfApplicable)}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Pf No:</label>
            <span>{employee?.pfNo}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>UAN:</label>
            <span>{employee?.UAN}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>ESIC Applicable:</label>
            <span>{JSON.stringify(employee?.ESICApplicable)}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>ESI Location:</label>
            <span>{employee?.ESILocation}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Adhaar Number:</label>
            <span>{employee?.adhaarNumber}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>Sex:</label>
            <span>{employee?.sex}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>martial Status:</label>
            <span>{employee?.martialStatus}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>dob</label>
            <span>{employee?.dob}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>attendance Allowance:</label>
            <span>{employee?.attendanceAllowance}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>fathersName:</label>
            <span>{employee?.fathersName}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>address:</label>
            <span>{employee?.address}</span>
          </div>
        </div>
        <div className='right flex flex-col gap-2 items-start'>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>landlineNumber:</label>
            <span>{employee?.landlineNumber}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>mobileNumber:</label>
            <span>{employee?.mobileNumber}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>workingStatus:</label>
            <span>{employee?.workingStatus}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>appointmentDate:</label>
            <span>{employee?.appointmentDate}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>resignDate:</label>
            <span>{employee?.resignDate}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>safetyPassNumber:</label>
            <span>{employee?.safetyPassNumber}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>SpValidity:</label>
            <span>{employee?.SpValidity}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>policeVerificationValidityDate:</label>
            <span>{employee?.policeVerificationValidityDate}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>gatePassNumber:</label>
            <span>{employee?.gatePassNumber}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>gatePassValidTill:</label>
            <span>{employee?.gatePassValidTill}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>basic:</label>
            <span>{employee?.basic}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>DA:</label>
            <span>{employee?.DA}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>HRA:</label>
            <span>{employee?.HRA}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>CA:</label>
            <span>{employee?.CA}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>food:</label>
            <span>{employee?.food}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>incentives:</label>
            <span>{employee?.incentives}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>uniform:</label>
            <span>{employee?.uniform}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>medical:</label>
            <span>{employee?.medical}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>loan:</label>
            <span>{employee?.loan}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>LIC:</label>
            <span>{employee?.LIC}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>oldBasic:</label>
            <span>{employee?.oldBasic}</span>
          </div>
          <div className='flex justify-between w-full items-center gap-4'>
            <label>oldDA:</label>
            <span>{employee?.oldDA}</span>
          </div>
        </div>
        <div className='flex md:flex-row flex-col justify-between gap-2 items-center'>
          <div className='flex flex-col gap-1'>
            <label>Driving License:</label>
            <Image
              src={employee?.drivingLicense}
              width={200}
              height={100}
              alt='profile photo'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <label>Aadhar Card:</label>
            <Image
              src={employee?.aadharCard}
              width={200}
              height={100}
              alt='profile photo'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <label>Bank Passbook:</label>
            <Image
              src={employee?.bankPassbook}
              width={200}
              height={100}
              alt='profile photo'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeDetails;

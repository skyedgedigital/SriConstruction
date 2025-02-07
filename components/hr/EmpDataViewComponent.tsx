import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import Image from 'next/image';
import React, { useEffect } from 'react';
import EmployeeDataPhotos from './employeeDataPhotos';

const EmpDataViewComponent = (props) => {
  const { docId } = props;
  const [data, setData] = React.useState<any>({});
  useEffect(() => {
    const fn = async (docId) => {
      console.log(docId);
      const resp = await EmployeeDataAction.FETCH.fetchEmployeeById(docId);
      if (resp.success) {
        const details = await JSON.parse(resp.data);
        setData((prev) => ({
          ...details,
          dob: formatDate(details.dob),
          appointmentDate: formatDate(details.appointmentDate),
          resignDate: formatDate(details.resignDate),
          policeVerificationValidityDate: formatDate(
            details.policeVerificationValidityDate
          ),
          gatePassValidTill: formatDate(details.gatePassValidTill),
          SpValidity: formatDate(details.SpValidity),
        }));
        console.warn(resp.data);
      }
    };
    fn(props.docId);
  }, [props.docId]);
  const redirect = () => {
    window.open(
      `/hr/empCard?name=${data?.name}&designation=${data?.designation?.designation}&slNo=${data?.workManNo}`
    );
  };

  // Function to format date from 'yyyy-mm-dd' to 'dd-mm-yyyy'
  const formatDate = (dateString) => {
    if (!dateString) return dateString; // Return if dateString is empty
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`; // Return in 'dd-mm-yyyy' format
  };
  return (
    <>
      <div>
        <div className='border border-gray-200 rounded-lg p-4'>
          <h3 className='font-bold text-lg'>Employee Information</h3>
          <div className=' flex flex-col justify-between items-start md:flex-row'>
            <ul className='list-disc pl-4'>
              <li>Code: {data.code ? data.code : 'N/A'}</li>
              <li>Workman No: {data.workManNo ? data.workManNo : 'N/A'}</li>
              <li>Name: {data.name ? data.name : 'N/A'}</li>
              <li>
                Department: {data.department ? data.department.name : 'N/A'}
              </li>
              <li>Site: {data.site ? data.site.name : 'N/A'}</li>
              <li>
                Designation:{' '}
                {data.designation ? data.designation.designation : 'N/A'}
              </li>
              <li>
                PF Applicable: {data.pfApplicable ? data.pfApplicable : 'N/A'}
              </li>
              <li>PF No: {data.pfNo ? data.pfNo : 'N/A'}</li>
              <li>UAN: {data.UAN ? data.UAN : 'N/A'}</li>
              <li>ESIC No: {data.ESICNo ? data.ESICNo : 'N/A'}</li>
              <li>
                Aadhaar Number: {data.adhaarNumber ? data.adhaarNumber : 'N/A'}
              </li>
            </ul>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex flex-col gap-1'>
                <p>profile</p>
                {data.profilePhotoURL ? (
                  <Image
                    className='rounded'
                    width={250}
                    height={250}
                    alt='profile'
                    src={data?.profilePhotoURL}
                  />
                ) : (
                  <p className='text-red-500'>No photo uploaded</p>
                )}
              </div>
              <div className='flex flex-col gap-1'>
                <p>Aadhar Card</p>
                {data.aadharCardURL ? (
                  <Image
                    className='rounded'
                    width={250}
                    height={250}
                    alt='aadhar card'
                    src={data?.aadharCardURL}
                  />
                ) : (
                  <p className='text-red-500'>No photo uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='border border-gray-200 rounded-lg p-4'>
          <h3 className='font-bold text-lg'>Personal Information</h3>
          <div className=' flex flex-col justify-between items-start md:flex-row'>
            <ul className='list-disc pl-4'>
              <li>Sex: {data.sex ? data.sex : 'N/A'}</li>
              <li>
                Marital Status:{' '}
                {data.martialStatus ? data.martialStatus : 'N/A'}
              </li>
              <li>Date of Birth: {data.dob ? data.dob : 'N/A'}</li>
              <li>
                Attendance Allowance:{' '}
                {data.attendanceAllowance ? data.attendanceAllowance : 'N/A'}
              </li>
              {/* <li>Father's Name: {data.fathersName}</li> */}
              <li>Address: {data.address ? data.address : 'N/A'}</li>
              <li>
                Landline Number:{' '}
                {data.landlineNumber ? data.landlineNumber : 'N/A'}
              </li>
              <li>
                Mobile Number: {data.mobileNumber ? data.mobileNumber : 'N/A'}
              </li>
              <li>
                Working Status:{' '}
                {data.workingStatus ? data.workingStatus : 'N/A'}
              </li>
              <li>
                Appointment Date:{' '}
                {data.appointmentDate ? data.appointmentDate : 'N/A'}
              </li>
              <li>Resign Date: {data.resignDate ? data.resignDate : 'N/A'}</li>
            </ul>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex flex-col gap-1'>
                <p>Driving license</p>
                {data.drivingLicenseURL ? (
                  <Image
                    className='rounded'
                    width={250}
                    height={250}
                    alt='driving license'
                    src={data?.drivingLicenseURL}
                  />
                ) : (
                  <p className='text-red-500'>No photo uploaded</p>
                )}
              </div>
              <div className='flex flex-col gap-1'>
                <p>Bank</p>
                {data.bankPassbookURL ? (
                  <Image
                    className='rounded'
                    width={250}
                    height={200}
                    alt='bank passbook'
                    src={data?.bankPassbookURL}
                  />
                ) : (
                  <p className='text-red-500'>No photo uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Other Details Section */}
        <div className='border border-gray-200 rounded-lg p-4'>
          <h3 className='font-bold text-lg'>Other Details</h3>
          <ul className='list-disc pl-4'>
            <li>Safety Pass Number: {data.safetyPassNumber}</li>
            <li>Safety Pass Validity: {data.SpValidity}</li>
            <li>
              Police Verification Validity:{' '}
              {data.policeVerificationValidityDate}
            </li>
            <li>Gate Pass Number: {data.gatePassNumber}</li>
            <li>Gate Pass Validity: {data.gatePassValidTill}</li>
          </ul>
        </div>

        <div className='border border-gray-200 rounded-lg p-4'>
          <h3 className='font-bold text-lg'>Add/Ded</h3>
          <ul className='list-disc pl-4'>
            <li>Basic {data.basic}</li>
            <li>DA {data.DA}</li>
            <li>HRA {data.HRA}</li>
            <li>CA{data.CA}</li>
            <li>Food{data.food}</li>
            <li>Incentives{data.incentives}</li>
            <li>Uniform{data.uniform}</li>
            <li>Medical{data.medical}</li>
            <li>Loan{data.loan}</li>
            <li>LIC{data.LIC}</li>
            <li>Old Basic{data.oldBasic}</li>
            <li>Old DA{data.oldDA}</li>
          </ul>
        </div>

        <button
          className='p-2 mt-2  text-white bg-blue-500 w-40 rounded-sm hover:text-blue-500 hover:bg-slate-200'
          onClick={() => {
            redirect();
          }}
        >
          Employement Card
        </button>
      </div>
      {data.code && (
        <EmployeeDataPhotos
          employeeCode={data?.code}
          heading='Update Employee Photos'
        />
      )}
    </>
  );
};

export default EmpDataViewComponent;

import React from 'react';

const EmpDetails = (props) => {
  console.error('The Details ', props?.details);
  const empDetails = props?.details;
  const name = empDetails?.user?.employee?.name;
  const empRole = empDetails?.user?.employee?.employeeRole;
  const aadharNumber = empDetails?.user?.employee?.aadharNo;
  const drivingLNumber = empDetails?.user?.employee?.drivingLicenseNo;
  const safetyPassNumber = empDetails?.user?.employee?.safetyPassNo;
  const UAN = empDetails?.user?.employee?.UAN;
  const bankDetails = empDetails?.user?.employee?.bankDetails;
  const phoneNumber = empDetails?.user?.employee?.phoneNo;
  const createdAt = empDetails?.user?.employee?.createdAt;
  function formatReadableDate(isoDateString: string) {
    const date = new Date(isoDateString);

    // Options for formatting the date
    const options: any = {
      weekday: 'long', // e.g., "Wednesday"
      year: 'numeric', // e.g., "2024"
      month: 'long', // e.g., "July"
      day: 'numeric', // e.g., "10"
      hour: 'numeric', // e.g., "7 PM"
      minute: 'numeric', // e.g., "45"
      second: 'numeric', // e.g., "02"
    };

    // Format the date using the locale-specific format
    return date.toLocaleDateString('en-US', options);
  }
  return (
    <>
      <div className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-8 p-3'>
          <div className='text-xl font-light'>
            Employee Name:
            <span className='font-semibold ml-2'>{name}</span>
          </div>
          <div className='text-xl font-light'>
            Employee Role:
            <span className='font-semibold ml-2'>{empRole}</span>
          </div>
          <div className='text-xl font-light'>
            Aadhar Number:
            <span className='font-semibold ml-2'>{aadharNumber}</span>
          </div>
          <div className='text-xl font-light'>
            Driving License:
            <span className='font-semibold ml-2'>{drivingLNumber}</span>
          </div>
          <div className='text-xl font-light'>
            Safety Pass Number:
            <span className='font-semibold ml-2'>{safetyPassNumber}</span>
          </div>
          <div className='text-xl font-light'>
            UAN:
            <span className='font-semibold ml-2'>{UAN}</span>
          </div>
          <div className='text-xl font-light'>
            Created At:
            <span className='font-semibold ml-2'>
              {formatReadableDate(createdAt)}
            </span>
          </div>
          <div className='text-xl font-light'>
            Phone:
            <span className='font-semibold ml-2'>{phoneNumber}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmpDetails;

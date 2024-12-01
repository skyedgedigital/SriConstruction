'use client';
import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa6';

const EmployeeDataPhotos = ({
  heading = 'Select Photos to Upload',
  employeeCode = '',
}: {
  heading: string;
  employeeCode: string;
}) => {
  const [files, setFiles] = useState({
    driverLicense: null,
    aadharCard: null,
    bankPassbook: null,
    profilePhoto: null,
  });
  const [code, setCode] = useState<string>(employeeCode);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    setFiles({ ...files, [type]: e.target.files[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '') {
      toast.error('Please fill Employee Code');
      return;
    }
    const photosFormData = new FormData();

    photosFormData.append('code', code);
    // Append files to FormData
    for (const [key, value] of Object.entries(files)) {
      if (value) {
        photosFormData.append(key, value);
      }
    }

    try {
      setUploading(true);
      const res = await EmployeeDataAction.CREATE.uploadEmployeeDataPhotos(
        photosFormData
      );
      if (res.status == 200) {
        toast.success(res.message);
        // Clear fields after successful upload
        setFiles({
          driverLicense: null,
          aadharCard: null,
          bankPassbook: null,
          profilePhoto: null,
        });
        setCode(''); // Clear the employee code
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error('Something went wrong');
    } finally {
      setUploading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
    >
      <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
        {heading}
      </h2>

      {!employeeCode && (
        <div className='px-4 flex flex-col gap-1 w-full md:w-[20%]'>
          <label>Employee Code:</label>
          <input
            placeholder='employee code'
            className='border-[1px] border-gray-400 p-1'
            type='text'
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
      )}
      <div className='px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6'>
        <div className=' flex-col flex gap-1 flex-1'>
          <label>Driving License Photo:</label>
          <input
            type='file'
            onChange={(e) => handleFileChange(e, 'driverLicense')}
          />
        </div>
        <div className=' flex-col flex gap-1 flex-1'>
          <label>Aadhar Card Photo:</label>
          <input
            type='file'
            onChange={(e) => handleFileChange(e, 'aadharCard')}
          />
        </div>
        <div className=' flex-col flex gap-1 flex-1'>
          <label>Bank Passbook Photo:</label>
          <input
            type='file'
            onChange={(e) => handleFileChange(e, 'bankPassbook')}
          />
        </div>
        <div className=' flex-col flex gap-1 flex-1'>
          <label>Profile Photo:</label>
          <input
            type='file'
            onChange={(e) => handleFileChange(e, 'profilePhoto')}
          />
        </div>
      </div>
      <div className='flex w-full justify-center items-center my-4'>
        <button
          className=' bg-green-500 w-40 text-white rounded py-1 flex justify-center items-center '
          type='submit'
        >
          {uploading ? <FaSpinner /> : 'Upload Photos'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeDataPhotos;

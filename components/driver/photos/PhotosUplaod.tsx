'use client';
import employeeAction from '@/lib/actions/employee/employeeAction';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa6';

const PhotosUpload = ({ phoneNo = -1 }: { phoneNo: Number }) => {
  const [files, setFiles] = useState({
    driverLicense: null,
    aadharCard: null,
    profilePhoto: null,
  });
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    setFiles({ ...files, [type]: e.target.files[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNo === -1) {
      toast.error('Missing Phone Number');
      return;
    }
    const photosFormData = new FormData();

    photosFormData.append('phoneNo', phoneNo.toString());
    // Append files to FormData
    for (const [key, value] of Object.entries(files)) {
      if (value) {
        photosFormData.append(key, value);
      }
    }

    try {
      setUploading(true);
      const res = await employeeAction.CREATE.uploadPhotos(photosFormData);
      if (res.status == 200) {
        toast.success(res.message);
        // Clear fields after successful upload
        setFiles({
          driverLicense: null,
          aadharCard: null,
          profilePhoto: null,
        });
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
    <form onSubmit={handleSubmit}>
      <div className=' grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6'>
        <div className=' flex-col flex gap-1 flex-1'>
          <label>Profile Photo:</label>
          <input
            type='file'
            onChange={(e) => handleFileChange(e, 'profilePhoto')}
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
          <label>Driving License Photo:</label>
          <input
            type='file'
            onChange={(e) => handleFileChange(e, 'driverLicense')}
          />
        </div>
      </div>
      <div className='flex w-full justify-center items-center mb-4 mt-10'>
        <button
          className=' bg-green-500 w-40 text-white rounded py-1 flex justify-center items-center '
          type='submit'
        >
          {uploading ? <FaSpinner /> : 'Upload Photos'}
        </button>
      </div>
      <p className='text-red-400'>
        After photo upload, please re-login to see changes
      </p>
    </form>
  );
};

export default PhotosUpload;

'use client';

import Image from 'next/image';
import React, { CSSProperties, useEffect, useState } from 'react';
import HashLoader from 'react-spinners/HashLoader';
const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red',
};

const ViewPhotos = ({ details }) => {
  const profilePhotoURL = details?.user?.employee?.profilePhotoURL;
  const aadharCardURL = details?.user?.employee?.aadharCardURL;
  const drivingLicenseURL = details?.user?.employee?.drivingLicenseURL;

  return (
    <div className=' grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6'>
      <div className='flex flex-col gap-1'>
        <p>Profile</p>
        {profilePhotoURL ? (
          <Image
            className='rounded'
            width={250}
            height={250}
            alt='profile'
            src={profilePhotoURL}
          />
        ) : (
          <p className='text-red-500'>No photo uploaded</p>
        )}
      </div>
      <div className='flex flex-col gap-1'>
        <p>Aadhar Card</p>
        {aadharCardURL ? (
          <Image
            className='rounded'
            width={250}
            height={200}
            alt='aadhar card'
            src={aadharCardURL}
          />
        ) : (
          <p className='text-red-500'>No photo uploaded</p>
        )}
      </div>
      <div className='flex flex-col gap-1'>
        <p>Driving license</p>
        {drivingLicenseURL ? (
          <Image
            className='rounded'
            width={250}
            height={250}
            alt='driving license'
            src={drivingLicenseURL}
          />
        ) : (
          <p className='text-red-500'>No photo uploaded</p>
        )}
      </div>
    </div>
  );
};

export default ViewPhotos;

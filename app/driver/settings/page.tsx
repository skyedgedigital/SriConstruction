'use client';
import ViewPhotos from '@/components/driver/photos/ViewPhotos';
import PhotosUpload from '@/components/driver/photos/PhotosUplaod';
import UpdatePassword from '@/components/driver/UpdatePassword';
import EmpDetails from '@/components/EmpDetails';
import { useSession } from 'next-auth/react';
import React, { CSSProperties } from 'react';
import HashLoader from 'react-spinners/HashLoader';

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red',
};
const Settings = () => {
  const session = useSession();
  if (!session.data) {
    return (
      <>
        <div className='flex justify-center items-center h-screen w-full'>
          <HashLoader
            color='#000000'
            cssOverride={override}
            aria-label='Loading...'
          />
        </div>
      </>
    );
  }
  return (
    <section className='flex flex-col gap-4'>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Settings
      </h1>
      <EmpDetails details={session?.data} />
      <div className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 p-4'>
        
        {
          //@ts-ignore
        session?.data?.user?.employee?.phoneNo && (
          <ViewPhotos details={session?.data} />
        )}
        <PhotosUpload phoneNo={
          //@ts-ignore
          session?.data?.user?.employee?.phoneNo} />
      </div>
      <UpdatePassword />
    </section>
  );
};

export default Settings;

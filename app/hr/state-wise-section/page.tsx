'use client';
import StateWiseForm from '@/components/hr/StateWiseForm';
import StateWiseView from '@/components/hr/StateWiseView';
import React, { useState } from 'react';
import { boolean } from 'zod';

const Page = () => {
  const [reload, setReload] = useState<boolean>(false);

  const handleFormSubmit = () => {
    setReload((prev) => !prev);
  };

  return (
    <section className='flex flex-col h-screen'>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2'>
        State Wise Section
      </h1>

      <div className='flex-1 overflow-y-auto p-4'>
        <div className='flex flex-col lg:gap-8 lg:flex-row'>
          <div className='flex-1'>
            <StateWiseView reload={reload} />
          </div>

          <div className='lg:w-fit'>
            <div className='lg:sticky lg:top-4'>
              <StateWiseForm onFormSubmit={handleFormSubmit} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;

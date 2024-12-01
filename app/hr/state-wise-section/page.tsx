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
    <div>
      <div>
        <h1 className='font-bold text-blue-50 border-b-2 border-blue-500 text-center py-2 mb-4'>
          State wise action
        </h1>
        <div className='flex flex-col lg:flex-row'>
          <StateWiseView reload={reload} />
          <StateWiseForm onFormSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
};

export default Page;

import React from 'react';
import InvoiceManagement from '@/components/InvoiceManagement';

const page = () => {
  return (
    <section className='flex flex-col w-full'>
      <h1 className='font-bold text-base text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Invoice
      </h1>

      <InvoiceManagement />
    </section>
  );
};

export default page;

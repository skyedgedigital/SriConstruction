'use client';

import WorkOrderForm from '@/components/hr/workOrderForm';
import WorkOrderView from '@/components/hr/workOrderView';

const Page = () => {
  return (
    <section className='flex flex-col h-screen'>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2'>
        Work Orders
      </h1>

      <div className='flex-1 overflow-y-auto p-4'>
        <div className='flex flex-col lg:gap-8 lg:flex-row'>
          <div className='flex-1'>
            <WorkOrderView />
          </div>

          <div className='lg:w-1/3'>
            <div className='lg:sticky lg:top-0'>
              <WorkOrderForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;

import React from 'react';
import CreateChalan from '@/components/driver/CreateChalan';

const Chalan: React.FC<{}> = () => {
  return (
    <section>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Chalan
      </h1>
      <CreateChalan />
    </section>
  );
};

export default Chalan;

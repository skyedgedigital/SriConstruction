'use client';
import UpdatePassword from '@/components/driver/UpdatePassword';
import EmpDetails from '@/components/EmpDetails';
import { useSession } from 'next-auth/react';
import { CSSProperties } from 'react';
import HashLoader from 'react-spinners/HashLoader';
const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red',
};
const Driver = () => {
  const session = useSession();
  //   console.warn(session);

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
    <>
      <>
        <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
          Dashboard
        </h1>{' '}
        <EmpDetails details={session?.data} />
        <div className='ml-56 mt-4'>
          <UpdatePassword />
        </div>
      </>
    </>
  );
};
export default Driver;

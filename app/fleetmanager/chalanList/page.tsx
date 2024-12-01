'use client';
import chalanAction from '@/lib/actions/chalan/chalanAction';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface PhysicalChalansObj {
  chalanNumber: string;
  file: string;
}

const Page = (props) => {
  const searchParams = useSearchParams();
  const [list, setList] = useState<[PhysicalChalansObj]>(null);
  useEffect(() => {
    const fn = async () => {
      let firstParam = searchParams.get('invoiceNumber');
      let secondParam = searchParams.get('invoiceCreatedAt');
      console.log(firstParam + ' ' + secondParam);
      const resp = await chalanAction.FETCH.getPhysicalChalansOfInvoice(
        firstParam,
        secondParam
      );
      if (resp?.success) {
        toast.success(resp.message);
        setList(JSON.parse(resp.data));
      } else {
        toast.error(resp.message);
      }
    };
    fn();
  }, [searchParams]);
  return (
    <>
      <div>
        <h2 className='text-center text-3xl'>The List Of Physical Chalans</h2>
        <div className='flex justify-evenly mt-4 text-2xl font-semibold'>
          <span>Chalan Number</span>
          <span>Physical Chalan Link</span>
        </div>
        {list?.map((ele: any) => {
          return (
            <>
              <div
                key={ele?.chalanNumber}
                className='flex justify-evenly border-b-2 p-3 mt-2'
              >
                <span className='text-center'>{ele?.chalanNumber}</span>
                <span>
                  <button
                    onClick={() => {
                      window.open(ele?.file, '_blank');
                    }}
                    className='text-blue-500'
                  >
                    Link
                  </button>
                </span>
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};

export default Page;

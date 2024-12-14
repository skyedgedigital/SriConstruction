'use client';

import { ApiResponse } from '@/interfaces/APIresponses.interface';
import chemicalAction from '@/lib/actions/chemicals/chemicalAction';
import PpeAction from '@/lib/actions/ppe/ppeAction';
import SafetyToolsAction from '@/lib/actions/safetyTools/safetyToolsAction';
import { formatCurrency } from '@/utils/formatCurrency';
import { useSearchParams } from 'next/navigation';
import React, { CSSProperties, useEffect, useState } from 'react';
import HashLoader from 'react-spinners/HashLoader';

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red',
};

const Page = () => {
  const params = useSearchParams();
  const [data, setData] = useState<[]>(null);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fn = async () => {
      setLoading(true); // Start loading when fetching data
      const type = params.get('_type');
      setType(type);

      let resp: ApiResponse<any>;
      if (type === 'Chemical') {
        resp = await chemicalAction.FETCH.fetchChemicalPurchases();
      } else if (type === 'PPE') {
        resp = await PpeAction.FETCH.fetchPpePurchases();
      } else if (type === 'Tool') {
        resp = await SafetyToolsAction.FETCH.fetchSafetyToolPurchases();
      }

      if (resp.success) {
        setData(JSON.parse(resp.data));
      }
      setLoading(false); // Stop loading once data is fetched
    };

    fn();
  }, [params]);

  return (
    <>
      {/* Loader */}
      {loading ? (
        <div className='flex justify-center items-center h-screen w-full'>
          <HashLoader
            color='#000000'
            cssOverride={override}
            aria-label='Loading...'
          />
        </div>
      ) : (
        <div className='ml-16'>
          <p className='text-center font-semibold text-4xl'>
            {'List of ' + type + ' Purchases'}
          </p>
          <div className='mt-8'>
            {data !== null && (
              <table className='table-auto w-full text-left border-collapse'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='px-4 py-2 border'>{type} Name</th>
                    <th className='px-4 py-2 border'>Date</th>
                    <th className='px-4 py-2 border'>Price</th>
                    <th className='px-4 py-2 border'>Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item: any, index) => (
                    <tr key={index} className='border-t'>
                      <td className='px-4 py-2 border'>
                        {item?.chemicalId?.name ||
                          item?.ppeId?.name ||
                          item?.toolId?.name}
                      </td>
                      <td className='px-4 py-2 border'>{item?.date}</td>
                      <td className='px-4 py-2 border'>
                        {formatCurrency(item?.price)}
                      </td>
                      <td className='px-4 py-2 border'>{item?.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Page;

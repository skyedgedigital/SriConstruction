import toolManagementAction from '@/lib/actions/tool/toolManagementAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Storage = () => {
  const [result, setResult] = useState(null);
  useEffect(() => {
    const fn = async () => {
      const resp = await toolManagementAction.FETCH.fetchTools();
      if (resp.success) {
        setResult(JSON.parse(resp.data));
        console.log(resp.data);
      } else {
        toast.error(resp.message || 'Failed to load tools, Please try later');
      }
    };
    fn();
  }, []);
  return (
    <>
      <div className='flex flex-col items-center justify-center mt-6'>
        <h2 className='text-3xl'>List Of Tools</h2>
        <table className='min-w-full divide-y divide-gray-200 mt-4 '>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Tool Name
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Quantity
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Price (per Item)
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {result?.map((ele) => (
              <tr key={ele._id} className='hover:bg-gray-100'>
                <td className='px-6 py-4 whitespace-nowrap'>{ele.toolName}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{ele.quantity}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{ele.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Storage;

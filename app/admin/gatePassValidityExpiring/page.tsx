'use client';
import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import React, { useEffect, useState } from 'react';

const Page = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const fn = async () => {
      const resp = await EmployeeDataAction.FETCH.fetchNotification();
      if (resp.success) {
        setCount(await JSON.parse(resp.data).totalCount);
      }
      setData(JSON.parse(resp.data));
    };
    fn();
  }, []);
  return (
    <>
      <div className='ml-16'>
        <p className='text-center text-3xl'>
          The List of Employee with Gate Pass Expiry Within the next 60 days
        </p>
        <p className='text-center text-xl mt-4'>
          <span className='text-blue-500 text-2xl font-semibold'>
            Total Count :
          </span>
          <span className='ml-1 text-green-500 font-semibold text-2xl'>
            {count}
          </span>
        </p>
      </div>
      <div className='ml-16'>
        {data.length === 0 ? (
          <>
            <p className='text-center text-3xl py-10'>No Data Found</p>
          </>
        ) : (
          <>
            {
              <table className='w-full border-collapse border border-blue-500 mt-6 rounded-sm'>
                <thead>
                  <tr>
                    <th className='border-2 border-blue-500 px-2 py-1'>
                      Employee Name
                    </th>
                    <th className='border-2 border-blue-500 px-2 py-1'>
                      Employee Code
                    </th>
                    <th className='border-2 border-blue-500 px-2 py-1'>
                      Gate Pass Valid Till
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr
                      key={index}
                      className='hover:bg-slate-300 cursor-pointer'
                    >
                      <td className='border border-blue-500 px-2 py-4 text-center '>
                        {item.empName}
                      </td>
                      <td className='border border-blue-500 px-2 py-4 text-center'>
                        {item.empCode}
                      </td>
                      <td className='border border-blue-500 px-2 py-4 text-center'>
                        {item.gatePassValidTill}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </>
        )}
      </div>
    </>
  );
};

export default Page;

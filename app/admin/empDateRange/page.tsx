'use client';

import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import React, { useState } from 'react';

const Page = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [isToggled, setIsToggled] = useState(false);
  const [count, setCount] = useState(0);
  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  const handleFetchEmployees = async () => {
    setError('');
    try {
      if (!startDate || !endDate) {
        setError('Please enter both start and end dates.');
        return;
      }
      let response: any = {};
      if (!isToggled) {
        response =
          await EmployeeDataAction.FETCH.fetchEmpsJoinedWithinDateRange(
            startDate,
            endDate
          );
      } else {
        response = await EmployeeDataAction.FETCH.fetchEmpsResigned(
          startDate,
          endDate
        );
      }

      if (response.success) {
        setEmployees(JSON.parse(response.data)?.filteredDocs);
        setCount(response.count);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An error occurred while fetching employees.');
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Employee Date Range Search</h1>
      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='flex flex-col'>
          <label htmlFor='startDate' className='font-semibold mb-1'>
            Start Date (dd-mm-yyyy):
          </label>
          <input
            type='date'
            id='startDate'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder='01-01-2022'
            className='border border-gray-300 rounded-md px-4 py-2'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='endDate' className='font-semibold mb-1'>
            End Date (dd-mm-yyyy):
          </label>
          <input
            type='date'
            id='endDate'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder='31-12-2022'
            className='border border-gray-300 rounded-md px-4 py-2'
          />
        </div>
      </div>
      <div className='flex'>
        <button
          onClick={handleToggle}
          className={`w-16 h-8 flex items-center rounded-full p-1 mb-4 ${
            isToggled ? 'bg-blue-500' : 'bg-gray-300'
          } transition-colors duration-300`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              isToggled ? 'translate-x-8' : 'translate-x-0'
            }`}
          ></div>
        </button>
        <span className='justify-center ml-2 text-lg text-blue-500'>
          {isToggled ? <>ResignDate Search</> : <>AppoitmentDate Search</>}
        </span>
      </div>
      <button
        onClick={handleFetchEmployees}
        className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition'
      >
        Search
      </button>
      {error && <p className='text-red-500 mt-4'>{error}</p>}
      <div className='mt-6'>
        <h2 className='text-xl font-semibold mb-2'>Results:</h2>
        {employees.length > 0 ? (
          <div>
            <span className='text-blue-600 text-xl'>
              Count of Employees {count}
            </span>
            <table className='table-auto border-collapse border border-gray-300 w-full mt-3'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border border-gray-300 px-4 py-2'>
                    Employee Code
                  </th>
                  <th className='border border-gray-300 px-4 py-2'>
                    Employee Name
                  </th>
                  <th className='border border-gray-300 px-4 py-2'>
                    Appointment Date
                  </th>
                  <th className='border border-gray-300 px-4 py-2'>
                    Resign Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr key={index}>
                    <td className='border border-gray-300 px-4 py-2'>
                      {employee.code}
                    </td>
                    <td className='border border-gray-300 px-4 py-2'>
                      {employee.name}
                    </td>
                    <td className='border border-gray-300 px-4 py-2'>
                      {employee.appointmentDate}
                    </td>
                    <td className='border border-gray-300 px-4 py-2'>
                      {employee.resignDate || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No employees found within the selected date range.</p>
        )}
      </div>
    </div>
  );
};

export default Page;

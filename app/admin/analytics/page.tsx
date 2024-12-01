'use client';
import analyticsAction from '@/lib/actions/analytics/analyticsAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Page = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [result, setResults] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  let months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  let years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
  useEffect(() => {
    const fn = async () => {
      const resp = await vehicleAction.FETCH.fetchAllVehicles();
      console.warn(resp);
      if (resp.data) {
        setVehicles(JSON.parse(resp.data));
      }
    };
    fn();
  }, []);
  const verify = (): boolean => {
    if (selectedOption === '') {
      toast.error('Select A Vehicle');
      return false;
    }
    if (selectedMonth === '') {
      toast.error('Select A Month');
      return false;
    }
    if (selectedYear === '') {
      toast.error('Select A Year');
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verify()) {
      return;
    }
    const obj = {
      vehicleNumber: selectedOption,
      month: selectedMonth,
      year: selectedYear,
    };
    const result = await analyticsAction.FETCH.fetchAnalytics(
      JSON.stringify(obj)
    );
    if (result?.success) {
      toast.success('Analytics Retrieved');
      setResults(JSON.parse(result.data));
      console.warn(JSON.parse(result.data));
    } else {
      toast.error('An Error Occurred');
    }
  };
  return (
    <>
      <h1 className='font-bold text-base text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Analytics
      </h1>
      <form
        onSubmit={handleSubmit}
        className='max-w-md mx-auto mt-4 p-6 bg-white shadow-md rounded-md flex-wrap'
      >
        <div className='mb-4'>
          <label
            htmlFor='dropdown'
            className='block text-sm font-medium text-gray-700'
          >
            Select a Vehicle:
          </label>
          <select
            id='dropdown'
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            {/* <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option> */}
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.vehicleNumber}>
                {vehicle.vehicleNumber}
              </option>
            ))}
          </select>
        </div>

        <div className='mb-4'>
          <label
            htmlFor='dropdown'
            className='block text-sm font-medium text-gray-700'
          >
            Select Month:
          </label>
          <select
            id='dropdown'
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            {/* <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option> */}
            {months.map((ele) => (
              <option key={ele} value={ele}>
                {ele}
              </option>
            ))}
          </select>
        </div>

        <div className='mb-4'>
          <label
            htmlFor='dropdown'
            className='block text-sm font-medium text-gray-700'
          >
            Select Year:
          </label>
          <select
            id='dropdown'
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            {/* <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option> */}
            {years.map((ele) => (
              <option key={ele} value={ele}>
                {ele}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type='submit'
            className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            View Analytics
          </button>
        </div>
      </form>
      {result && (
        <div className='flex items-center justify-center p-2 text-2xl mt-4'>
          Analytics for {selectedOption} - {selectedMonth}/{selectedYear}
        </div>
      )}
      {result && (
        <div className='flex p-3 flex-wrap justify-around items-center'>
          <div
            className='border-white-500 m-4 shadow-lg border-2 cursor-pointer p-6 flex flex-col rounded-md text-xl text-blue-500 
  hover:shadow-blue-500 hover:scale-105 transition duration-300 ease-in-out'
          >
            <span>Fuel Cost</span>
            {' ₹' + result.fuelCost + '/-'}
          </div>

          <div
            className='border-white-500 shadow-lg border-2 cursor-pointer p-6 m-4 flex flex-col rounded-md text-xl text-blue-500 
  hover:shadow-blue-500 hover:scale-105 transition duration-300 ease-in-out'
          >
            <span>Compliances Cost</span>
            {' ₹' + result.compliancesCost + '/-'}
          </div>
          <div
            className='border-white-500 shadow-lg border-2 cursor-pointer m-4 p-6 flex flex-col rounded-md text-xl text-blue-500 
  hover:shadow-blue-500 hover:scale-105 transition duration-300 ease-in-out'
          >
            <span>Consumables Cost</span>
            {' ₹' + result.consumablesCost + '/-'}
          </div>
          <div
            className='border-white-500 shadow-lg border-2 cursor-pointer m-4 p-6 flex flex-col rounded-md text-xl text-green-500 
  hover:shadow-green-500 hover:scale-105 transition duration-300 ease-in-out'
          >
            <span>Total Cost</span>
            {' ₹' + result.totalCost + '/-'}
          </div>
        </div>
      )}
    </>
  );
};

export default Page;

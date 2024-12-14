'use client';

import AdminAnalytics from '@/lib/actions/adminAnalytics/adminAnalyticsAction';
import { formatCurrency } from '@/utils/formatCurrency';
import React, { CSSProperties, useState } from 'react';
import toast from 'react-hot-toast';
import HashLoader from 'react-spinners/HashLoader';
const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red',
};
const Page = () => {
  const monthNames = [
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
  const years = ['2024', '2025', '2026', '2027'];

  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error('Please select both month and year');
      return;
    }

    setLoading(true);
    try {
      const resp = await AdminAnalytics.fetchVehicles.fetchVehicleHours(
        selectedMonth,
        selectedYear
      );
      if (resp?.success) {
        // console.warn(resp.data);
        toast.success('Data fetched');
        setData(JSON.parse(resp.data));
      } else {
        setData([]);
        toast.error(resp.message);
      }
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = data?.reduce((accumulator, vehicle) => {
    return accumulator + vehicle.totalCost;
  }, 0);
  const totalHours = data?.reduce((accumulator, vehicle) => {
    return accumulator + vehicle.totalHours;
  }, 0);

  const fuelCost = data?.reduce((accumulator, vehicle) => {
    return accumulator + vehicle.fuelCost;
  }, 0);
  const totalFuel = data?.reduce((accumulator, vehicle) => {
    return accumulator + vehicle.totalFuel;
  }, 0);

  const consumablesCost = data?.reduce((accumulator, vehicle) => {
    return accumulator + vehicle.consumablesCost;
  }, 0);

  const complianceCost = data?.reduce((accumulator, vehicle) => {
    return accumulator + vehicle.complianceCost;
  }, 0);

  return (
    <div>
      <h1 className='font-bold text-base text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Vehicle Data
      </h1>
      <div className='border-[1px] border-gray-300 rounded-md shadow-lg  gap-6 mt-5 p-4 lg:w-1/2 md:w-3/4 w-full mx-auto'>
        <div className='flex flex-col md:flex-row w-full gap-2 justify-center items-center'>
          <div className='flex-1'>
            <label className='block text-lg font-medium mb-2'>Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className='block w-full p-2 border border-gray-300 rounded-md'
              disabled={loading} // Disable during loading
            >
              <option value=''>Select Month</option>
              {monthNames.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className='flex-1'>
            <label className='block text-lg font-medium mb-2'>Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className='block w-full p-2 border border-gray-300 rounded-md'
              disabled={loading}
            >
              <option value=''>Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='w-full flex justify-center items-center'>
          <button
            onClick={fetchData}
            className={`mt-6 p-2 rounded-md text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'
            }`}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </div>
      {loading ? (
        // <div className="flex justify-center items-center min-h-[200px]">
        //   <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent">

        //   </div>
        // </div>
        <div className='flex justify-center items-center h-40 w-full'>
          <HashLoader
            color='#000000'
            cssOverride={override}
            aria-label='Loading...'
          />
        </div>
      ) : // Render the data if not loading
      data.length > 0 ? (
        <table className='table-auto border-collapse border border-gray-300 w-full mt-5'>
          <thead className='text-sm'>
            <tr className='bg-gray-800 text-white'>
              <th className='border border-gray-300 px-4 py-4'>
                Vehicle Number
              </th>
              <th className='border border-gray-300 px-4 py-2'>Total Hours</th>
              <th className='border border-gray-300 px-4 py-2'>
                Amount(from Challan)
              </th>
              <th>Amount(from Consumables)</th>
              <th>Amount(from Compliances)</th>
              <th className='border border-gray-300 px-4 py-2'>Total Fuel</th>
              <th className='border border-gray-300 px-4 py-2'>
                Total Fuel Cost
              </th>
              <th className='border border-gray-300 px-4 py-2'>
                Total Amount(Challan - Fuel)
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.map((vehicle, index) => (
              <tr key={index}>
                <td className='border border-gray-300 px-4 py-2'>
                  {vehicle?.vehicleNumber}
                </td>
                <td className='border border-gray-300 px-4 py-2'>
                  {Math.round(vehicle?.totalHours)}
                </td>
                <td className='border border-gray-300 px-4 py-2'>
                  {formatCurrency(vehicle?.totalCost)}
                </td>
                <td className='border border-gray-300 px-4 py-2'>
                  {formatCurrency(vehicle?.consumablesCost)}
                </td>
                <td className='border border-gray-300 px-4 py-2'>
                  {formatCurrency(vehicle?.complianceCost)}
                </td>
                <td className='border border-gray-300 px-4 py-2'>
                  {Math.round(vehicle?.totalFuel)}
                </td>
                <td className='border border-gray-300 px-4 py-2'>
                  {formatCurrency(vehicle?.fuelCost)}
                </td>
                <td className='border border-gray-300 px-4 py-2'>
                  {formatCurrency(
                    vehicle?.totalCost -
                      vehicle?.fuelCost -
                      vehicle?.consumablesCost -
                      vehicle?.complianceCost
                  )}
                </td>
              </tr>
            ))}
            <tr className='bg-gray-800 text-white'>
              <td className='border border-gray-300 px-4 py-4'>Total</td>
              <td className='border border-gray-300 px-4 py-2'>
                {Math.round(totalHours)} Hour
              </td>
              <td className='border border-gray-300 px-4 py-2'>
                {formatCurrency(totalCost)}
              </td>
              <td className='border border-gray-300 px-4 py-2'>
                {formatCurrency(consumablesCost)}
              </td>
              <td className='border border-gray-300 px-4 py-2'>
                {formatCurrency(complianceCost)}
              </td>
              <td className='border border-gray-300 px-4 py-2'>
                {Math.round(totalFuel)} Ltr.
              </td>
              <td className='border border-gray-300 px-4 py-2'>
                {formatCurrency(fuelCost)}
              </td>
              <td className='border border-gray-300 px-4 py-2'>
                {formatCurrency(
                  totalCost - fuelCost - consumablesCost - complianceCost
                )}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className='text-gray-600 flex justify-center items-center text-4xl min-h-40'>
          No data available
        </p>
      )}
    </div>
  );
};

export default Page;

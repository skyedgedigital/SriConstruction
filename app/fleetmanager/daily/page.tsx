'use client';
import dailyUtilisationAction from '@/lib/actions/dailyUtilisation/dailyUtilisationAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import workOrderAction from '@/lib/actions/workOrder/workOrderAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const Page = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);
  const [result, setResult] = useState([]);
  useEffect(() => {
    const fn = async () => {
      const resp = await vehicleAction.FETCH.fetchAllVehicles();
      console.warn(resp);
      if (resp.data) {
        const vehicles = JSON.parse(resp.data);
        setVehicles(vehicles);
      }
    };
    fn();
  }, []);

  const exportToExcel = () => {
    const dataToExport = result.map((item) => ({
      Vehicle: item.vehicle.vehicleNumber,
      Date: `${String(new Date(item.date).getDate()).padStart(2, '0')}-${String(
        new Date(item.date).getMonth() + 1
      ).padStart(2, '0')}-${new Date(item.date).getFullYear()}`,
      Location: item.location,
      JobStart: item.jobStart,
      JobEnd: item.jobEnd,
      PermitNumber: item.permitNumber,
      CostCenter: item.costCenter,
      Department: item.dep,
      Engineer: item.engineer,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Utilisation');

    // Export file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'DailyUtilisation.xlsx');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resp = await dailyUtilisationAction.FETCH.fetchDailyUtilisation(
      selectedOption,
      month,
      year
    );
    if (resp.success) {
      toast.success('done');
      console.log(JSON.parse(resp.data));
      setResult(JSON.parse(resp.data));
    } else {
      toast.error('Error');
    }
  };

  return (
    <>
      <div>
        <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
          Daily Utilisation
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
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
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
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            >
              <option value=''>Select...</option>
              <option value={1}>Jan</option>
              <option value={2}>Feb</option>
              <option value={3}>Mar</option>
              <option value={4}>Apr</option>
              <option value={5}>May</option>
              <option value={6}>Jun</option>
              <option value={7}>Jul</option>
              <option value={8}>Aug</option>
              <option value={9}>Sep</option>
              <option value={10}>Oct</option>
              <option value={11}>Nov</option>
              <option value={12}>Dec</option>
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
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            >
              <option value=''>Select...</option>
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <div>
            <button
              type='submit'
              className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              View Entries
            </button>
          </div>
        </form>

        {result.length > 0 ? (
          <>
            <div className='overflow-x-auto'>
              <button
                onClick={exportToExcel}
                className='mt-4 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700'
              >
                Download as Excel
              </button>
            </div>
            <table className='w-full border-collapse mt-6'>
              <thead>
                <tr className='bg-gray-200'>
                  <th className='border p-2'>Vehicle</th>
                  <th className='border p-2'>Date</th>
                  <th className='border p-2'>Location</th>
                  <th className='border p-2'>Job Start</th>
                  <th className='border p-2'>Job End</th>
                  <th className='border p-2'>Permit Number</th>
                  <th className='border p-2'>Cost Center</th>
                  <th className='border p-2'>Department</th>
                  <th className='border p-2'>Engineer</th>
                </tr>
              </thead>
              <tbody>
                {result.map((item, index) => {
                  // Format the date from ISO to dd-mm-yyyy
                  const dateObj = new Date(item.date);
                  const formattedDate = `${String(dateObj.getDate()).padStart(
                    2,
                    '0'
                  )}-${String(dateObj.getMonth() + 1).padStart(
                    2,
                    '0'
                  )}-${dateObj.getFullYear()}`;

                  return (
                    <tr key={index} className='hover:bg-gray-100'>
                      <td className='border p-2'>
                        {item.vehicle.vehicleNumber}
                      </td>
                      <td className='border p-2'>{formattedDate}</td>
                      <td className='border p-2'>{item.location}</td>
                      <td className='border p-2'>{item.jobStart}</td>
                      <td className='border p-2'>{item.jobEnd}</td>
                      <td className='border p-2'>{item.permitNumber}</td>
                      <td className='border p-2'>{item.costCenter}</td>
                      <td className='border p-2'>{item.dep}</td>
                      <td className='border p-2'>{item.engineer}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Page;

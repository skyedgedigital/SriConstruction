import chalanAction from '@/lib/actions/chalan/chalanAction';
import fuelManagementAction from '@/lib/actions/fuelManagement/fuelManagementAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Create = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [fuel, setFuel] = useState(1);
  const [amount, setAmount] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [meterReading, setMeterReading] = useState('');
  const [date, setDate] = useState('');

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
      if (resp.success) {
        if (resp?.data) {
          setVehicles(JSON.parse(resp?.data));
        }
      } else {
        toast.error(
          resp.message || 'Failed to Load vehicles, Please Try Later'
        );
      }
    };
    fn();
  }, []);

  const verify = (): boolean => {
    const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (selectedOption === '') {
      toast.error('No Vehicle Selected');
      return false;
    }
    if (selectedMonth === '') {
      toast.error('No Month Selected');
      return false;
    }
    if (selectedYear === '') {
      toast.error('No Year Selected');
      return false;
    }
    if (date === '' || !dateFormatRegex.test(date)) {
      toast.error('Please Select a Date in the format DD-MM-YYYY');
      return false;
    }
    const trimmedDate = date.replace(/\s/g, '');
    if (trimmedDate !== date) {
      toast.error('Date should not contain any blank spaces');
      return false;
    }
    if (meterReading === '') {
      toast.error('Meter-Reading not Added');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    // alert(selectedOption);
    e.preventDefault();
    if (!verify()) {
      return;
    }
    const dataObj = {
      vehicleNumber: selectedOption,
      fuel: fuel,
      month: selectedMonth,
      year: selectedYear,
      meterReading: meterReading,
      DocId: selectedMonth + selectedYear,
      entry: true,
      amount: amount,
    };
    const resp = await fuelManagementAction.CREATE.createFuelManagement(
      JSON.stringify(dataObj)
    );
    if (resp.success) {
      toast.success(resp.message);
    } else {
      toast.error(resp.message);
    }
  };

  return (
    <>
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
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Fuel (in litres):
          </label>
          <input
            type='number'
            id='input'
            value={fuel}
            onChange={(e) => {
              setFuel(parseInt(e.target.value));
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Tool Here'
            min={'1'}
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Amount (in rupees):
          </label>
          <input
            type='number'
            id='input'
            value={amount}
            onChange={(e) => {
              setAmount(parseInt(e.target.value));
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Tool Here'
            min={'1'}
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='dropdown'
            className='block text-sm font-medium text-gray-700'
          >
            Select a Month:
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
            Select a Year:
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

        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Date(DD-MM-YYYY):
          </label>
          <input
            type='text'
            id='input'
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Date Here'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Meter Reading:
          </label>
          <input
            type='text'
            id='input'
            value={meterReading}
            onChange={(e) => {
              setMeterReading(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Meter Reading Here'
          />
        </div>

        <div>
          <button
            type='submit'
            className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Add Entry
          </button>
        </div>
      </form>
    </>
  );
};

export default Create;

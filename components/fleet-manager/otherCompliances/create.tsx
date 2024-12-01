import complianceAction from '@/lib/actions/compliances/complianceAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Create = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedCompliance, setSelectedCompliance] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [amount, setAmount] = useState(0);
  const [otherTxt, setOtherTxt] = useState('');
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
  const options = [
    'EMI',
    'INSURANCE',
    'TAX',
    'FITNESS',
    'LOAD TEST',
    'SAFETY',
    'PUC',
    'OTHER',
  ];
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
    if (selectedOption === '') {
      toast.error('Select A Vehicle');
      return false;
    }
    if (selectedCompliance === '') {
      toast.error('Select A Compliance');
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
    if (selectedCompliance === 'OTHER' && otherTxt === '') {
      toast.error('Need to fill description');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (!verify()) {
      return;
    }

    e.preventDefault();
    let dataObj: any = {
      vehicleNumber: selectedOption,
      compliance: selectedCompliance,
      month: selectedMonth,
      year: selectedYear,
      amount: amount,
      DocId: selectedMonth + selectedYear,
    };
    if (selectedCompliance === 'OTHER') {
      dataObj.complianceDesc = otherTxt;
    }
    const resp = await complianceAction.CREATE.createCompliance(
      JSON.stringify(dataObj)
    );
    if (resp.success) {
      toast.success(resp.message);
    } else {
      toast.error(resp.message);
    }
    console.warn(dataObj);
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
            htmlFor='dropdown'
            className='block text-sm font-medium text-gray-700'
          >
            Select a Compliance:
          </label>
          <select
            id='dropdown'
            value={selectedCompliance}
            onChange={(e) => setSelectedCompliance(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            {/* <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option> */}
            {options.map((ele) => (
              <option key={ele} value={ele}>
                {ele}
              </option>
            ))}
          </select>
        </div>
        {selectedCompliance === 'OTHER' && (
          <span className='text-sm text-blue-500'>
            If OTHER is selected , please enter the description below
          </span>
        )}
        {selectedCompliance === 'OTHER' && (
          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Compliance Description:
            </label>
            <input
              type='text'
              id='input'
              value={otherTxt}
              onChange={(e) => {
                setOtherTxt(e.target.value);
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter Description Here'
            />
          </div>
        )}

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

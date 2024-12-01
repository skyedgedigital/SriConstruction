import storeManagementAction from '@/lib/actions/storeManagement/storeManagementAction';
import toolManagementAction from '@/lib/actions/tool/toolManagementAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CreateTool = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tool, setTool] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState('');
  useEffect(() => {
    const fn = async () => {
      const resp = await vehicleAction.FETCH.fetchAllVehicles();
      console.warn(resp);
      if (resp.success) {
        if (resp.data) {
          setVehicles(JSON.parse(resp.data));
        } else {
          toast.error(
            resp.message || 'Failed to load vehicle, Please try later'
          );
        }
      }
    };
    const fn1 = async () => {
      const resp = await toolManagementAction.FETCH.fetchTools();
      if (resp.success) {
        if (resp.data) {
          setTools(JSON.parse(resp.data));
        }
      } else {
        toast.error(resp.message || 'Failed to load tools,Please try later');
      }
    };
    fn();
    fn1();
  }, []);

  const verify = (): boolean => {
    const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;

    if (selectedOption === '') {
      toast.error('Please select a Vehicle');
      return false;
    }
    if (selectedTool === '') {
      toast.error('Please Select A Tool');
      return false;
    }
    if (startDate === '' || !dateFormatRegex.test(startDate)) {
      toast.error('Please Select a Date in the format DD-MM-YYYY');
      return false;
    }
    // Remove white spaces from the date string
    const trimmedStartDate = startDate.replace(/\s/g, '');
    if (trimmedStartDate !== startDate) {
      toast.error('Start Date should not contain any blank spaces');
      return false;
    }
    // Remove white spaces from the date string
    const trimmedEndDate = endDate.replace(/\s/g, '');
    if (trimmedEndDate !== endDate) {
      toast.error('Start Date should not contain any blank spaces');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verify()) {
      return;
    }
    const [day, month, year] = startDate.split('-').map(Number);
    const startDateObj = new Date(year, month - 1, day);
    const [day1, month1, year1] = endDate.split('-').map(Number);
    const endDateObj = new Date(year1, month1 - 1, day1);
    const dataObjString = JSON.stringify({
      vehicleNumber: selectedOption,
      tool: selectedTool,
      quantity: quantity,
      dateOfAllotment: startDateObj,
      dateOfReturn: endDateObj,
    });
    const resp = await storeManagementAction.CREATE.createStoreManagement(
      dataObjString
    );
    if (resp.success) {
      setStartDate('');
      setEndDate('');
      setSelectedTool('');
      setQuantity(1);
      toast.success('Tools Added');
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
            htmlFor='dropdown'
            className='block text-sm font-medium text-gray-700'
          >
            Select a Tool:
          </label>
          <select
            id='dropdown'
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            {/* <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option> */}
            {tools.map((ele) => (
              <option key={ele._id} value={ele.toolName}>
                {ele.toolName}
              </option>
            ))}
          </select>
        </div>

        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Tool Quantity:
          </label>
          <input
            type='number'
            id='input'
            value={quantity}
            onChange={(e) => {
              setQuantity(parseInt(e.target.value));
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            // placeholder="Enter One Consumable Here"
            min='1'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Date of Allotment (DD-MM-YYYY)
          </label>
          <input
            type='text'
            id='input'
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
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
            Date of Return (DD-MM-YYYY)
          </label>
          <input
            type='text'
            id='input'
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Date Here'
          />
        </div>

        <div>
          <button
            type='submit'
            className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateTool;

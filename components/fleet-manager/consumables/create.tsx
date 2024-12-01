import consumableAction from '@/lib/actions/consumables/consumablesAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CreateConsumable = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [consumable, setConsumable] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(1);
  const [date, setDate] = useState('');
  useEffect(() => {
    const fn = async () => {
      const resp = await vehicleAction.FETCH.fetchAllVehicles();
      console.warn(resp);
      if (resp.success) {
        if (resp.data) {
          setVehicles(JSON.parse(resp.data));
        }
      } else {
        toast.error(resp.message || 'Unable to fetch Vehicles');
      }
    };
    fn();
  }, []);

  const handleSubmit = async (e) => {
    if (!verify()) {
      e.preventDefault();
      return;
    }
    e.preventDefault();

    const [day, month, year] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);

    let consumableObj = {
      vehicleNumber: selectedOption,
      consumableItem: consumable,
      quantity: quantity,
      amount: amount,
      date: dateObj,
    };
    const dataString = JSON.stringify(consumableObj);
    const resp = await consumableAction.CREATE.createConsumables(dataString);
    // console.log("Selected Option:", selectedOption);
    console.warn(resp);
    if (resp.success) {
      setConsumable('');
      setAmount(1);
      toast.success(resp.message);
    } else {
      toast.error(resp.message || ' Failed to Create consumables');
    }
  };

  const verify = (): boolean => {
    const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;

    if (selectedOption === '') {
      toast.error('Please select a Vehicle');
      return false;
    }
    if (!consumable || !consumable.trim()) {
      toast.error('Please Select A consumable');
      return false;
    }
    if (date === '' || !dateFormatRegex.test(date)) {
      toast.error('Please Select a Date in the format DD-MM-YYYY');
      return false;
    }
    // Remove white spaces from the date string
    const trimmedDate = date.replace(/\s/g, '');
    if (trimmedDate !== date) {
      toast.error('Date should not contain any blank spaces');
      return false;
    }
    return true;
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
            Select an option:
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
            Consumable Item:
          </label>
          <input
            type='text'
            id='input'
            value={consumable}
            onChange={(e) => {
              setConsumable(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter One Consumable Here'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Item Quantity:
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
            Total Amount(in rupees):
          </label>
          <input
            type='number'
            id='input'
            value={amount}
            onChange={(e) => {
              setAmount(parseInt(e.target.value));
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter One Consumable Here'
            min='1'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Date (DD-MM-YYYY)
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

export default CreateConsumable;

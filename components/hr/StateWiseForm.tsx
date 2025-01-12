'use client';

import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import State_CURD from '@/lib/actions/HR/State/StateAction';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const StateWiseForm = ({ onFormSubmit }) => {
  const [selectedState, setSelectedState] = useState('');
  const [address, setAddress] = useState('');
  const [workOrderId, setWorkOrderId] = useState('');
  const [workOrders, setWorkOrders] = useState([]);

  const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep',
    'Delhi',
    'Puducherry',
    'Ladakh',
    'Jammu and Kashmir',
  ];

  // Fetch work orders data (mocked here, replace with real fetch if available)
  useEffect(() => {
    async function fetchWorkOrders() {
      const response = await WorkOrderHrAction.FETCH.fetchAllValidWorkOrderHr();
      if (response.success) {
        toast.success('Work order retrived successfully');
        console.log('resp work order:', JSON.parse(response.data));
      }
      setWorkOrders(JSON.parse(response.data));
    }
    fetchWorkOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      selectedState,
      address,
      workOrderId,
    };
    const resp = await State_CURD.CREATE.createState(JSON.stringify(formData));
    if (resp.success) {
      toast.success('Form submitted successfully');
      setAddress('');
      setSelectedState('');
      setWorkOrderId('');
    } else {
      toast.error('Submission failed');
    }
    console.log(formData);
    onFormSubmit();
  };

  return (
    <div className='w-full flex-col justify-center p-4 gap-2 border-[1px] border-gray-300 rounded'>
      <h2 className='flex justify-center items-center text-2xl'>
        State-Wise Form
      </h2>
      <form
        onSubmit={handleSubmit}
        className='max-w-md mx-auto  p-6 bg-white rounded-md flex-wrap'
      >
        {/* State selection */}
        <div className='mb-4'>
          <label
            htmlFor='stateSelect'
            className='block text-sm font-medium text-gray-700'
          >
            Choose State
          </label>
          <select
            id='stateSelect'
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select a state</option>
            {indianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Address input */}
        <div className='mb-4'>
          <label
            htmlFor='addressInput'
            className='block text-sm font-medium text-gray-700'
          >
            Address
          </label>
          <input
            type='text'
            id='addressInput'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter address'
          />
        </div>

        {/* Work order selection */}
        <div className='mb-4'>
          <label
            htmlFor='workOrderSelect'
            className='block text-sm font-medium text-gray-700'
          >
            Work Order
          </label>
          <select
            id='workOrderSelect'
            value={workOrderId}
            onChange={(e) => setWorkOrderId(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select a work order</option>
            {workOrders.map((order) => (
              <option key={order._id} value={order._id}>
                {order.workOrderNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Submit button */}
        {address != '' && selectedState != '' && workOrderId != '' ? (
          <button
            type='submit'
            className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Submit
          </button>
        ) : (
          <button
            type='submit'
            disabled={true}
            className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-300 hover:bg-blue-400 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Submit
          </button>
        )}
      </form>
    </div>
  );
};

export default StateWiseForm;

import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const WorkOrderForm = () => {
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [date, setDate] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [orderDesc, setOrderDesc] = useState('');
  const [dept, setDept] = useState('');
  const [section, setSection] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    const obj = {
      workOrderNumber: workOrderNumber,
      date: date,
      jobDesc: jobDesc,
      orderDesc: orderDesc,
      dept: dept,
      section: section,
      validFrom: validFrom,
      validTo: validTo,
    };
    const resp = await WorkOrderHrAction.CREATE.createWorkOrderHr(
      JSON.stringify(obj)
    );
    if (resp.success) {
      toast.success(resp.message);
    } else {
      toast.error(resp.message);
    }
  };
  return (
    <div className='w-full flex-col justify-center p-4 gap-2 border-[1px] border-gray-300 rounded'>
      <h2 className='flex justify-center items-center text-xl'>
        Add WorkOrder
      </h2>
      <form
        onSubmit={handleSubmit}
        className=' bg-white  rounded-md flex-wrap w-full'
      >
        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Work Order Number
          </label>
          <input
            type='text'
            id='input'
            value={workOrderNumber}
            onChange={(e) => {
              setWorkOrderNumber(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Work Order Number'
            min='1'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Date
          </label>
          <input
            type='date'
            id='input'
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Work Order Number'
            min='1'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Job Description
          </label>
          <input
            type='text'
            id='input'
            value={jobDesc}
            onChange={(e) => {
              setJobDesc(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Job Desc'
            min='1'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Order Description
          </label>
          <input
            type='text'
            id='input'
            value={orderDesc}
            onChange={(e) => {
              setOrderDesc(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Work Order Number'
            min='1'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Department
          </label>
          <input
            type='text'
            id='input'
            value={dept}
            onChange={(e) => {
              setDept(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Department'
            min='1'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Section
          </label>
          <input
            type='text'
            id='input'
            value={section}
            onChange={(e) => {
              setSection(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Section'
            min='1'
          />
        </div>
        <div className='flex flex-col gap-2 lg:flex-row w-full'>
          <div className='mb-4 flex-grow'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Valid From
            </label>
            <input
              type='date'
              id='input'
              value={validFrom}
              onChange={(e) => {
                setValidFrom(e.target.value);
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter Work Order Number'
              min='1'
            />
          </div>
          <div className='mb-4 flex-grow'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Valid Till
            </label>
            <input
              type='date'
              id='input'
              value={validTo}
              onChange={(e) => {
                setValidTo(e.target.value);
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter Work Order Number'
              min='1'
            />
          </div>
        </div>
        <button
          type='submit'
          className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default WorkOrderForm;

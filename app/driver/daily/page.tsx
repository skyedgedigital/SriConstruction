'use client';

import dailyUtilisationAction from '@/lib/actions/dailyUtilisation/dailyUtilisationAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import workOrderAction from '@/lib/actions/workOrder/workOrderAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Page = () => {
  const [vehicles, setVehicles] = useState([]);
  const [date, setDate] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [location, setLocation] = useState('');
  const [jobStart, setJobStart] = useState('');
  const [jobEnd, setJobEnd] = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [dep, setDep] = useState('');
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWo, setSelectedWo] = useState('');
  const [eng, setEng] = useState('');
  useEffect(() => {
    const fn = async () => {
      const resp = await vehicleAction.FETCH.fetchAllVehicles();
      console.warn(resp);
      if (resp.success) {
        setVehicles(JSON.parse(resp.data));
      }
    };
    const fn2 = async () => {
      const resp = await workOrderAction.FETCH.fetchAllValidWorkOrder();
      if (resp.data) {
        var resArr = JSON.parse(resp.data);
        let res = [];
        resArr.forEach((item) => {
          res.push({
            _id: item._id,
            workOrderNumber: item.workOrderNumber,
          });
        });
        setWorkOrders(resArr);
      }
    };
    fn();
    fn2();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let tmpDate = date.split('-').reverse().join('-');
    const [day, month, year] = tmpDate.split('-').map(Number);
    const obj = {
      vehicle: selectedOption,
      date: new Date(year, month - 1, day),
      location: location,
      jobStart: jobStart,
      jobEnd: jobEnd,
      permitNumber: permitNumber,
      costCenter: costCenter,
      dep: dep,
      engineer: eng,
      workOrder: selectedWo,
      month: month,
      year: year,
    };
    console.log(obj);
    const resp = await dailyUtilisationAction.CREATE.createDailyUtilisation(
      JSON.stringify(obj)
    );
    console.log(resp);
    if (resp.success) {
      toast.success('Done');
    } else {
      toast.error(resp.message);
    }
  };

  return (
    <>
      <div className='ml-16'>
        <p className='text-2xl text-center'>Daily Utilisation Form</p>

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
              Select a WorkOrder:
            </label>
            <select
              id='dropdown'
              value={selectedWo}
              onChange={(e) => setSelectedWo(e.target.value)}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            >
              <option value=''>Select...</option>
              {workOrders.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.workOrderNumber}
                </option>
              ))}
            </select>
          </div>

          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Job Start:
            </label>
            <input
              type='text'
              id='input'
              value={jobStart}
              onChange={(e) => {
                setJobStart(e.target.value);
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter Start Here'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Job End:
            </label>
            <input
              type='text'
              id='input'
              value={jobEnd}
              onChange={(e) => {
                setJobEnd(e.target.value);
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter End Here'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Date(DD-MM-YYYY):
            </label>
            <input
              type='date'
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
              Permit Number:
            </label>
            <input
              type='text'
              id='input'
              value={permitNumber}
              onChange={(e) => {
                setPermitNumber(e.target.value);
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter Permit Number Here'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Cost Center:
            </label>
            <input
              type='text'
              id='input'
              value={costCenter}
              onChange={(e) => {
                setCostCenter(e.target.value);
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter Cost Center Here'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Department:
            </label>
            <input
              type='text'
              id='input'
              value={dep}
              onChange={(e) => {
                setDep(e.target.value);
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter Department Here'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Location:
            </label>
            <input
              type='text'
              id='input'
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter Location Here'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Engineer:
            </label>
            <input
              type='text'
              id='input'
              value={eng}
              onChange={(e) => {
                setEng(e.target.value);
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter Engineer Here'
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
      </div>
    </>
  );
};

export default Page;

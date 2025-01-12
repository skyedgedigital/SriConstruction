'use client';
import analyticsAction from '@/lib/actions/analytics/analyticsAction';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const FilterForm = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState(null);

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  const [analyticsData, setAnalyticsData] = useState({
    grossWage: 0,
    numberOfEmployees: 0,
    netPayment: 0,
    pf: 0,
    esic: 0,
    workerJoined: 0,
    workerExits: 0,
  });

  useEffect(() => {
    if (info && Array.isArray(info)) {
      setAnalyticsData({
        grossWage: 0,
        numberOfEmployees: 0,
        netPayment: 0,
        pf: 0,
        esic: 0,
        workerJoined: 0,
        workerExits: 0,
      });

      const fromDateParsed = new Date(fromDate);
      const toDateParsed = new Date(toDate);

      // Initialize variables for calculations
      let grossWage = 0;
      let netPayment = 0;
      let pf = 0;
      let esic = 0;
      let workerJoined = 0;
      let workerExits = 0;
      // Use a Set to track unique employee IDs
      const uniqueEmployees = new Set();

      const isWithinRange = (date) => {
        let refinedDate = '';
        // TEMPORARY SOLUTION
        if (date) {
          // console.log(date, new Date(refinedDate));
          const x = date.split('-');
          refinedDate = `${x[1]}-${x[0]}-${x[2]}`;
          // console.log('-------------------------------------------');
          // console.log('REFINED DATE', refinedDate, new Date(refinedDate));
        }
        const joinedDate = new Date(refinedDate);
        return joinedDate >= fromDateParsed && joinedDate <= toDateParsed;
      };

      // Iterate through the info array
      info.forEach((item) => {
        if (item.employee?._id) {
          uniqueEmployees.add(item.employee._id);
        }

        // Perform calculations based on the fields in the object
        grossWage += item.total || 0;
        netPayment += item.netAmountPaid || 0;
        pf += item.total * 0.12 || 0;
        esic += item.total * 0.0075 || 0;
      });

      if (uniqueEmployees.size > 0) {
        // Increment workers joined or exited if applicable
        uniqueEmployees.forEach((item) => {
          info.find(
            (item2) =>
              item2.employee?._id === item &&
              item2.employee?.appointmentDate &&
              isWithinRange(item2.employee.appointmentDate)
          )
            ? (workerJoined += 1)
            : (workerJoined += 0);

          info.find(
            (item2) =>
              item2.employee?._id === item &&
              item2.employee?.resignDate &&
              isWithinRange(item2.employee.resignDate)
          )
            ? (workerExits += 1)
            : (workerExits += 0);
        });
      }

      // Update the analyticsData state with computed values
      setAnalyticsData({
        grossWage,
        numberOfEmployees: uniqueEmployees.size,
        netPayment,
        pf,
        esic,
        workerJoined,
        workerExits,
      });
    }
    console.log('Infor', info);
  }, [info]);

  useEffect(() => {
    console.log('Analytics Data:', analyticsData);
  }, [analyticsData]);

  useEffect(() => {
    const fetch = async () => {
      const workOrderResp = await WorkOrderHrAction.FETCH.fetchAllWorkOrderHr();
      const success = workOrderResp.success;

      if (success) {
        const workOrderNumbers = JSON.parse(workOrderResp.data);
        setWorkOrders(workOrderNumbers);
        console.log('yeraaaa wowowowwoncjd', workOrderNumbers);
        toast.success('Work order numbers fetched successfully!');
      } else {
        toast.error('Can not fetch work order numbers!');
      }
    };
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const allWages = await analyticsAction.FETCH.fetchHRAnalytics(
      fromDate,
      toDate
    );
    if (allWages.success) {
      const parsedData = JSON.parse(allWages.data);
      toast.success('wages fetched successfully!');
      if (selectedWorkOrder === 'all') {
        setInfo(parsedData);
        setShowInfo(true);
        setIsLoading(false);
      } else {
        const filteredData = parsedData.filter(
          (item) => item.workOrderHr === selectedWorkOrder
        );
        setInfo(filteredData);
        setShowInfo(true);
        setIsLoading(false);
      }
    } else {
      setShowInfo(false);
      toast.error('Can not fetch Wages!');
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const handleWorkOrderChange = (e) => {
    setSelectedWorkOrder(e.target.value);
    console.log('selected work order', selectedWorkOrder);
    console.log(fromDate, toDate);
  };

  return (
    <>
      <div className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
        <form onSubmit={handleSubmit} className='p-10'>
          <div className='flex flex-row gap-4 mb-4'>
            <div className='flex-1'>
              <label
                className='block text-gray-700 text-sm font-bold mb-2'
                htmlFor='fromDate'
              >
                From Date:
              </label>
              <input
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='fromDate'
                type='date'
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className='flex-1'>
              <label
                className='block text-gray-700 text-sm font-bold mb-2'
                htmlFor='toDate'
              >
                To Date:
              </label>
              <input
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='toDate'
                type='date'
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className='flex-1'>
              <label
                className='block text-gray-700 text-sm font-bold mb-2'
                htmlFor='workOrder'
              >
                Work Orders:
              </label>
              <select
                className='block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline'
                id='workOrder'
                value={selectedWorkOrder}
                onChange={handleWorkOrderChange}
              >
                <option value=''>Select Work Order</option>
                <option value='all'>All Work Orders</option>
                {workOrders.map((workOrder) => (
                  <option key={workOrder._id} value={workOrder._id}>
                    {workOrder.workOrderNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='flex items-center justify-center'>
            <button
              className={`
              inline-flex items-center px-4 py-2 border border-transparent
              shadow-sm text-sm font-medium rounded-md text-white
              ${
                !(fromDate && toDate && selectedWorkOrder)
                  ? 'bg-indigo-400'
                  : 'bg-indigo-600'
              } 
              focus:outline-none
              focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              transition duration-300 ease-in-out
              transform hover:scale-105
            `}
              type='submit'
              disabled={!(fromDate && toDate && selectedWorkOrder)}
            >
              {isLoading && (
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
              )}
              View Analytics
            </button>
          </div>
        </form>
      </div>
      <div>
        {isLoading ? (
          <div className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse'>
            <div className='p-8 bg-gray-200 shadow-xl rounded-xl border border-gray-300 h-44'></div>
            <div className='p-8 bg-gray-200 shadow-xl rounded-xl border border-gray-300 h-44'></div>
            <div className='p-8 bg-gray-200 shadow-xl rounded-xl border border-gray-300 h-44'></div>
            <div className='p-8 bg-gray-200 shadow-xl rounded-xl border border-gray-300 h-44'></div>
            <div className='p-8 bg-gray-200 shadow-xl rounded-xl border border-gray-300 h-44'></div>
            <div className='p-8 bg-gray-200 shadow-xl rounded-xl border border-gray-300 h-44'></div>
            <div className='p-8 bg-gray-200 shadow-xl rounded-xl border border-gray-300 h-44'></div>
          </div>
        ) : showInfo ? (
          <div className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='p-8 bg-white shadow-xl rounded-xl border border-gray-300 hover:scale-105 transition duration-300 cursor-pointer'>
              <p className='text-3xl font-extrabold text-gray-800'>
                {formatter.format(analyticsData.grossWage)}
              </p>
              <p className='text-lg font-light text-gray-500'>Gross Wages</p>
            </div>
            <div className='p-8 bg-white shadow-xl rounded-xl border border-gray-300 hover:scale-105 transition duration-300 cursor-pointer'>
              <p className='text-3xl font-extrabold text-gray-800'>
                {formatter.format(analyticsData.netPayment)}
              </p>
              <p className='text-lg font-light text-gray-500'>Net Payment</p>
            </div>
            <div className='p-8 bg-white shadow-xl rounded-xl border border-gray-300 hover:scale-105 transition duration-300 cursor-pointer'>
              <p className='text-3xl font-extrabold text-gray-800'>
                {formatter.format(analyticsData.pf)}
              </p>
              <p className='text-lg font-light text-gray-500'>PF</p>
            </div>
            <div className='p-8 bg-white shadow-xl rounded-xl border border-gray-300 hover:scale-105 transition duration-300 cursor-pointer'>
              <p className='text-3xl font-extrabold text-gray-800'>
                {formatter.format(analyticsData.esic)}
              </p>
              <p className='text-lg font-light text-gray-500'>ESIC</p>
            </div>
            <div className='p-8 bg-white shadow-xl rounded-xl border border-gray-300 hover:scale-105 transition duration-300 cursor-pointer'>
              <p className='text-3xl font-extrabold text-gray-800'>
                {analyticsData.numberOfEmployees}
              </p>
              <p className='text-lg font-light text-gray-500'>
                Number of Employees
              </p>
            </div>
            <div className='p-8 bg-white shadow-xl rounded-xl border border-gray-300 hover:scale-105 transition duration-300 cursor-pointer'>
              <p className='text-3xl font-extrabold text-gray-800'>
                {analyticsData.workerJoined}
              </p>
              <p className='text-lg font-light text-gray-500'>Worker Joined</p>
            </div>
            <div className='p-8 bg-white shadow-xl rounded-xl border border-gray-300 hover:scale-105 transition duration-300 cursor-pointer'>
              <p className='text-3xl font-extrabold text-gray-800'>
                {analyticsData.workerExits}
              </p>
              <p className='text-lg font-light text-gray-500'>Worker Exits</p>
            </div>
          </div>
        ) : (
          <div className='mt-8 flex items-center justify-center'>
            <h1 className='text-3xl font-extrabold text-center text-gray-300'>
              Please select date and work order
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default FilterForm;

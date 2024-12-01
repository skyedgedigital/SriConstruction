'use client';
import AnalyticsComponent from '@/components/admin/AnalyticsComponent';
import AdminAnalytics from '@/lib/actions/adminAnalytics/adminAnalyticsAction';
import chalanAction from '@/lib/actions/chalan/chalanAction';
import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import wagesAction from '@/lib/actions/HR/wages/wagesAction';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import React, { useState, useEffect, CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { MdArrowForward } from 'react-icons/md';
import HashLoader from 'react-spinners/HashLoader';
const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red',
};

const Admin = () => {
  const [data, setData] = useState({
    vehicleHours: 0,
    vehicleQuantity: 0,
    drivers: 0,
    fleetManagers: 0,
    hrs: 0,
    safetyManagers: 0,
    ppeSpend: 0,
    toolSpend: 0,
    chemicalSpend: 0,
    hrEmps: 0,
    gatePassValidCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hrCount, setHrCount] = useState(0);

  useEffect(() => {
    const fn = async () => {
      const resp = await WorkOrderHrAction.FETCH.fetchTotalNumberOfWorkOrder();
      setHrCount(resp.data);
    };
    fn();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          vehicleHoursData,
          vehicleQuantityData,
          driversData,
          fleetManagersData,
          hrsData,
          safetyManagersData,
          chemicalSpendData,
          ppeSpendData,
          toolSpendData,
          hrEmpsData,
          gatePassValidCountData,
        ] = await Promise.all([
          AdminAnalytics.fetchVehicleHoursAnalytics(),
          AdminAnalytics.fetchNumberOfVehicles(),
          AdminAnalytics.fetchCount.fetchDriver(),
          AdminAnalytics.fetchCount.fetchFleetManager(),
          AdminAnalytics.fetchCount.fetchHr(),
          AdminAnalytics.fetchCount.fetchSafety(),
          AdminAnalytics.fetchSafetySpend.chemicalPurchaseSpend(),
          AdminAnalytics.fetchSafetySpend.ppePurchaseSpend(),
          AdminAnalytics.fetchSafetySpend.toolPurchaseSpend(),
          AdminAnalytics.fetchCount.fetchHrEmps(),
          EmployeeDataAction.FETCH.fetchNotification(),
        ]);

        // Check if all requests were successful and update state accordingly
        setData({
          vehicleHours: vehicleHoursData.success ? vehicleHoursData.data : 0,
          vehicleQuantity: vehicleQuantityData.success
            ? vehicleQuantityData.data
            : 0,
          drivers: driversData.success ? driversData.data : 0,
          fleetManagers: fleetManagersData.success ? fleetManagersData.data : 0,
          hrs: hrsData.success ? hrsData.data : 0,
          safetyManagers: safetyManagersData.success
            ? safetyManagersData.data
            : 0,
          chemicalSpend: chemicalSpendData.success ? chemicalSpendData.data : 0,
          ppeSpend: ppeSpendData.success ? ppeSpendData.data : 0,
          toolSpend: toolSpendData.success ? toolSpendData.data : 0,
          hrEmps: hrEmpsData.success ? hrEmpsData.data : 0,
          gatePassValidCount: gatePassValidCountData.success
            ? JSON.parse(gatePassValidCountData.data).totalCount
            : 0,
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  if (loading)
    return (
      <>
        <div className='flex justify-center items-center h-screen w-full'>
          <HashLoader
            color='#000000'
            cssOverride={override}
            aria-label='Loading...'
          />
        </div>
      </>
    );

  if (error)
    return (
      <div>
        <div className='flex justify-center items-center h-screen w-full'>
          <h2>Looks Like An Error Occurred</h2>
        </div>
      </div>
    );

  const checkApi = async () => {
    const obj = {
      year: '2023',
      workOrder: '66de7bbab0ed51e7d6914673',
    };
    const resp = await wagesAction.FETCH.fetchWagesForCalendarYear(
      JSON.stringify(obj)
    );

    if (resp.success) {
      toast.success('Done');
      console.log(JSON.parse(resp.data));
    } else {
      toast.error('Error');
    }
  };

  return (
    <>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Admin Dashboard
      </h1>{' '}
      <br />
      <div className='flex flex-wrap items-center justify-center '>
        <span
          onClick={() => {
            window.open('/admin/data_table');
          }}
        >
          <AnalyticsComponent
            data={data.vehicleHours}
            color={'green'}
            tag={'Total Vehicle Hours'}
          />
        </span>
        <span
          onClick={() => {
            window.open('/admin/total_vehicles');
          }}
        >
          <AnalyticsComponent
            data={data.vehicleQuantity}
            color={'blue'}
            tag={'Total Vehicles'}
          />
        </span>
        <AnalyticsComponent
          data={data.drivers}
          color={'red'}
          tag={'Total Drivers'}
        />
        <AnalyticsComponent
          data={data.fleetManagers}
          color={'violet'}
          tag={'Total Fleet Managers'}
        />
        <AnalyticsComponent
          data={data.hrs}
          color={'purple'}
          tag={"Total HR's"}
        />
        <AnalyticsComponent
          data={data.safetyManagers}
          color={'orange'}
          tag={'Total Safety Managers'}
        />
      </div>
      <div className='ml-16 mt-6 border-t-2 border-black-700 flex flex-col'>
        <h2 className='text-center text-3xl mt-3'>
          Purchase Spend Analysis{' '}
          <span className='text-sm text-gray-700'>(for this month)</span>
        </h2>
        <div className='flex flex-wrap items-center justify-center ml-16'>
          <span
            onClick={() => {
              window.open('/admin/purchaseList?_type=Chemical');
            }}
          >
            <AnalyticsComponent
              data={data.chemicalSpend}
              color={'orange'}
              tag={'Total Chemical Cost'}
            />
          </span>
          <span
            onClick={() => {
              window.open('/admin/purchaseList?_type=PPE');
            }}
          >
            <AnalyticsComponent
              data={data.ppeSpend}
              color={'violet'}
              tag={'Total PPE Purchases Cost'}
            />
          </span>
          <span onClick={() => window.open('/admin/purchaseList?_type=Tool')}>
            <AnalyticsComponent
              data={data.toolSpend}
              color={'blue'}
              tag={'Total Tool Purchases Cost'}
            />
          </span>
        </div>
      </div>
      <div className='ml-16 mt-6 border-t-2 border-black-700 flex flex-col'>
        <h2 className='text-center text-3xl mt-3'>Employee</h2>
        <div className='flex flex-wrap items-center justify-center ml-16'>
          <span onClick={() => window.open('/admin/empDateRange')}>
            <AnalyticsComponent
              data={data.hrEmps}
              color={'red'}
              tag={'Total Emps Under HR'}
            />
          </span>
          <span onClick={() => window.open('/admin/gatePassValidityExpiring')}>
            <AnalyticsComponent
              data={data.gatePassValidCount}
              color={'blue'}
              tag={'GatePass Validity Expiring(60 days)'}
            />
          </span>
          <span onClick={() => window.open('/admin/empWorkOrder')}>
            <AnalyticsComponent
              data={hrCount}
              color={'blue'}
              tag={' WorkOrder'}
            />
          </span>
        </div>
        <div
          className='h-40 w-1/2 mt-4 bg-green-200 shadow-xl mb-4 rounded-lg overflow-hidden relative group cursor-pointer mx-auto'
          onClick={() => window.open('/admin/hrAnalytics')}
        >
          <h1 className='duration-100 text-2xl font-medium text-black/50 h-full w-full flex justify-center items-center'>
            👆 View Complete HR Analytics
            <span className='ml-2 opacity-0 transition duration-300 group-hover:opacity-100 group-hover:translate-x-2'>
              <MdArrowForward />
            </span>
          </h1>
        </div>
      </div>
    </>
  );
};

export default Admin;

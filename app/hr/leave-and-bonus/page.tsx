'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import BonusForm from './bonusForm';
import LeaveForm from './leaveForm';
import FormKForm from './formKform';

const Page = () => {
  const [allWorkOrderNumbers, setAllWorkOrderNumbers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const workOrderResp =
        await WorkOrderHrAction.FETCH.fetchAllValidWorkOrderHr();
      const success = workOrderResp.success;

      if (success) {
        const workOrderNumbers = JSON.parse(workOrderResp.data);
        setAllWorkOrderNumbers(workOrderNumbers);
      } else {
        toast.error('Can not fetch work order numbers!');
      }
    };
    fetch();
  }, []);

  return (
    <section>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Leave & Bonus
      </h1>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <BonusForm allWorkOrderNumbers={allWorkOrderNumbers} />
        <LeaveForm allWorkOrderNumbers={allWorkOrderNumbers} />
        <FormKForm allWorkOrderNumbers={allWorkOrderNumbers} />
      </div>
    </section>
  );
};

export default Page;

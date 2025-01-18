'use client';

import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import DamageRegister from './DamageForm';
import AdvanceRegister from './AdvanceForm';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';

const Page = () => {
  const [selectedTab, setSelectedTab] = useState('damage'); // New state for tabs

  return (
    <div>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Advance and Damage Register
      </h1>

      {/* Tab Navigation */}
      <div className='flex justify-center space-x-4 mb-6'>
        <button
          className={`py-2 px-4 rounded-2xl transition-colors ${
            selectedTab === 'damage'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-slate-300'
          }`}
          onClick={() => setSelectedTab('damage')}
        >
          Damage Register
        </button>
        <button
          className={`py-2 px-4 rounded-2xl transition-colors ${
            selectedTab === 'advance'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-slate-300'
          }`}
          onClick={() => setSelectedTab('advance')}
        >
          Advance Register
        </button>
      </div>

      {/* Placeholder content for other tabs */}
      {selectedTab === 'damage' && <DamageRegister />}
      {selectedTab === 'advance' && <AdvanceRegister />}
    </div>
  );
};

export default Page;

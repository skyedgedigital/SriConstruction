'use client';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateConsumable from '@/components/fleet-manager/consumables/create';
import ViewConsumables from '@/components/fleet-manager/consumables/fetch';

const Page = () => {
  const [activeTab, setActiveTab] = useState('create');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div>
        <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
          Consumables
        </h1>
        <ul className='flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400'>
          <li className='me-2'>
            <button
              onClick={() => handleTabClick('create')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'create'
                  ? 'text-green-600 bg-gray-100'
                  : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
              }`}
            >
              Create Consumable
            </button>
          </li>
          <li className='me-2'>
            <button
              onClick={() => handleTabClick('view')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'view'
                  ? 'text-blue-600 bg-gray-100'
                  : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
              }`}
            >
              View All
            </button>
          </li>
        </ul>

        <div className='tab-content'>
          {activeTab === 'create' && <CreateConsumable />}
          {activeTab === 'view' && <ViewConsumables />}
          {activeTab === 'settings' && <SettingsComponent />}
          {activeTab === 'contacts' && <ContactsComponent />}
        </div>
      </div>
    </>
  );
};

function ProfileComponent() {
  return <div>Profile Content</div>;
}

// Sample component for Dashboard
function DashboardComponent() {
  return <div>Dashboard Content</div>;
}

// Sample component for Settings
function SettingsComponent() {
  return <div>Settings Content</div>;
}

// Sample component for Contacts
function ContactsComponent() {
  return <div>Contacts Content</div>;
}

export default Page;

"use client"
import Add from '@/components/fleet-manager/StoreManagement/Add';
import Storage from '@/components/fleet-manager/StoreManagement/Storage';
import Update from '@/components/fleet-manager/StoreManagement/Update';
import CreateTool from '@/components/fleet-manager/StoreManagement/create';
import ViewTool from '@/components/fleet-manager/StoreManagement/fetch';
import Create from '@/components/fleet-manager/fuelManagement/create';
import React, { useState } from 'react'

const Page = () => {
    const [activeTab, setActiveTab] = useState("create");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  return (
    <>
    
    <div className="ml-16 " >
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
          <li className="me-2">
            <button
              onClick={() => handleTabClick("create")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "create"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Tool Allotement
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => handleTabClick("view")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "view"
                  ? "text-blue-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              View Tools
            </button>
          </li>

          <li className="me-2">
            <button
              onClick={() => handleTabClick("storage")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "storage"
                  ? "text-blue-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Tool Storage
            </button>
          </li>

          <li className="me-2">
            <button
              onClick={() => handleTabClick("add")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "add"
                  ? "text-blue-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Add Tool
            </button>
          </li>

          <li className="me-2">
            <button
              onClick={() => handleTabClick("update")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "update"
                  ? "text-blue-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Update Tool
            </button>
          </li>
          
        </ul>
        <div className='tab-content' >
        {activeTab === "create" && <CreateTool/> }
          {activeTab === "view" && <ViewTool/> }
          {activeTab === "storage" && <Storage/> }
          {activeTab === "add" && <Add/> }
          {activeTab === "update" && <Update/> }

        </div>
      </div>
    
    </>
  )
}

export default Page

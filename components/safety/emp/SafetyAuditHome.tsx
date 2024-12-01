import React, { useState } from 'react'
import MonthlyTask from './monthlyTask';
import AddMonthlyTask from './addMonthlyTask';
import EditMonthlyTask from './editMonthlyTask';
import HouseKeepingAudit from './houseKeepingAudit';
import ViewHouseKeepingAudit from './viewHouseKeepingAudit';

const SafetyAuditHome = () => {
    const [activeTab, setActiveTab] = useState("house");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  return (
    <>
        <div className="mt-2" >
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
          {/* <li className="me-2">
            <button
              onClick={() => handleTabClick("view")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "view"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Sites Security
            </button>
          </li> */}
          <li className="me-2">
            <button
              onClick={() => handleTabClick("house")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "house"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              HouseKeeping
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => handleTabClick("viewhk")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "viewhk"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              View HouseKeeping Audits
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === "house" &&  <HouseKeepingAudit/> }
          {activeTab === "add" &&  <AddMonthlyTask/> }
          {activeTab === "viewhk" &&  <ViewHouseKeepingAudit/> }
          {/* {activeTab === "edit" &&  <EditMonthlyTask/> } */}
        </div>
      </div>
    </>
  )
}

export default SafetyAuditHome

import React, { useState } from 'react'
import MonthlyTask from './monthlyTask';
import AddMonthlyTask from './addMonthlyTask';
import EditMonthlyTask from './editMonthlyTask';

const MonthlyTaskHome = () => {
    const [activeTab, setActiveTab] = useState("view");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  return (
    <>
        <div className="mt-2" >
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
          <li className="me-2">
            <button
              onClick={() => handleTabClick("view")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "view"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              View Monthly Task
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => handleTabClick("add")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "add"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Add Monthly Task
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === "view" &&  <MonthlyTask/> }
          {activeTab === "add" &&  <AddMonthlyTask/> }
          {/* {activeTab === "edit" &&  <EditMonthlyTask/> } */}
        </div>
      </div>
    </>
  )
}

export default MonthlyTaskHome

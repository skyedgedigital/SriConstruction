"use client"

import MonthlyTask from '@/components/safety/emp/monthlyTask';
import MonthlyTaskHome from '@/components/safety/emp/monthlyTaskHome';
import SafetyAuditHome from '@/components/safety/emp/SafetyAuditHome';
import SiteSecurityAuditHome from '@/components/safety/emp/SiteSecurityAuditHome';
import ToolBoxTalkHome from '@/components/safety/emp/toolBoxTalkHome';
import React, { useState } from 'react'

const Page = () => {
  const [activeTab, setActiveTab] = useState("monthly");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

    return (
        <>
            <div className="ml-16" >
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
          <li className="me-2">
            <button
              onClick={() => handleTabClick("monthly")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "monthly"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Monthly Task
            </button>
          </li>


          <li className="me-2">
            <button
              onClick={() => handleTabClick("toolbox")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "toolbox"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Tool Box 
            </button>
          </li>

          <li className="me-2">
            <button
              onClick={() => handleTabClick("weekly")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "weekly"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Weekly Safety Audit 
            </button>
          </li>

          <li className="me-2">
            <button
              onClick={() => handleTabClick("site")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "site"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Site Security Audit 
            </button>
          </li>
          
          
        </ul>

        <div className="tab-content">
          {activeTab === "monthly" &&  <MonthlyTaskHome/> }
          {activeTab === "toolbox" &&  <ToolBoxTalkHome/> }
          {activeTab === "weekly" &&  <SafetyAuditHome/> }
          {activeTab === "site" &&  <SiteSecurityAuditHome/> }
        </div>
      </div>
        </>
    )
}

export default Page

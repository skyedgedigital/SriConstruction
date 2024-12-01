"use client"
import ViewTool from '@/components/fleet-manager/StoreManagement/fetch';
import AddTool from '@/components/safety/tools/addTool';
import IssueTool from '@/components/safety/tools/issueTool';
import PurchaseTool from '@/components/safety/tools/purchaseTool';
import SafetyToolIssueAndReplacementHome from '@/components/safety/tools/SafetyToolIssueAndReplacementHome';
import ServiceTool from '@/components/safety/tools/serviceTool';
import ToolAuditHome from '@/components/safety/tools/toolAuditHome';
import ToolCheckList from '@/components/safety/tools/toolCheckList';
import ToolCheckListHome from '@/components/safety/tools/toolCheckListHome';
import ToolMaintanenceHome from '@/components/safety/tools/toolMaintanenceHome';
import ViewSafetyTools from '@/components/safety/tools/viewTool';
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
              Create Tool
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
              onClick={() => handleTabClick("issue")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "issue"
                  ? "text-blue-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Issue Register
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => handleTabClick("purchase")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "purchase"
                  ? "text-blue-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Purchase Register
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => handleTabClick("service")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "service"
                  ? "text-blue-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Maintanence
            </button>
          </li>

          <li className="me-2">
            <button
              onClick={() => handleTabClick("check")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "check"
                  ? "text-blue-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              CheckList
            </button>
          </li>

          <li className="me-2">
            <button
              onClick={() => handleTabClick("audit")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "audit"
                  ? "text-blue-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Audit
            </button>
          </li>

          <li className="me-2">
            <button
              onClick={() => handleTabClick("main")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "main"
                  ? "text-blue-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Maintanence Reg
            </button>
          </li>
          
        </ul>

        <div className="tab-content">
          {activeTab === "create" &&  <AddTool/> }
          {activeTab === "view" && <ViewSafetyTools/> }
          {activeTab === "issue" && <SafetyToolIssueAndReplacementHome/> }
          {activeTab === "purchase" && <PurchaseTool/> }
          {activeTab === "service" && <ServiceTool/> }
          {activeTab === "check" && <ToolCheckListHome/> }
          {activeTab === "audit" && <ToolAuditHome/> }
          {activeTab === "main" && <ToolMaintanenceHome/>}



        </div>
      </div>
        </>
    )
}

export default Page

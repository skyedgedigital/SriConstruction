"use client"
import AddPpe from '@/components/safety/ppe/addPpe';
import AuditHome from '@/components/safety/ppe/auditHome';
import PpeAudit from '@/components/safety/ppe/auditPpe';
import CheckList from '@/components/safety/ppe/checkList';
import CheckListHome from '@/components/safety/ppe/checkListHome';
import IssuePpe from '@/components/safety/ppe/issuePpe';
import IssueRegisterHome from '@/components/safety/ppe/IssueRegisterHome';
import PpeIssueAndReplacement from '@/components/safety/ppe/PpeIssueAndReplacement';
import PurchasePpe from '@/components/safety/ppe/purchasePpe';
import ViewPpe from '@/components/safety/ppe/viewPpe';
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
      Create Ppe
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
      View Ppe
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
      onClick={() => handleTabClick("checkList")}
      className={`inline-block p-4 rounded-t-lg ${
        activeTab === "checkList"
          ? "text-blue-600 bg-gray-100"
          : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      }`}
    >
      Check List
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
  
</ul>

<div className="tab-content">
  {activeTab === "create" &&  <AddPpe/> }
  {activeTab === "view" && <ViewPpe/> }
  {/* {activeTab === "issue" && <IssuePpe/> } */}
  {activeTab === "purchase" && <PurchasePpe/> }
  {activeTab === "checkList" && <CheckListHome/> }
  {activeTab === "audit" && <AuditHome/> }
  {activeTab === "issue" && <IssueRegisterHome/> }

</div>
</div>
</>
  )
}

export default Page

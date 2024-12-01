'use client'

import AddChemicals from "@/components/safety/chemicals/addChemical";
import ChemicalIssueAndReplacement from "@/components/safety/chemicals/ChemicalIssueAndReplacement";
import ChemicalIssueAndReplacementHome from "@/components/safety/chemicals/ChemicalIssueAndReplacementHome";
import IssueChemical from "@/components/safety/chemicals/issueChemical";
import PurchaseChemical from "@/components/safety/chemicals/purchaseChemical";
import ViewChemicals from "@/components/safety/chemicals/viewChemicals";
import { useState } from "react";

const Safety = () => {

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
              Create Chemical
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
              View Chemicals
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
          
        </ul>

        <div className="tab-content">
          {activeTab === "create" &&  <AddChemicals/> }
          {activeTab === "view" && <ViewChemicals/> }
          {/* {activeTab === "issue" && <IssueChemical/> } */}
          {activeTab === "purchase" && <PurchaseChemical/> }
          {activeTab == "issue" && <ChemicalIssueAndReplacementHome/> }

        </div>
      </div>
        </>
    )
}
export default Safety
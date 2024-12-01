import { useState } from "react";
import ToolCheckList from "./toolCheckList";
import ViewCheckList from "./viewCheckList";
import ToolAudit from "./toolAudit";
import ViewToolAudit from "./viewToolAudit";

const ToolAuditHome = () => {
    const [activeTab, setActiveTab] = useState("gen");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  return (
    <>
        <div className="mt-2" >
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
          <li className="me-2">
            <button
              onClick={() => handleTabClick("gen")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "gen"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Generate
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => handleTabClick("view")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "view"
                  ? "text-green-600 bg-gray-100"
                  : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              View
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === "gen" &&  <ToolAudit/> }
          {activeTab === "view" && <ViewToolAudit/> }
          {/* {activeTab === "edit" &&  <EditMonthlyTask/> } */}
        </div>
      </div>
    </>
  )
}

export default ToolAuditHome
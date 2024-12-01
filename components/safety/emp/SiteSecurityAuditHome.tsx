import React, { useState } from 'react'
import SafetyIndAndTraining from './SafetyIndAndTraining';
import ViewSafetyIndAndTraining from './viewSafetyIndAndTraining';
import CorrectiveAndPreventive from './correctiveAndPreventive';
import ViewCorrectiveAndPreventive from './viewCorrectiveAndPreventive';
import SiteSecurityUploads from './SiteSecurityUploads';

const SiteSecurityAuditHome = () => {
    const [activeTab, setActiveTab] = useState("add");

    const handleTabClick = (tab) => {
      setActiveTab(tab);
    };
    return (
      <>
          <div className="mt-2" >
          <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
            <li className="me-2">
              <button
                onClick={() => handleTabClick("add")}
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === "add"
                    ? "text-green-600 bg-gray-100"
                    : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                }`}
              >
                Safety Induction & Training
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
                View Safety Induction & Training
              </button>
            </li>

            <li className="me-2">
              <button
                onClick={() => handleTabClick("cp")}
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === "cp"
                    ? "text-green-600 bg-gray-100"
                    : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                }`}
              >
                Corrective & Preventive
              </button>
            </li>

            <li className="me-2">
              <button
                onClick={() => handleTabClick("viewcp")}
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === "viewcp"
                    ? "text-green-600 bg-gray-100"
                    : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                }`}
              >
                View Corrective & Preventive
              </button>
            </li>

            <li className="me-2">
              <button
                onClick={() => handleTabClick("uploads")}
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === "uploads"
                    ? "text-green-600 bg-gray-100"
                    : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                }`}
              >
                Uploads
              </button>
            </li>
            
          </ul>
  
          <div className="tab-content">
            {activeTab === "add" &&  <SafetyIndAndTraining/> }
            {activeTab === "view" && <ViewSafetyIndAndTraining/> }
            {activeTab === "cp" && <CorrectiveAndPreventive/> }
            {activeTab === "viewcp" && <ViewCorrectiveAndPreventive/> }
            {activeTab === "uploads" && <SiteSecurityUploads/> }
          </div>
        </div>
      </>
    )
}

export default SiteSecurityAuditHome

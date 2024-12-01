"use client";
import Create from "@/components/hr/create";
import View from "@/components/hr/view";
import departmentHrAction from "@/lib/actions/HR/DepartmentHr/departmentHrAction";
import designationAction from "@/lib/actions/HR/Designation/designationAction";
import EmployeeDataAction from "@/lib/actions/HR/EmployeeData/employeeDataAction";
import EsiLocationAction from "@/lib/actions/HR/EsiLocation/EsiLocationAction";
import siteMasterAction from "@/lib/actions/HR/siteMaster/siteMasterAction";
import employeeDataDummy from "@/utils/dummy_data/EmployeeData";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
const Page = ({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) => {
  const [excelData, setExcelData] = useState<any>([]);
  const [activeTab, setActiveTab] = useState("create");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryString = event.target.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const requiredElements = {
        EmpCode:'code',}
      // Assuming the first row contains column headers
      const headers: any = data[0];
      // const parsedData = data.slice(1).map((row) => {
      //   const rowData = {};
      //   // const requiredElements = ['Empname','PfStat','PfNum','EsiNum']
      //   headers.forEach((header, index) => {
      //     console.log(header)
      //     if(requiredElements.includes(header)){
      //       // rowData[header] = row[index];
      //       if(header === 'Empname'){
      //         rowData['name'] = row[index]
      //       }
      //       else if(header === 'PfStat'){
      //         rowData['pfStatus'] = row[index]
      //       }
      //       else if(header === 'PfNum'){
      //         rowData['pfNumber'] = row[index]
      //       }
      //       else if(header === 'EsiNum'){
      //         rowData['EsiNo'] = row[index]
      //       }
      //     }
      //   });
      //   return rowData;
      // });
      let loop = 0
      const parsedData = data.slice(1,6).map((row) => {
        const rowData = {};
        headers.forEach((header, index) => {
          if (requiredElements.hasOwnProperty(header)) {
            rowData[requiredElements[header]] = row[index];
          }
        }
      );
        return rowData;
      });

      setExcelData(parsedData);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <>
      <div className="ml-16">
        Employee Data
        <div className="p-2 m-2">
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
              Employee Data Entry
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
              View Entries
            </button>
          </li>
          
        </ul>
        <div className='tab-content' >
        {activeTab === "create" && <>
              <Create/>
        </> }
          {activeTab === "view" && <>
              <View searchParams={searchParams}/>
          </> }
        </div>
        </div>
        {/* <div className="flex flex-wrap">
          <div className="bg-blue-500 m-2">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Enim,
            eveniet!
          </div>
          <div className="bg-green-500 m-2">Lorem ipsum dolor sit amet.</div>
        </div> */}
        {/* <button
          onClick={async () => {
            const dummyData = employeeDataDummy;
            const resp = await EmployeeDataAction.CREATE.createEmployeeData(
              JSON.stringify(dummyData)
            );
            if (resp.status === 200) {
              toast.success("Added");
            } else {
              toast.error("Error");
            }
          }}
        >
          Add Info
        </button> */}
      </div>

      {/* <div className="ml-16">
        <input type="file" onChange={handleFileChange} />
        {excelData.length > 0 && (
          <div>
            <h2>Excel Data</h2>
            <ul>
              {excelData.map((rowData, index) => (
                <li key={index}>
                  <pre>{JSON.stringify(rowData, null, 2)}</pre>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button className="ml-16" onClick={async()=>{
        const resp = await EmployeeDataAction.CREATE.createEmployeeDataBulk(JSON.stringify(excelData))
        if(resp.status === 200){
          toast.success("Added")
        }
        else{
          toast.error("An Error Occurred")
        }
      }} >
        Add Bulk
      </button> */}
    </>
  );
};

export default Page;

"use client";
import wagesAction from "@/lib/actions/HR/wages/wagesAction";
import WorkOrderHrAction from "@/lib/actions/HR/workOrderHr/workOrderAction";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const [result, setResult] = useState([]);
  const [workOrderList, setWorkOrderList] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null); // Store selected work order ID
  const [selectedYear, setSelectedYear] = useState(null); // Store selected year

  useEffect(() => {
    const fn = async () => {
      const resp = await WorkOrderHrAction.FETCH.fetchAllWorkOrderHr();
      setWorkOrderList(JSON.parse(resp.data));
    };
    fn();
  }, []);

  const handleWorkOrderChange = (event) => {
    setSelectedWorkOrder(event.target.value); // Set the selected work order ID
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value); // Set the selected year
  };

  const fn = async () => {
    const obj = {
      year: selectedYear,
      workOrder: selectedWorkOrder,
    };
    console.log(selectedWorkOrder);
    console.log(obj);
    const resp = await wagesAction.FETCH.fetchWagesForCalendarYear(
      JSON.stringify(obj)
    );

    if (resp.success) {
      toast.success("Data Fetched");
      console.log(JSON.parse(resp.data));
      setResult(JSON.parse(resp.data));
    } else {
      toast.error("Error");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Work Order and Year Selection</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Work Order Dropdown */}
        <div className="flex flex-col w-full">
          <label htmlFor="workOrder" className="font-semibold mb-1">
            Select Work Order:
          </label>
          <select
            id="workOrder"
            value={selectedWorkOrder || ""}
            onChange={handleWorkOrderChange}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="" disabled>
              Select a work order
            </option>
            {workOrderList.map((workOrder) => (
              <option key={workOrder.id} value={workOrder._id}>
                {workOrder.workOrderNumber}{" "}
                {/* Assuming each work order has a `name` field */}
              </option>
            ))}
          </select>
        </div>

        {/* Year Dropdown */}
        <div className="flex flex-col w-full">
          <label htmlFor="year" className="font-semibold mb-1">
            Select Year:
          </label>
          <select
            id="year"
            value={selectedYear || ""}
            onChange={handleYearChange}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="" disabled>
              Select a year
            </option>
            {Array.from({ length: 7 }, (_, i) => 2020 + i).map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        className="text-white bg-blue-500 p-2 rounded-sm"
        onClick={() => {
          fn();
        }}
      >
        Submit
      </button>

      <>
        {result && result.length > 0 ? (
          <table className="table-auto border-collapse border border-gray-300 w-full mt-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Emp Code</th>
                <th className="border border-gray-300 px-4 py-2">
                  Employee Name
                </th>
                <th className="border border-gray-300 px-4 py-2">Basic Wage</th>
                <th className="border border-gray-300 px-4 py-2">Net Wage</th>
              </tr>
            </thead>
            <tbody>
              {result.map((ele, index) => (
                <tr key={index} className="text-gray-700">
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {ele.employee.code}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {ele.employee.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {ele.basicWages}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {ele.Net}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 mt-6">No results found.</p>
        )}
      </>
    </div>
  );
};

export default Page;

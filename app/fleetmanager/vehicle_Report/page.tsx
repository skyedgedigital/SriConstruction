'use client';

import { fn } from '@/lib/actions/chalan/calculatePrice';
import chalanAction from '@/lib/actions/chalan/chalanAction';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const handleDateChange = (dateString) => {
  const dateValue = dateString; // Date in yyyy-mm-dd format
  const [year, month, day] = dateValue.split('-'); // Split into components

  // Convert to dd-mm-yyyy format
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};

const exportToExcel = (data, totalData, startDate, endDate) => {
  // Prepend a header row with the report range
  let tmpDateStart = handleDateChange(startDate);
  let tmpDateEnd = handleDateChange(endDate);
  const reportTitle = [
    [`Vehicle Report for ${tmpDateStart} - ${tmpDateEnd}`],
    [], // Empty row to separate the title from the data
  ];

  // Map data rows
  const worksheetData = data.map((ele) => ({
    'Chalan Number': ele.chalanNumber,
    Date: `${String(new Date(ele.date).getDate()).padStart(2, '0')}-${String(
      new Date(ele.date).getMonth() + 1
    ).padStart(2, '0')}-${new Date(ele.date).getFullYear()}`,
    'Vehicle/Equipment Name': ele.item,
    'Registration Number': ele.vehicleNumber,
    Location: ele.location,
    Department: ele.department.departmentName,
    'Officer Name': ele.engineer.name,
    'Running Hours': ele.hours,
    Amount: ele.amount,
    GST: ele.gst,
    'Total Amount': ele.total,
  }));

  // Add a total row if available
  worksheetData.push({
    'Chalan Number': '',
    Date: '',
    'Vehicle/Equipment Name': '',
    'Registration Number': '',
    Location: '',
    Department: '',
    'Officer Name': '',
    'Running Hours': 'Total',
    Amount: totalData?.totalAmount || '',
    GST: totalData?.totalGst || '',
    'Total Amount': totalData?.total || '',
  });

  // Combine the title and data
  const combinedData = reportTitle.concat(
    XLSX.utils.sheet_to_json(XLSX.utils.json_to_sheet(worksheetData), {
      header: 1,
    })
  );

  // Create a new worksheet with the combined data
  const worksheet = XLSX.utils.aoa_to_sheet(combinedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Report');

  // Write to file
  XLSX.writeFile(workbook, 'vehicle_report.xlsx');
};

const Page = () => {
  const [startingDate, setStartingDate] = useState('');
  const [endingDate, setEndingDate] = useState('');
  const [result, setResult] = useState(null);
  const [totalData, setTotalData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startDateTmp = handleDateChange(startingDate);
    const endDateTmp = handleDateChange(endingDate);
    const resp = await chalanAction.FETCH.vehicleReport(
      startDateTmp,
      endDateTmp
    );

    if (resp.success) {
      console.log(JSON.parse(resp.data));
      setResult(JSON.parse(resp.data).vehicleReport);
      setTotalData(JSON.parse(resp.data).total);
      toast.success('Done');
    } else {
      toast.error('error');
    }
  };

  return (
    <>
      <div>
        <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
          Vehicle Report
        </h1>
        <form
          onSubmit={handleSubmit}
          className='max-w-md mx-auto mt-4 p-6 bg-white shadow-md rounded-md flex-wrap'
        >
          {/* Date input fields */}
          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Start Date:
            </label>
            <input
              type='date'
              id='input'
              value={startingDate}
              onChange={(e) => setStartingDate(e.target.value)}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              End Date:
            </label>
            <input
              type='date'
              id='input'
              value={endingDate}
              onChange={(e) => setEndingDate(e.target.value)}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            />
          </div>

          <div>
            <button
              type='submit'
              className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              View Entries
            </button>
          </div>
        </form>

        {/* Display Table */}
        <div>
          {result?.length > 0 && (
            <>
              <button
                onClick={() =>
                  exportToExcel(result, totalData, startingDate, endingDate)
                }
                className='mt-4 mb-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700'
              >
                Export to Excel
              </button>
              <table className='w-full border-collapse mt-6'>
                {/* Table structure */}
                <thead>
                  <tr className='bg-gray-200'>
                    {/* Table headers */}
                    <th className='border p-2'>Chalan Number</th>
                    <th className='border p-2'>Date</th>
                    <th className='border p-2'>Vehicle/Equipment Name</th>
                    <th className='border p-2'>Registration Number</th>
                    <th className='border p-2'>Location</th>
                    <th className='border p-2'>Department</th>
                    <th className='border p-2'>Officer Name</th>
                    <th className='border p-2'>Running Hours</th>
                    <th className='border p-2'>Amount</th>
                    <th className='border p-2'>GST</th>
                    <th className='border p-2'>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((ele, index) => {
                    const dateObj = new Date(ele.date);
                    const formattedDate = `${String(dateObj.getDate()).padStart(
                      2,
                      '0'
                    )}-${String(dateObj.getMonth() + 1).padStart(
                      2,
                      '0'
                    )}-${dateObj.getFullYear()}`;
                    return (
                      <tr key={index} className='hover:bg-gray-100'>
                        <td className='border p-2'>{ele.chalanNumber}</td>
                        <td className='border p-2'>{formattedDate}</td>
                        <td className='border p-2'>{ele.item}</td>
                        <td className='border p-2'>{ele.vehicleNumber}</td>
                        <td className='border p-2'>{ele.location}</td>
                        <td className='border p-2'>
                          {ele.department.departmentName}
                        </td>
                        <td className='border p-2'>{ele.engineer.name}</td>
                        <td className='border p-2'>{ele.hours}</td>
                        <td className='border p-2'>{ele.amount}</td>
                        <td className='border p-2'>{ele.gst}</td>
                        <td className='border p-2'>{ele.total}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td className='border p-2'></td>
                    <td className='border p-2'></td>
                    <td className='border p-2'></td>
                    <td className='border p-2'></td>
                    <td className='border p-2'></td>
                    <td className='border p-2'></td>
                    <td className='border p-2'></td>
                    <td className='border p-2 font-semibold'>Total</td>
                    <td className='border p-2'>{totalData?.totalAmount}</td>
                    <td className='border p-2'>{totalData?.totalGst}</td>
                    <td className='border p-2'>{totalData?.total}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
          {result?.length === 0 && (
            <div className='flex items-center justify-center text-3xl pt-9'>
              No Result to Display
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;

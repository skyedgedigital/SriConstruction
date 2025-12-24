'use client';
import { Button } from '@/components/ui/button';
import FileFn from '@/lib/actions/adminAnalytics/fileData';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import * as XLSX from 'xlsx';

const formatEmpCode = (code: string | number): string => {
  return code.toString().padStart(4, '0');
};
const month_to_num = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

// Status color mapping for Excel-like conditional formatting
const statusColors = {
  Present: '#C6EFCE', // Light green
  Absent: '#FFC7CE', // Light red
  'Not Paid': '#FFEB9C', // Light yellow
  'Half Day': '#FFE699', // Light orange
  'National Holiday': '#D9E1F2', // Light blue
  'Earned Leave': '#E2EFDA', // Light green (different shade)
  'Casual Leave': '#FFF2CC', // Light yellow (different shade)
  'Festival Leave': '#FCE4D6', // Light peach
  Unknown: '#F2F2F2', // Light gray
  'No Data': '#FFFFFF', // White
};

const Page = () => {
  const [data, setData] = useState([]);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalDataRows, setTotalDataRows] = useState(0); // Rows with actual data
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employeeCodeNotInDB, setEmployeeCodeNotInDB] = useState([]);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  // Function to download example file from public folder
  const downloadExampleFile = () => {
    try {
      // Assuming the file is in public folder
      const fileUrl = '/assets/attendance/Attendance_format.xlsx';

      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'attendance_example_format.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Example file downloaded successfully!');
    } catch (error) {
      console.error('Error downloading example file:', error);
      toast.error('Failed to download example file');
    }
  };

  // Function to clear selected file and reset state
  const clearSelectedFile = () => {
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Reset all states
    setData([]);
    setFileName('');
    setStart(1);
    setEnd(10);
    setTotalRows(0);
    setTotalDataRows(0);
    setEmployeeCodeNotInDB([]);
    fileRef.current = null;

    toast.success('File cleared successfully!');
  };

  // Helper function to check if a row has data
  const hasRowData = (row) => {
    if (!row || row.length < 34) return false;

    // Check if any of the Day columns (3-33) have data
    for (let colIndex = 3; colIndex < 34; colIndex++) {
      const cellValue = row[colIndex];
      if (
        cellValue !== undefined &&
        cellValue !== null &&
        cellValue.toString().trim() !== ''
      ) {
        return true;
      }
    }

    // Also check if EmpCode has value (basic validation)
    const empCode = row[2];
    if (
      empCode === undefined ||
      empCode === null ||
      empCode.toString().trim() === ''
    ) {
      return false;
    }

    return false; // Return false if no day data found
  };

  const processFile = (file) => {
    setLoading(true);
    setData([]);
    setEmployeeCodeNotInDB([]);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Get all rows with data
        const dataRows = [];
        const rowIndices = []; // Store original row indices

        for (let i = 1; i < jsonData.length; i++) {
          // Start from 1 to skip header
          if (hasRowData(jsonData[i])) {
            dataRows.push(jsonData[i]);
            rowIndices.push(i); // Store the original row index
          }
        }

        const totalRowsInFile = jsonData.length - 1; // Total rows excluding header
        const totalDataRowsCount = dataRows.length; // Rows with actual data

        setTotalRows(totalRowsInFile);
        setTotalDataRows(totalDataRowsCount);

        // Auto-set start and end rows for data rows only
        const autoStart = 1; // First data row is index 0
        const autoEnd = Math.max(1, totalDataRowsCount); // End at last data row

        setStart(autoStart);
        setEnd(autoEnd);

        // Process only the data rows
        let extractedData = dataRows
          .slice(autoStart - 1, autoEnd) // Adjust for 0-based indexing
          .map((row, index) => {
            const originalRowIndex = rowIndices[autoStart - 1 + index]; // Get original row index
            const workorderId = row[34]?.toString().trim() || '';
            const year = row[0];
            const empCode = formatEmpCode(row[2]);
            const month = month_to_num[row[1]?.toLowerCase() || ''];

            const days = [];
            for (let colIndex = 3; colIndex < 34; colIndex++) {
              const status = row[colIndex]?.toString().trim().toLowerCase();
              const day = colIndex - 2;

              if (status && status.trim().length > 0) {
                let normalizedStatus = '';
                if (status === 'p') {
                  normalizedStatus = 'Present';
                } else if (status === 'a') {
                  normalizedStatus = 'Absent';
                } else if (status === 'np') {
                  normalizedStatus = 'Not Paid';
                } else if (status === 'hd') {
                  normalizedStatus = 'Half Day';
                } else if (status === 'nh') {
                  normalizedStatus = 'NH';
                } else if (status === 'el') {
                  normalizedStatus = 'Earned Leave';
                } else if (status === 'cl') {
                  normalizedStatus = 'Casual Leave';
                } else if (status === 'fl') {
                  normalizedStatus = 'Festival Leave';
                } else {
                  normalizedStatus = 'Unknown';
                }

                days.push({
                  day,
                  status: normalizedStatus,
                  originalCode: row[colIndex]?.toString().trim() || '',
                });
              } else {
                days.push({
                  day,
                  status: 'No Data',
                  originalCode: '',
                });
              }
            }

            return {
              year,
              empCode,
              month,
              workorderId,
              days,
              originalRowIndex: originalRowIndex + 1, // Convert to 1-based for display
            };
          });

        console.table(extractedData);
        setData(extractedData);
        toast.success(
          `Loaded ${extractedData.length} records from "${
            file.name
          }" (Filtered ${totalRowsInFile - totalDataRowsCount} empty rows)`
        );
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Error processing Excel file. Please check the format.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setLoading(false);
      toast.error('Error reading file');
    };

    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileRef.current = file;
    setFileName(file.name);
    setData([]);
    processFile(file);
  };

  const loadData = async () => {
    if (!fileRef.current) {
      toast.error('No file uploaded!');
      return;
    }

    // When loading data manually, use the current start and end values
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Get all rows with data
        const dataRows = [];
        const rowIndices = [];

        for (let i = 1; i < jsonData.length; i++) {
          if (hasRowData(jsonData[i])) {
            dataRows.push(jsonData[i]);
            rowIndices.push(i);
          }
        }

        const totalDataRowsCount = dataRows.length;
        const actualEnd = Math.min(end, totalDataRowsCount);

        // Process only the data rows
        let extractedData = dataRows
          .slice(start - 1, actualEnd) // Adjust for 0-based indexing
          .map((row, index) => {
            const originalRowIndex = rowIndices[start - 1 + index];
            const workorderId = row[34]?.toString().trim() || '';
            const year = row[0];
            const empCode = formatEmpCode(row[2]);
            const month = month_to_num[row[1]?.toLowerCase() || ''];

            const days = [];
            for (let colIndex = 3; colIndex < 34; colIndex++) {
              const status = row[colIndex]?.toString().trim().toLowerCase();
              const day = colIndex - 2;

              if (status && status.trim().length > 0) {
                let normalizedStatus = '';
                if (status === 'p') {
                  normalizedStatus = 'Present';
                } else if (status === 'a') {
                  normalizedStatus = 'Absent';
                } else if (status === 'np') {
                  normalizedStatus = 'Not Paid';
                } else if (status === 'hd') {
                  normalizedStatus = 'Half Day';
                } else if (status === 'nh') {
                  normalizedStatus = 'NH';
                } else if (status === 'el') {
                  normalizedStatus = 'Earned Leave';
                } else if (status === 'cl') {
                  normalizedStatus = 'Casual Leave';
                } else if (status === 'fl') {
                  normalizedStatus = 'Festival Leave';
                } else {
                  normalizedStatus = 'Unknown';
                }

                days.push({
                  day,
                  status: normalizedStatus,
                  originalCode: row[colIndex]?.toString().trim() || '',
                });
              } else {
                days.push({
                  day,
                  status: 'No Data',
                  originalCode: '',
                });
              }
            }

            return {
              year,
              empCode,
              month,
              workorderId,
              days,
              originalRowIndex: originalRowIndex + 1,
            };
          });

        setData(extractedData);
        toast.success(
          `Loaded ${extractedData.length} records (rows ${start} to ${actualEnd} of data rows)`
        );
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(fileRef.current);
  };

  const saveDataInDB = async () => {
    if (data.length < 1) {
      toast.error('No data to save');
      return;
    }

    setIsSaving(true);
    setEmployeeCodeNotInDB([]);
    try {
      const resp = await FileFn(JSON.stringify(data));
      setEmployeeCodeNotInDB(resp.data || []);
      if (resp.success) {
        toast.success('Saved data in DB');
      } else {
        toast.error('Failed to save data');
      }
    } catch (error) {
      toast.error('Error saving data');
      console.error(error);
    }
    setIsSaving(false);
  };

  const startChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1 || value > totalDataRows) {
      toast.error(`Invalid row value. Must be between 1 and ${totalDataRows}`);
      return;
    }
    setStart(value);
  };

  const endChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < start || value > totalDataRows) {
      toast.error(
        `Invalid row value. Must be between ${start} and ${totalDataRows}`
      );
      return;
    }
    setEnd(value);
  };

  // Format the original status code for display
  const formatStatusCode = (status, originalCode) => {
    if (originalCode) return originalCode.toUpperCase();
    return status === 'No Data' ? '' : status.charAt(0);
  };

  const selectAllRows = () => {
    setStart(1);
    setEnd(totalDataRows);
  };

  return (
    <div className='p-6 bg-gray-50 min-h-screen pb-20'>
      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <h1 className='text-2xl font-bold mb-2 text-gray-800'>
          Upload Attendance Excel Sheet
        </h1>

        {fileName && (
          <div className='my-4'>
            <p className='text-green-600 flex items-center'>
              <svg
                className='w-5 h-5 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              File loaded:{' '}
              <span className='font-semibold ml-1'>{fileName}</span>
            </p>
            <p className='text-gray-600 text-sm mt-1'>
              Found {totalDataRows} data rows (filtered{' '}
              {totalRows - totalDataRows} empty rows)
            </p>
          </div>
        )}
        <div className='flex justify-between mb-6'>
          <div className='flex flex-col gap-6 justify-start'>
            <div className=''>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Upload Excel File
              </label>
              <input
                ref={fileInputRef}
                type='file'
                accept='.xlsx, .xls'
                onChange={handleFileUpload}
                className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              />
            </div>
            <div className='flex gap-3'>
              <Button
                onClick={loadData}
                variant='outline'
                disabled={loading || isSaving || !fileRef.current}
                className='px-6 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700'
              >
                📊 Load Data
              </Button>
              <Button
                onClick={clearSelectedFile}
                variant='outline'
                disabled={!fileRef.current}
                className='px-6 py-2 border-2 border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700 flex items-center gap-2'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
                Clear
              </Button>
            </div>
          </div>

          <div className='flex flex-col w-fit gap-6'>
            {/* Download Example File Button - Placed on the right side */}
            <div className='flex flex-col'>
              <label className='block text-sm font-medium text-gray-700 mb-1 invisible'>
                Download Example
              </label>
              <Button
                onClick={downloadExampleFile}
                variant='outline'
                className='px-4 py-2 border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-600 flex items-center gap-2 w-fit'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                Download Example Format
              </Button>
              <p className='text-xs text-gray-500 mt-1'>
                Download the correct Excel format
              </p>
            </div>
            <div className='flex gap-6 mb-6 w-fit'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Start Row (Data Rows)
                </label>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    value={start}
                    onChange={startChangeHandler}
                    min='1'
                    max={totalDataRows}
                    className='w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  <span className='text-sm text-gray-500'>
                    of {totalDataRows} data rows
                  </span>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  End Row (Data Rows)
                </label>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    value={end}
                    onChange={endChangeHandler}
                    min={start}
                    max={totalDataRows}
                    className='w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  <Button
                    onClick={selectAllRows}
                    variant='ghost'
                    className='px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    disabled={totalDataRows === 0}
                  >
                    Select All ({totalDataRows})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {totalRows > 0 && (
          <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-blue-800'>
                  File Analysis:
                </p>
                <div className='mt-2 space-y-1'>
                  <p className='text-sm text-blue-600'>
                    • Total rows in file:{' '}
                    <span className='font-medium'>{totalRows}</span>
                  </p>
                  <p className='text-sm text-blue-600'>
                    • Rows with data:{' '}
                    <span className='font-medium'>{totalDataRows}</span>
                  </p>
                  <p className='text-sm text-blue-600'>
                    • Empty rows filtered:{' '}
                    <span className='font-medium'>
                      {totalRows - totalDataRows}
                    </span>
                  </p>
                  <p className='text-sm text-blue-600 mt-2'>
                    Currently selected: Data row {start} to {end} (
                    {end - start + 1} rows)
                  </p>
                </div>
              </div>
              <div className='text-sm text-blue-600'>
                <span className='font-medium'>Header row:</span> Row 0
              </div>
            </div>
          </div>
        )}

        {employeeCodeNotInDB.length > 0 && (
          <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-500'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 1 001.414 1.414L10 11.414l1.293 1.293a1 1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>
                  ({employeeCodeNotInDB.length}) Employees not found in
                  database, hence attendance not save for these:
                </h3>
                <div className='mt-2 text-sm text-red-700 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-8 gap-2'>
                  {employeeCodeNotInDB
                    .sort((a, b) => Number(a) - Number(b))
                    .map((emp, idx) => (
                      <span key={emp + '' + idx}>{emp}</span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className='flex items-center justify-center p-8'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-700'>Loading Excel data...</p>
            </div>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='bg-gray-100 border-b border-gray-300 px-6 py-4'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold text-gray-800'>
                📋 Attendance Data ({data.length} employee records)
              </h2>
              <div className='text-sm text-gray-600'>
                Showing data rows {start} to{' '}
                {Math.min(end, start + data.length - 1)}
                <span className='ml-2 text-blue-600'>
                  (Total: #{data.length} rows, {data.length * 31} days)
                </span>
              </div>
            </div>
          </div>

          {/* Excel-like table */}
          <div className='overflow-auto max-h-[600px]'>
            <div className='inline-block min-w-full align-middle'>
              <table className='min-w-full border-collapse bg-white'>
                <thead>
                  <tr className='bg-gray-100 border-b border-gray-300'>
                    <th className='sticky left-0 z-10 border-r border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-100'>
                      Row #
                    </th>
                    <th className='border-r border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Year
                    </th>
                    <th className='border-r border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Month
                    </th>
                    <th className='border-r border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Emp Code
                    </th>
                    <th className='border-r border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Workorder ID
                    </th>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <th
                        key={day}
                        className='border-r border-gray-300 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[60px]'
                      >
                        Day {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={
                        rowIndex % 2 === 0
                          ? 'bg-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }
                    >
                      <td className='sticky left-0 z-10 border-r border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50'>
                        {row.originalRowIndex}
                        <span className='text-xs text-gray-500 ml-2'>
                          (#{start + rowIndex})
                        </span>
                      </td>
                      <td className='border-r border-gray-300 px-4 py-3 text-sm text-gray-900'>
                        {row.year}
                      </td>
                      <td className='border-r border-gray-300 px-4 py-3 text-sm text-gray-900'>
                        {row.month}
                      </td>
                      <td className='border-r border-gray-300 px-4 py-3 text-sm font-medium text-gray-900'>
                        {row.empCode}
                      </td>
                      <td className='border-r border-gray-300 px-4 py-3 text-sm text-gray-600 font-mono'>
                        {row.workorderId}
                      </td>
                      {row.days.map((dayData, dayIndex) => (
                        <td
                          key={dayIndex}
                          className='border-r border-gray-300 px-3 py-2 text-center text-sm font-medium'
                          style={{
                            backgroundColor:
                              statusColors[dayData.status] || '#FFFFFF',
                            color:
                              dayData.status === 'No Data' ? '#999' : '#000',
                          }}
                        >
                          {formatStatusCode(
                            dayData.status,
                            dayData.originalCode
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Legend */}
          <div className='border-t border-gray-300 bg-gray-50 px-6 py-4'>
            <div className='flex flex-wrap items-center gap-4'>
              <span className='text-sm font-medium text-gray-700'>
                Status Legend:
              </span>
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className='flex items-center gap-2'>
                  <div
                    className='w-4 h-4 border border-gray-300'
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className='text-sm text-gray-600'>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {data.length > 0 && (
        <div className='mt-6 grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-white rounded-lg shadow p-4 border-l-4 border-blue-500'>
            <div className='text-sm font-medium text-gray-500'>
              Total Records
            </div>
            <div className='text-2xl font-bold text-gray-800'>
              {data.length}
            </div>
          </div>
          <div className='bg-white rounded-lg shadow p-4 border-l-4 border-green-500'>
            <div className='text-sm font-medium text-gray-500'>
              Days Processed
            </div>
            <div className='text-2xl font-bold text-gray-800'>
              {data.length * 31}
            </div>
          </div>
          <div className='bg-white rounded-lg shadow p-4 border-l-4 border-purple-500'>
            <div className='text-sm font-medium text-gray-500'>Start Row</div>
            <div className='text-2xl font-bold text-gray-800'>{start}</div>
          </div>
          <div className='bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500'>
            <div className='text-sm font-medium text-gray-500'>End Row</div>
            <div className='text-2xl font-bold text-gray-800'>
              {Math.min(end, start + data.length - 1)}
            </div>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <div className='flex justify-center items-center mt-8'>
          <Button
            onClick={saveDataInDB}
            variant='outline'
            disabled={loading || isSaving || data.length === 0}
            className='px-8 py-3 border-2 bg-green-600 text-white hover:bg-green-700 hover:text-white flex justify-center items-center gap-2'
          >
            {isSaving ? (
              <>
                <AiOutlineLoading3Quarters className='animate-spin' /> saving
              </>
            ) : (
              <>💾 Save to Database</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;

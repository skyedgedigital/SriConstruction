'use client';
import { Button } from '@/components/ui/button';
import FileFn from '@/lib/actions/adminAnalytics/fileData';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

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

const Page = () => {
  const [data, setData] = useState([]);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(10);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employeeCodeNotInDB, setEmployeeCodeNotInDB] = useState([]);
  const fileRef = useRef(null);

  const processFile = (file) => {
    // const file = e.target.files[0];
    setLoading(true);
    setData([]);
    setEmployeeCodeNotInDB([]);
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let extractedData = jsonData.slice(start, end + 1).flatMap((row) => {
        const year = row[0];
        const empCode = row[2];
        const month = month_to_num[row[1].toLowerCase()];

        const days = [];
        for (let colIndex = 3; colIndex < 3 + 31; colIndex++) {
          const status = row[colIndex]?.trim().toLowerCase();
          const day = colIndex - 2;

          if (status && status.trim().length > 0) {
            let normalizedStatus = '';
            if (status === 'p' || status === 'P') {
              normalizedStatus = 'Present';
            } else if (status === 'a' || status === 'A') {
              normalizedStatus = 'Absent';
            } else if (status === 'np' || status === 'NP') {
              normalizedStatus = 'Not Paid';
            } else if (status === 'hd' || status === 'HD') {
              normalizedStatus = 'Half Day';
            } else if (status === 'nh' || status === 'NH') {
              normalizedStatus = 'National Holiday';
            } else if (status === 'EL' || status === 'el') {
              normalizedStatus = 'Earned Leave';
            } else if (status === 'CL' || status === 'cl') {
              normalizedStatus = 'Casual Leave';
            } else if (status === 'FL' || status === 'fl') {
              normalizedStatus = 'Festival Leave';
            } else {
              toast.error(`status: ${status} is not recognized`);
            }

            days.push({
              day,
              status: normalizedStatus,
            });
          } else {
            console.log(
              `Attendance status not found for day ${day} for employee ${empCode}`
            );
            // days.push({
            //   day,
            //   status: 'No Data',
            // });
          }
        }

        return {
          year,
          empCode,
          month,
          days,
        };
      });

      console.table(extractedData);

      setData(extractedData);
      setLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileRef.current = file;
    setData([]); // clearing previous data
    processFile(file);
  };

  const loadData = async () => {
    if (!fileRef.current) {
      toast.error('No file uploaded!');
      return;
    }
    processFile(fileRef.current);
  };

  const saveDataInDB = async () => {
    if (data.length < 1) {
      toast.error('No data to save');
      return;
    }

    setIsSaving(true);
    setEmployeeCodeNotInDB([]);
    const resp = await FileFn(JSON.stringify(data));
    //@ts-ignore
    setEmployeeCodeNotInDB(resp.data);
    // console.log(resp.data);
    if (resp.success) {
      toast.success('Saved data in DB');
    } else {
      toast.error('Nope');
    }
    setIsSaving(false);
  };

  const startChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!parseInt(e.target.value)) {
      toast.error('Invalid row value');
      return;
    }
    setStart(parseInt(e.target.value, 10));
  };

  const endChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!parseInt(e.target.value)) {
      toast.error('Invalid row value');
      return;
    }
    setEnd(parseInt(e.target.value, 10));
    // if (fileRef.current) processFile(fileRef.current);
  };

  return (
    <div className='ml-16'>
      <h1>Upload Excel File</h1>
      <input type='file' accept='.xlsx, .xls' onChange={handleFileUpload} />

      <div>
        <label>Start Row:</label>
        <input
          type='number'
          value={start}
          onChange={startChangeHandler}
          min='1'
        />
      </div>
      <div>
        <label>End Row:</label>
        <input
          type='number'
          value={end}
          onChange={endChangeHandler}
          min={start}
        />
        <div className='flex w-fit gap-10 mb-4 mt-4'>
          <Button
            onClick={() => {
              loadData();
            }}
            variant='outline'
            disabled={loading || isSaving}
          >
            Load Data
          </Button>
          <Button
            onClick={() => {
              saveDataInDB();
            }}
            variant='outline'
            disabled={loading || isSaving}
          >
            Save Data in DB
          </Button>
        </div>

        <p className='bg-red-400 mb-4'>
          {employeeCodeNotInDB.length > 0 &&
            employeeCodeNotInDB.map((emp, idx) => (
              <span key={emp + '' + idx} className='px-2'>
                EmpCode: {emp},
              </span>
            ))}
          {employeeCodeNotInDB.length > 0 && (
            <span>Not found in Employee DB</span>
          )}
        </p>
      </div>

      {loading && <p>Loading data, please wait...</p>}
      {isSaving && <p>Saving data in DB., Please wait...</p>}

      {data.length > 0 && (
        <table className='b-1'>
          <thead>
            <tr>
              <th>Year</th>
              <th>Emp Code</th>
              <th>Month</th>
              <th>Day</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) =>
              row.days.map((dayData, dayIndex) => (
                <tr key={`${index}-${dayIndex}`}>
                  <td>{row.year}</td>
                  <td>{row.empCode}</td>
                  <td>{row.month}</td>
                  <td>{dayData.day}</td>
                  <td>{dayData.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Page;

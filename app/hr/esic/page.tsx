'use client';

import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Separator } from '@/components/ui/separator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import wagesAction from '@/lib/actions/HR/wages/wagesAction';
import { useReactToPrint } from 'react-to-print';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  PDFTable,
} from '@/components/ui/table';

import { fetchAllAttendance } from '@/lib/actions/attendance/fetch';

import React, { useEffect, useState } from 'react';
import StateActionHr from '@/lib/actions/HR/State/StateAction';
import { array } from 'zod';
import { Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [stateDetails, setStatesDetails] = useState([]);

  const [loading, setLoading] = useState(false);

  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({
    //@ts-ignore
    content: () => contentRef.current,
    documentTitle: `BonusStatement/${searchParams.year}`,
  });

  const handleOnClick = async () => {
    console.log('Print table clicked!!');
    if (!attendanceData) {
      toast.error('Attendance data not available for Print generation.');
      return;
    }
    reactToPrintFn();
  };

  const handleDownloadPDF = async () => {
    if (!attendanceData) {
      toast.error('Attendance data not available for PDF generation.');
      return;
    }
    await generatePDF(attendanceData);
  };

  const generatePDF = async (attendanceData) => {
    const pdf = new jsPDF('l', 'pt', 'a4'); // Landscape PDF
    const ogId = `${searchParams.month}/${searchParams.year}`;
    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;
    tableElement.style.width = '1250px';

    pdf.html(tableElement, {
      callback: async () => {
        pdf.save(`${ogId}ESIC.pdf`);
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.6 },
      autoPaging: 'text',
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const esiState = searchParams.esistate as string;
        console.log('ESI STATE: ', esiState);
        const response = await StateActionHr.FETCH.fetchState();
        const parsedData = JSON.parse(response.data);
        const filteredData =
          esiState === 'All'
            ? parsedData
            : parsedData.filter((item) => item.states.stateName === esiState);
        setStatesDetails(filteredData);
        if (response.success) {
          // toast.success(response.message);
          console.log('State Data: ', JSON.parse(response.data));
          console.log('Filtered State Data', stateDetails);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error('Internal Server Error');
        console.error('Internal Server Error:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const allWages = async () => {
      try {
        setAttendanceData(null);
        setLoading(true);
        const month = parseInt(searchParams.month as string);
        const year = parseInt(searchParams.year as string);
        const response = await wagesAction.FETCH.fetchFilledWages(
          month,
          year,
          'Default'
        );
        if (response?.success) {
          toast.success(response.message);
          const responseData = JSON.parse(response.data);
          const parsedData = responseData.map((item) => ({
            ...item,
            otherCashDescription: JSON.parse(item.otherCashDescription),
            otherDeductionDescription: JSON.parse(
              item.otherDeductionDescription
            ),
          }));
          const filteredData = parsedData.filter(
            (item) =>
              stateDetails.some(
                (state) => state.workOrderId === item.workOrderHr
              ) &&
              item.employee?.ESICApplicable &&
              item.total < 21000
          );
          setAttendanceData(filteredData);
          setLoading(false);
        } else {
          toast.error(response.message);
          setLoading(false);
        }
      } catch (error) {
        toast.error(error);
        setLoading(false);
      }
    };
    console.log('Final state details: ', stateDetails);
    allWages();
  }, [stateDetails]);

  useEffect(() => {
    console.log('Final state details in attendance: ', attendanceData);
  }, [attendanceData]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setAttendanceData(null);
  //       const month = parseInt(searchParams.month as string);
  //       const year = parseInt(searchParams.year as string);
  //       const esiLoc = searchParams.esi as string;
  //       const response = await wagesAction.FETCH.fetchFilledWages(month, year, "Default");

  //       if (response?.success) {
  //         toast.success(response.message);
  //         const responseData = JSON.parse(response.data);
  //         const parsedData = responseData.map(item => ({
  //           ...item,
  //           otherCashDescription: JSON.parse(item.otherCashDescription),
  //           otherDeductionDescription: JSON.parse(item.otherDeductionDescription),
  //         }));
  //         const filteredData = esiLoc === "All Esi Locations"
  //           ? parsedData
  //           : parsedData.filter(item => item.employee.ESILocation === esiLoc);
  //         setAttendanceData(filteredData);
  //       } else {
  //         toast.error(response.message);
  //       }
  //     } catch (error) {
  //       toast.error('Internal Server Error');
  //       console.error('Internal Server Error:', error);
  //     }
  //   };
  //   fetchData();
  // }, [searchParams]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array of days (1 to 31)

  const exportToExcelHandler = async () => {
    console.log('first');
    const excelReportTitle = `ESIC Report for year: ${searchParams.year} month: ${searchParams.month} state: ${searchParams.esistate}`;
    const rowsForTitle = [[excelReportTitle], []];
    const worksheetData = attendanceData.map((employee, index) => {
      return {
        'Sl No.': index + 1,
        'IP Number': employee?.employee?.ESICNo || '',
        // 'P.F. No.': employee?.employee?.pfNo || '',
        'IP Name': employee?.employee?.name || '',
        'No. of days for which wages paid/payable': employee?.attendance || 0,
        'Total Monthly Wage': Math.round((employee?.total).toFixed(2)),
      };
    });
    const combinedExcelRows = rowsForTitle.concat(
      XLSX.utils.sheet_to_json(XLSX.utils.json_to_sheet(worksheetData), {
        header: 1,
      })
    );

    const worksheet = XLSX.utils.aoa_to_sheet(combinedExcelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ESIC Report');
    XLSX.writeFile(
      workbook,
      `ESIC${searchParams.month || ''}_${searchParams.year || ''}_${
        searchParams.esistate
      }.xlsx`
    );
    toast.success('Export Completed');
  };

  return (
    <div className='ml-[80px]'>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      {attendanceData?.length > 0 && (
        <div>
          <Button
            className='mt-4 mb-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 mr-auto'
            onClick={exportToExcelHandler}
          >
            Export to Excel
          </Button>
        </div>
      )}

      <div id={`${searchParams.month}/${searchParams.year}`} ref={contentRef}>
        {attendanceData && !loading ? (
          <div>
            <PDFTable className='border-2 border-black'>
              <TableHeader className='py-8 h-24 overflow-auto'>
                <TableRow className='text-black font-mono h-28'>
                  <TableHead className='bg-slate-400 text-black border-2 border-black'>
                    Sl No.
                  </TableHead>
                  <TableHead className='bg-slate-400 text-black border-2 border-black'>
                    IP Number (10 Digits)
                  </TableHead>
                  {/* <TableHead className='bg-slate-400 text-black border-2 border-black'>
                    P.F. No.
                  </TableHead> */}
                  <TableHead className='bg-slate-400 text-black border-2 border-black'>
                    IP Name (Alphabetical only)
                  </TableHead>
                  <TableHead className='bg-slate-400 text-black border-2 border-black'>
                    No. of days for which wages paid/payable
                  </TableHead>
                  <TableHead className='bg-slate-400 text-black border-2 border-black'>
                    Total Monthly Wage
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((employee, index) => (
                  <TableRow key={employee._id} className='h-16'>
                    <TableCell className='border-black border-2 text-black'>
                      {index + 1}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.employee?.ESICNo}
                    </TableCell>
                    {/* <TableCell className='border-black border-2 text-black'>
                      {employee?.employee?.pfNo}
                    </TableCell> */}
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.employee?.name}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.attendance}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {Math.round(employee?.total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </PDFTable>
          </div>
        ) : (
          // : attendanceData?.length() === 0 && !loading  ? (
          //   <div className="flex flex-col justify-center items-center h-[400px]">
          //     <h1>Zero employes are working in {searchParams.esistate}</h1>
          // </div>
          // )
          <div className='flex flex-col justify-center items-center h-[400px]'>
            <Loader2 size={50} className='animate-spin' />
            <h1>Fetching {searchParams.esistate} State ESIC Report...</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

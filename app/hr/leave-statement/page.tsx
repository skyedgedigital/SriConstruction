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
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import { fetchWagesForFinancialYearStatement } from '@/lib/actions/HR/wages/fetch';
import { fetchWagesForCalendarYearStatement2 } from '@/lib/actions/HR/wages/fetch';

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const [bonusData, setBonusData] = useState(null);

  const [attendanceData, setAttendanceData] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalAttendanceSum, setTotalAttendanceSum] = useState(0);
  const [totalNetAmountPaidSum, setTotalNetAmountPaidSum] = useState(0);
  const [totalBonusSum, setTotalBonusSum] = useState(0);

  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `BonusStatement/${searchParams.year}`,
  });
  const handleOnClick = React.useCallback(() => {
    reactToPrintFn();
  }, [reactToPrintFn]);

  const handleDownloadPDF = async () => {
    // if (!attendanceData) {
    //   toast.error('Attendance data not available for PDF generation.');
    //   return;
    // }

    await generatePDF();
  };

  const generatePDF = async () => {
    const pdf = new jsPDF('l', 'pt', 'a4'); // Create a landscape PDF

    const pageWidth = pdf.internal.pageSize.getWidth(); // Get the width of the PDF page
    const pageHeight = pdf.internal.pageSize.getHeight(); // Get the height of the PDF page
    const ogId = `LeaveStatement/${searchParams.year}`;

    // Create a container element to hold the content and table
    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;

    // Set the table width
    const tableWidth = 1250;
    tableElement.style.width = `${tableWidth}px`;

    // Append the table to the container element temporarily to measure its size
    document.body.appendChild(tableElement);

    // Use html2canvas to measure the rendered table's width and height
    html2canvas(tableElement, { scale: 0.45 }).then((canvas) => {
      const contentWidth = canvas.width * 0.45; // Scaled content width
      const contentHeight = canvas.height * 0.45; // Scaled content height

      // Calculate the x position to center the table horizontally
      // const xPos = (pageWidth - contentWidth) / 2;
      const xPos = 64;

      // Calculate the y position to center the table vertically
      // const yPos = (pageHeight - contentHeight) / 2;
      const yPos = 64;

      // Render the table in the PDF
      pdf.html(tableElement, {
        callback: async () => {
          pdf.save(`${ogId}_Bank-Statement.pdf`);
          const pdfDataUrl = pdf.output('dataurlstring');
        },
        x: xPos, // Center horizontally
        y: yPos, // Center vertically
        html2canvas: { scale: 0.45 }, // Maintain the same scale
        autoPaging: 'text',
      });

      // Remove the temporary table element after rendering
      document.body.removeChild(tableElement);
    });
  };

  useEffect(() => {
    const fn = async () => {
      try {
        setBonusData(null);
        const data = {
          // @ts-ignore
          year: parseInt(searchParams.year),
          workOrder: searchParams.wo,
          leavePercentage: parseFloat(searchParams.lp),
        };
        console.log('shaiaiijsjs', data);
        const filter = await JSON.stringify(data);

        const response = await fetchWagesForCalendarYearStatement2(filter);
        //   console.log(JSON.parse(response.data))
        console.log('ooooo', response);
        const responseData = JSON.parse(response.data);
        console.log('ooooooooo', responseData);
        const filteredData =
          searchParams.dep === 'All Departments'
            ? responseData.filter((item) => item?.leave >= 1)
            : responseData.filter(
                (item) =>
                  item.employee.department === searchParams.dep &&
                  item?.leave >= 1
              );

        setBonusData(filteredData);

        console.log('response aagya bawa', responseData, bonusData);
        console.log('aagya response');
      } catch (error) {
        toast.error('Internal Server Error');
        console.log('Internal Server Error:', error);
      }
    };
    fn();
  }, []);

  useEffect(() => {
    if (bonusData && bonusData.length > 0) {
      // Step 2: Calculate sums using reduce

      const totalBonus = bonusData.reduce(
        (acc, employee) => acc + employee.leave,
        0
      );

      // Step 3: Update state with the calculated sums
      console.log('ppppppppppp', totalBonus);
      setTotalBonusSum(totalBonus.toFixed(2));
    }
  }, [bonusData]);

  console.log('yeich toh hain', searchParams);

  console.log('sahi h bhai');

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array of days (1 to 31)

  return (
    <div className='ml-[80px]'>
      <div className='flex gap-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      <div ref={contentRef} id={`LeaveStatement/${searchParams.year}`}>
        <div
          className='container left-0 right-0 bg-white  overflow-hidden font-mono  w-[1200px]'
          id='container-id'
        >
          <div className='max-w-3xl mx-auto mt-10 font-sans leading-relaxed'>
            <div className='mb-10'>
              <p>To</p>
              <p>The Branch Manager</p>
            </div>

            <div className='flex justify-between mb-10'>
              <p>Regarding: Fund Transfer for Leave Payment</p>
              <p>{`${searchParams.year}`}</p>
            </div>

            <div>
              <p className='mb-4'>Respected Sir,</p>
              <p className='mb-4'>
                This is to bring to your kind attention that I issued a self
                cheque of Rs.
                <span className=' mr-12 ml-2 font-bold'>{totalBonusSum}</span>
                <span> vide Cheque No.</span>
              </p>
              <p className='mb-4'>
                I wish to transfer this amount to the following accounts.
                Details of which are given below:
              </p>
            </div>
          </div>

          <div className='flex justify-between left-0  ml-0 mb-10 p-8'>
            <div className='flex flex-col '>
              {/* {' '}
              <div className=' font-bold'>Shekhar Enterprises</div>
              <div className=' '>.H.NO 78 KAPLI NEAR HARI MANDIR,</div>
              <div className=' '>.PO KAPALI SARAIKEA,</div>
              <div className=' '>.KHARSWAN JHARKHAND.</div>{' '} */}
            </div>
            <div className='flex flex-col'>
              <h1 className='  mb-4  text-center'>{`Leave Statement for`}</h1>
              <h1 className='text-left  mb-4 '>{`${searchParams.year}`}</h1>
            </div>
          </div>
        </div>

        {bonusData && (
          <div>
            <PDFTable className='border-2 border-black  '>
              <TableHeader className=' py-8 h-24 overflow-auto  '>
                <TableRow className='text-black font-mono h-28'>
                  <TableHead className=' text-black border-2 border-black bg-white text-2xl font-bold'>
                    Sl. No.
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black bg-white text-2xl font-bold'>
                    W.M. Sl.No.
                  </TableHead>

                  <TableHead className=' text-black border-2 border-black bg-white text-2xl font-bold'>
                    Name of Workman
                  </TableHead>
                  {/* Table headers for each day */}

                  <TableHead className=' text-black border-2 border-black bg-white text-2xl font-bold'>
                    Bank A/c
                  </TableHead>

                  <TableHead className=' text-black border-2 border-black bg-white text-2xl font-bold'>
                    IFSC Code
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black bg-white text-2xl font-bold'>
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonusData.map((employee, index) => (
                  <TableRow key={employee._id} className=' h-16 '>
                    <TableCell className='border-black border-2 text-black'>
                      {index + 1}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee.employee.workManNo}
                    </TableCell>

                    <TableCell className='border-black border-2 text-black'>
                      {employee.employee.name}
                    </TableCell>
                    {/* Table data for each day (status) */}
                    <TableCell className='border-black border-2 text-black'>
                      {employee.employee.accountNumber}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee.employee.bank.ifsc}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.leave?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </PDFTable>
          </div>
        )}
        {!bonusData && <div className='text-red'>NO DATA AVAILABLE</div>}
      </div>
    </div>
  );
};

export default Page;

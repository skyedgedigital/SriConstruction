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

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const [attendanceData, setAttendanceData] = useState(null);

  const contentRef = React.useRef(null);
 const reactToPrintFn = useReactToPrint({ contentRef,
  documentTitle:`FormXVII/${searchParams.year}`, })
 const handleOnClick = async () => {
  if(!attendanceData){
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
    const pdf = new jsPDF('l', 'pt', 'a4'); // Create a landscape PDF
    const ogId = `${searchParams.month}/${searchParams.year}`;

    // Create a container element to hold the content and table

    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;

    // Append the table to the container element

    tableElement.style.width = '1250px';

    pdf.html(tableElement, {
      callback: async () => {
        pdf.save(`${ogId}form17.pdf`);
        const pdfDataUrl = pdf.output('dataurlstring');
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.45 },
      autoPaging: 'text',
    });
  };

  console.log('yeich toh hain', searchParams);

  useEffect(() => {
    const fn = async () => {
      try {
        setAttendanceData(null);
        // @ts-ignore
        const month = parseInt(searchParams.month);
        // @ts-ignore
        const year = parseInt(searchParams.year);

        console.log('shaiaiijsjs');

        const response = await wagesAction.FETCH.fetchFilledWages(
          month,
          year,
          searchParams.wo
        );
        console.log('ye kya response hai', response);
        if (response?.success) {
          toast.success(response.message);
          const responseData = JSON.parse(response.data);
          const parsedData = responseData.map((item) => ({
            ...item, // Spread operator to copy existing properties
            otherCashDescription: JSON.parse(item.otherCashDescription),
            otherDeductionDescription: JSON.parse(
              item.otherDeductionDescription
            ),
          }));
          setAttendanceData(parsedData);

          console.log('aagya response', parsedData);
        } else {
          const errobj = await JSON.parse(response?.error);
          const mess = errobj.message ? errobj.message : 'Kya yaar';
          console.error('arrree muaa', JSON.parse(response?.error));
          console.error('arrree miiaa', mess);
          console.error('arrree minniaa', errobj);
          // console.error('arrree wuuuu', response.error);

          toast.error(response.message);
        }
      } catch (error) {
        toast.error('Internal Server Error');
        console.error('Internal Server Error:', error);
      }
    };
    fn();
  }, []);
  console.log('sahi h bhai');

  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array of days (1 to 31)

  return (
    <div className='ml-[80px]'>
      <div className='flex gap-2 mb-2'>
      <Button onClick={handleDownloadPDF}>Download PDF</Button>
      <Button onClick={handleOnClick}>Print</Button> 
      </div>

      <div id={`${searchParams.month}/${searchParams.year}`}
      ref={contentRef}>
        <div
          className='container left-0 right-0 bg-white  overflow-hidden font-mono  w-[1600px]'
          id='container-id'
        >
          <div className='px-2 py-6 text-center  '>
            <h2 className='text-xl font-bold text-blue-700   '>FORM XVII</h2>
            <p className='text-blue-600 font-bold mt-2 '>
              [See rule 78 (2) (a)]
            </p>
            <h1 className=' font-bold text-blue-600'>REGISTER OF WAGES</h1>
          </div>
          <div className='flex justify-between mx-0 font-bold'>
            <div className='flex flex-col'>
              <div className='flex gap-3 mb-4 '>
                <div className='font-bold text-blue-600 max-w-64 '>
                  Name and Address of Contractor:
                </div>
                <div>Sri construction and Co.</div>
              </div>
              <div className='flex gap-3 mb-4'>
                <div className='font-bold text-blue-600  '>
                  Name and Location of work:
                </div>
                <div className='uppercase '>
                  &nbsp;&nbsp;&nbsp;{searchParams?.location}
                </div>
              </div>
            </div>
            <div className='flex flex-col'>
              <div className='flex gap-3 mb-4'>
                <div className='font-bold text-blue-600 max-w-96 '>
                  Name and Address of Establishment in/ under which Contract is
                  carried on:
                </div>
                <div className='uppercase'>{searchParams?.employer}</div>
              </div>
              <div className='flex gap-3 mb-4'>
                <div className='font-bold text-blue-600'>
                  Name and Address of Principal Employer:
                </div>
                <div className='uppercase'>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{searchParams?.employer}
                </div>
              </div>
            </div>
          </div>
          <h1 className='font-bold mb-4 text-blue-600 text-center'>{`Wages Period ${searchParams.year}-0${searchParams.month}`}</h1>
          <div></div>
        </div>

        {attendanceData && (
          <div>
            <PDFTable className='border-2 border-black  '>
              <TableHeader className=' py-8 h-24 overflow-auto  '>
                <TableRow className='font-mono h-24 '>
                  <TableHead
                    className=' text-black border-2 border-black'
                    colSpan={7}
                  ></TableHead>
                  <TableHead
                    className=' text-black border-2 border-black text-center'
                    colSpan={4}
                  >
                    AMOUNT OF WAGES EARNED
                  </TableHead>
                  <TableHead
                    className=' text-black border-2 border-black'
                    colSpan={1}
                  ></TableHead>

                  <TableHead
                    className=' text-black border-2 border-black text-center'
                    colSpan={3}
                  >
                    Deduction, if any (indicate nature)
                  </TableHead>
                  <TableHead
                    className=' text-black border-2 border-black'
                    colSpan={6}
                  ></TableHead>
                </TableRow>

                <TableRow className='text-black font-mono h-28'>
                  <TableHead className=' text-black border-2 border-black'>
                    Serial No.
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Name of Workman
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Serial No. in register of Workman
                  </TableHead>
                  {/* Table headers for each day */}

                  <TableHead className=' text-black border-2 border-black'>
                    Designation/nature of work done
                  </TableHead>

                  <TableHead className=' text-black border-2 border-black'>
                    No of days worked
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Units of work done
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black tracking-normal'>
                    Daily rate of wages/Piece rate
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Basic Wages
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Dearness Allowance
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Overtime
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Other cash payments
                  </TableHead>
                  {/* <TableHead className=' text-black border-2 border-black'>Other Allowances</TableHead> */}

                  <TableHead className=' text-black border-2 border-black'>
                    Total
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    P.F.
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    E.S.I.
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Others
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Net Amount Paid
                  </TableHead>
                  <TableHead className="text-black border-2 border-black">Total Allowance</TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Signature/Thumb impression of workman
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Initial of contract or his representative
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Signature of contractor or his representative
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData?.map((employee, index) => (
                  <TableRow key={employee._id} className=' h-16 '>
                    <TableCell className='border-black border-2 text-black'>
                      {index + 1}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.employee.name}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.employee.code}
                    </TableCell>
                    {/* Table data for each day (status) */}
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.designation.designation}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.attendance}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      <div>
                        {`${employee?.designation.basic} + ${employee?.designation.DA}`}
                      </div>
                      <div className='border-t-2 border-black text-left mt-1'>
                        {employee?.designation.PayRate}
                      </div>
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {(
                        employee?.designation.basic * employee?.attendance
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {(
                        employee?.designation.DA * employee?.attendance
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      0{' '}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {(employee?.otherCash).toFixed(2)}
                    </TableCell>
                    {/* <TableCell className='border-black border-2 text-black'>
                  {employee.allowances}
                  </TableCell> */}
                    <TableCell className='border-black border-2 text-black'>
                      {(employee?.total).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {(0.12 * employee?.total).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {(0.0075 * employee?.total).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.otherDeduction}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.netAmountPaid.toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>{Number(employee?.otherCashDescription?.ca)+Number(employee?.otherCashDescription?.eoc)+Number(employee?.otherCashDescription?.hra)+Number(employee?.otherCashDescription?.incumb)+Number(employee?.otherCashDescription?.ma)+Number(employee?.otherCashDescription?.mob)+Number(employee?.otherCashDescription?.oa)+Number(employee?.otherCashDescription?.pb)+Number(employee?.otherCashDescription?.ssa)+Number(employee?.otherCashDescription?.wa)}</TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </PDFTable>
          </div>
        )}
        {!attendanceData && (
          <div className='text-red'>NO ATTENDANCE DATA AVAILABLE</div>
        )}
      </div>
    </div>
  );
};

export default Page;

'use client';

import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Separator } from '@/components/ui/separator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
import { FaWindows } from 'react-icons/fa6';
import WorkOrderHr from '@/lib/models/HR/workOrderHr.model';
import { IEnterprise } from '@/interfaces/enterprise.interface';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [ent, setEnt] = useState<IEnterprise | null>(null);

  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `FormXVI/${searchParams.year}`,
  });
  const handleOnClick = async () => {
    if (!attendanceData) {
      toast.error('Attendance data not available for Print generation.');
      return;
    }
    reactToPrintFn();
  };
  useEffect(() => {
    const fn = async () => {
      const resp = await fetchEnterpriseInfo();
      console.log('response we got ', resp);
      if (resp.data) {
        const inf = await JSON.parse(resp.data);
        setEnt(inf);
        console.log(ent);
      }
      if (!resp.success) {
        toast.error(
          `Failed to load enterprise details, Please Reload or try later. ERROR : ${resp.error}`
        );
      }
    };
    fn();
  }, []);
  const handleDownloadPDF = async () => {
    if (!attendanceData) {
      toast.error('Attendance data not available for PDF generation.');
      return;
    }

    await generatePDF(attendanceData);
  };

  const generatePDF = async (attendanceData: any) => {
    const pdf = new jsPDF('l', 'pt', 'a4'); // Create a landscape PDF
    const ogId = `${searchParams.month}/${searchParams.year}`;

    // Create a container element to hold the content and table

    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;

    // Append the table to the container element

    tableElement.style.width = '1250px';

    const cells = tableElement.querySelectorAll('td, th');
    cells.forEach((cell: any) => {
      cell.style.padding = '8px'; // Adds padding to each cell
      cell.style.fontSize = '18px';
    });

    pdf.html(tableElement, {
      callback: async () => {
        pdf.save(`${ogId}.pdf`);
        const pdfDataUrl = pdf.output('dataurlstring');
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.5 },
      autoPaging: 'text',
    });
  };

  console.log('yeich toh hain', searchParams);

  useEffect(() => {
    const fn = async () => {
      try {
        setAttendanceData(null);
        const data = {
          // @ts-ignore
          month: parseInt(searchParams.month),
          // @ts-ignore
          year: parseInt(searchParams.year),
          ...(searchParams.wo !== 'Default' && {
            workOrderHr: searchParams.wo,
          }),
        };
        console.log('shaiaiijsjs', data);
        const filter = await JSON.stringify(data);

        const response = await fetchAllAttendance(filter);
        //   console.log(JSON.parse(response.data))
        const responseData = JSON.parse(response.data);
        setAttendanceData(responseData);

        console.log('aagya response');
      } catch (error) {
        toast.error('Internal Server Error');
        console.error('Internal Server Error:', error);
      }
    };
    fn();
  }, []);
  console.log('sahi h bhai');

  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array of days (1 to 31)

  function calculateStatus(status: string) {
    if (status === 'Present') return 'P';
    else if (status === 'Absent') return 'A';
    else if (status === 'Casual Leave') return 'CL';
    else if (status === 'Festival Leave') return 'FL';
    else if (status === 'Earned Leave') return 'EL';
    else if (status === 'Half Day') return 'HD';
    else if (status === 'NH') return 'NH';
    else if (status === 'Not Paid') return 'O';
    else return '';
  }

  return (
    <div className='ml-[80px]'>
      <Button
        type='submit'
        value='FORMXVII'
        className='flex items-center gap-1 border-2 px-4 rounded right-2'
        onClick={() => {
          const query = {
            year: searchParams.year,
            month: searchParams.month,
            location: searchParams.location,
            employer: searchParams.employer,
            wo: searchParams.wo,
          };
          const queryString = new URLSearchParams(query).toString();
          window.open(`/hr/formXVII?${queryString}`, '_blank');
        }}
      >
        <>Generate FORMXVII</>
      </Button>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      <div id={`${searchParams.month}/${searchParams.year}`} ref={contentRef}>
        <div
          className='container left-0 right-0 bg-white  overflow-hidden font-mono  w-[1300px]'
          id='container-id'
        >
          <div className='px-2 py-6 text-center  '>
            <h2 className='text-xl font-bold text-blue-700   '>FORM XVI</h2>
            <p className='text-blue-600 font-bold mt-2 '>
              [See rule 78 (2) (a)]
            </p>
            <h1 className='font-bold text-blue-600'>MUSTER ROLL</h1>
          </div>
          <div className='flex justify-between mx-0 font-bold'>
            <div className='flex flex-col'>
              <div className='flex gap-3 mb-4 '>
                <div className='font-bold text-blue-600 max-w-64 '>
                  Name and Address of Contractor:
                </div>
                <div className=' max-w-96 '>
                  {ent?.name ? (
                    ent?.name
                  ) : (
                    <span className='text-red-500'>
                      No company found. Try by Reloading
                    </span>
                  )}
                  ,&nbsp;
                  {ent?.address ? (
                    ent?.address
                  ) : (
                    <span className='text-red-500'>
                      No address found. Try by Reloading
                    </span>
                  )}
                </div>
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
                  &nbsp;&nbsp;&nbsp;&nbsp;{searchParams?.employer}
                </div>
              </div>
            </div>
          </div>
          <h1 className='font-bold mb-4 text-blue-600 text-center'>{`For the Month of ${searchParams.year}-0${searchParams.month}`}</h1>
          <div></div>
        </div>

        {attendanceData && (
          <div>
            <div className=' font-medium text-blue-600 mb-4 '>
              P : Present, A : Absent, HD : Half Day, O: OFF, NH:
              National Holiday, EL: Earned Leave, CL: Casual Leave, FL: Festival
              Leave
            </div>

            <PDFTable className='border-2 border-black  '>
              <TableHeader className=' py-8 h-16 overflow-auto '>
                <TableRow>
                  <TableHead
                    className=' text-black border-2 border-black'
                    colSpan={3}
                  ></TableHead>{' '}
                  {/* Empty cells to align "Dates" */}
                  <TableHead
                    className=' text-black border-2 border-black text-center'
                    colSpan={days.length}
                  >
                    DATES
                  </TableHead>
                  <TableHead
                    className=' text-black border-2 border-black'
                    colSpan={2}
                  ></TableHead>{' '}
                  {/* Empty cells to align after "Dates" */}
                </TableRow>
                <TableRow className='text-black h-28 '>
                  <TableHead className=' text-black border-2 border-black'>
                    Serial No.
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Name of Worker
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Father Name
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Sex
                  </TableHead>

                  {/* Table headers for each day */}

                  {days.map((day) => (
                    <TableHead
                      key={day}
                      className=' text-black border-2 border-black'
                    >
                      {day}
                    </TableHead>
                  ))}
                  <TableHead className=' text-black border-2 border-black'>
                    Total Attendance
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Remarks
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((employee, index) => (
                  <TableRow key={employee?._id} className='h-16'>
                    <TableCell className='border-black border-2 text-black'>
                      {index + 1}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.employee?.name}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.employee?.fathersName}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.employee?.sex}
                    </TableCell>

                    {/* Table data for each day (status) */}
                    {days.map((day) => (
                      <TableCell
                        key={day}
                        className='border-black border-2 text-black'
                      >
                        {calculateStatus(
                          employee?.days.find((d) => d.day === day)?.status
                        )}
                      </TableCell>
                    ))}
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.days.filter((day) => day.status === 'Present')
                        .length +
                        employee?.days.filter(
                          (day) => day.status === 'Half Day'
                        ).length *
                          0.5 +
                        employee?.days.filter((day) => day.status === 'NH')
                          .length}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {`P: ${
                        employee?.days.filter((day) => day.status === 'Present')
                          .length
                      }, A: ${
                        employee?.days.filter((day) => day.status === 'Absent')
                          .length
                      }, O: ${
                        employee?.days.filter(
                          (day) => day.status === 'Not Paid'
                        ).length
                      }, EL: ${
                        employee?.days.filter(
                          (day) => day.status === 'Earned Leave'
                        ).length
                      },CL: ${
                        employee?.days.filter(
                          (day) => day.status === 'Casual Leave'
                        ).length
                      },FL: ${
                        employee?.days.filter(
                          (day) => day.status === 'Festival Leave'
                        ).length
                      }, HD: ${
                        employee?.days.filter(
                          (day) => day.status === 'Half Day'
                        ).length
                      }
                      , NH: ${
                        employee?.days.filter((day) => day.status === 'NH')
                          .length
                      }

                      `}
                    </TableCell>
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

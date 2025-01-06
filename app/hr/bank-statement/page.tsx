'use client';

import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useReactToPrint } from 'react-to-print';
import wagesAction from '@/lib/actions/HR/wages/wagesAction';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  PDFTable,
} from '@/components/ui/table';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [total, setTotal] = useState(0);
  const [missingDataWarning, setMissingDataWarning] = useState<
    String | undefined
  >('');
  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const handleOnClick = async () => {
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

  const generatePDF = async (attendanceData: any) => {
    const pdf = new jsPDF('l', 'pt', 'a4'); // Create a landscape PDF

    const pageWidth = pdf.internal.pageSize.getWidth(); // Get the width of the PDF page
    const pageHeight = pdf.internal.pageSize.getHeight(); // Get the height of the PDF page
    const ogId = `${searchParams.month}/${searchParams.year}`;

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
        //   console.log(JSON.parse(response.data))
        console.log('ui ma', response);
        if (response?.success) {
          toast.success(response.message);
          const responseData = JSON.parse(response.data);
          const parsedData = responseData
            .filter((item) => {
              if (searchParams.dept === 'All Departments') {
                return true; // Keep all items
              } else {
                return item.employee.department._id === searchParams.dept; // Filter based on department
              }
            })
            .map((item) => ({
              ...item, // Spread operator to copy existing properties
              otherCashDescription: JSON.parse(item.otherCashDescription),
              otherDeductionDescription: JSON.parse(
                item.otherDeductionDescription
              ),
            }));
          setAttendanceData(parsedData);
          const totalNetAmountPaid = parsedData.reduce(
            (total, item) => total + Math.round(item.netAmountPaid || 0),
            0
          );
          setTotal(totalNetAmountPaid.toFixed(0));
          console.log('aagya response', parsedData);
        } else {
          console.log('ui ma', response);
          console.error(response?.error);
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

  const exportToExcelHandler = async () => {
    console.log('first');
    const excelReportTitle = `Bank Statement for year: ${searchParams.year} month: ${searchParams.month} department: ${searchParams.dept}`;
    const rowsForTitle = [
      ['To'],
      ['The Branch Manager'],
      [
        `Regarding: Fund Transfer for Bank Payment ${
          months[parseInt(searchParams.month) - 1]
        }-${searchParams.year}`,
      ],
      [
        `This is to bring to your kind attention that I issued a self cheque of Rs.${total} vide Cheque No.`,
      ],
      [
        `I wish to transfer this amount to the following accounts. Details of which are given below:`,
      ],
      [`Respected Sir,`],
      [][excelReportTitle],
      [],
    ];
    const worksheetData = attendanceData.map((employee, index) => {
      return {
        'Sl No.': index + 1,
        'W.M. Sl.No.': employee.employee.workManNo || '',
        'Name of Workman.': employee.employee.name || '',
        'Bank A/c': employee.employee.accountNumber || '',
        'IFSC Code': employee.employee.bank.ifsc || 0,
        Amount: Math.round(employee.netAmountPaid.toFixed(2)),
      };
    });
    const combinedExcelRows = rowsForTitle.concat(
      XLSX.utils.sheet_to_json(XLSX.utils.json_to_sheet(worksheetData), {
        header: 1,
      })
    );

    const worksheet = XLSX.utils.aoa_to_sheet(combinedExcelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Statement');
    XLSX.writeFile(
      workbook,
      `Bank_Statement_${searchParams.month || ''}_${
        searchParams.year || ''
      }.xlsx`
    );
    toast.success('Export Completed');
  };

  const warnMissingData = () => {
    if (missingDataWarning) return;
    setMissingDataWarning(
      'Some data is missing in the table. Please make sure all the required information is already saved before exporting the bank statement!'
    );
    return null;
  };
  return (
    <div>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      <div id={`${searchParams.month}/${searchParams.year}`} ref={contentRef}>
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
              <p>Regarding: Fund Transfer for Bank Payment</p>
              <p>{`${months[parseInt(searchParams.month) - 1]}-${
                searchParams.year
              }`}</p>
            </div>

            <div>
              <p className='mb-4'>Respected Sir,</p>
              <p className='mb-4'>
                This is to bring to your kind attention that I issued a self
                cheque of Rs.
                <span className=' mr-12 ml-2 font-bold'>{total}</span>
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
              {' '}
              {/* <div className=' font-bold'>Shekhar Enterprises.</div>
              <div className=' '>.H.NO 78 KAPLI NEAR HARI MANDIR,</div>
              <div className=' '>.PO KAPALI SARAIKEA,</div>
              <div className=' '>.KHARSWAN JHARKHAND.</div>{' '} */}
            </div>
            <div className='flex flex-col'>
              <h1 className='  mb-4  text-center'>{`Bank Statement for`}</h1>
              <h1 className='text-left  mb-4 '>{`${
                months[parseInt(searchParams.month) - 1]
              }-${searchParams.year}`}</h1>
            </div>
          </div>
        </div>

        {attendanceData?.length > 0 && (
          <div className='flex justify-between items-center mb-2'>
            {missingDataWarning && (
              <div className='bg-red-50 text-red-600 rounded px-4 py-2'>
                {missingDataWarning}
              </div>
            )}
            <Button
              disabled={!!missingDataWarning}
              className='mt-4 mb-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700'
              onClick={exportToExcelHandler}
            >
              Export to Excel
            </Button>{' '}
          </div>
        )}

        {attendanceData && (
          <div>
            <PDFTable className='border-2 border-black  '>
              <TableHeader className=' py-8 h-fit overflow-auto  '>
                <TableRow className='text-white bg-gray-600 hover:bg-gray-700 font-mono h-16'>
                  <TableHead className='  border-2 border-black text-white text-xl font-bold'>
                    Sl. No.
                  </TableHead>
                  <TableHead className='  border-2 border-black text-white text-xl font-bold'>
                    W.M. Sl.No.
                  </TableHead>

                  <TableHead className='  border-2 border-black text-white text-xl font-bold'>
                    Name of Workman
                  </TableHead>
                  {/* Table headers for each day */}

                  <TableHead className='  border-2 border-black text-white text-xl font-bold'>
                    Bank A/c
                  </TableHead>

                  <TableHead className='  border-2 border-black text-white text-xl font-bold'>
                    IFSC Code
                  </TableHead>
                  <TableHead className='  border-2 border-black text-white text-xl font-bold'>
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData?.map(
                  (employee, index) =>
                    employee.employee && (
                      <TableRow key={employee._id} className=' h-fit '>
                        <TableCell className='border-black border-2 text-black text-lg '>
                          {index + 1}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black text-lg'>
                          {employee?.employee?.workManNo ? (
                            <p>{employee?.employee?.workManNo}</p>
                          ) : (
                            <p className='text-red-500'>
                              N/A{warnMissingData()}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className='border-black border-2 text-black text-lg'>
                          {employee?.employee?.name ? (
                            <p>{employee?.employee?.name}</p>
                          ) : (
                            <p className='text-red-500'>
                              N/A {warnMissingData()}
                            </p>
                          )}
                        </TableCell>
                        {/* Table data for each day (status) */}
                        <TableCell className='border-black border-2 text-black text-lg'>
                          {employee?.employee?.accountNumber ? (
                            <p>{employee?.employee?.accountNumber}</p>
                          ) : (
                            <p className='text-red-500'>
                              N/A {warnMissingData()}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black text-lg'>
                          {employee?.employee?.bank?.ifsc ? (
                            <p>{employee?.employee?.bank?.ifsc}</p>
                          ) : (
                            <p className='text-red-500'>
                              N/A {warnMissingData()}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black text-lg'>
                          {employee?.netAmountPaid ? (
                            Math.round(employee?.netAmountPaid?.toFixed(2))
                          ) : (
                            <p className='text-red-500'>
                              N/A {warnMissingData()}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                )}
              </TableBody>
            </PDFTable>
          </div>
        )}
        {!attendanceData && <div className='text-red'>NO DATA AVAILABLE</div>}
      </div>
    </div>
  );
};

export default Page;

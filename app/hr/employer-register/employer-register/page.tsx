'use client';
import { Button } from '@/components/ui/button';
import {
  PDFTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import jsPDF from 'jspdf';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

const Page = () => {
  const searchParams = useSearchParams();
  const year = parseInt(searchParams.get('year'));
  const month = parseInt(searchParams.get('month'));
  const workOrder = searchParams.get('workOrder');
  const workOrderName = searchParams.get('workOrderName');
  const contentRef = React.useRef(null);

  const monthName = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const compliancesByMonthYear =
        await EmployeeDataAction.FETCH.fetchCompliances(month, year);
      const success = compliancesByMonthYear.success;
      console.log('this i have got', JSON.parse(compliancesByMonthYear.data));

      if (success) {
        const allData = JSON.parse(compliancesByMonthYear.data);
        console.log('Got the Complience Data', allData);
        console.log('work order number', workOrder);
        setData(
          allData
            .filter(
              (item) =>
                item.workOrderHr._id === workOrder && item.employee != null
            )
            .map((item, index) => ({
              sl: index + 1,
              workmanSlNo: item.employee.workManNo || '',
              name: item.employee.name || '',
              designation: item.designation.designation || '',
              daysWorked: item.attendance || 0,
              NH: 0, // NH might be the incentiveDays if applicable
              rate: parseFloat(item.payRate) || 0,
              basicAndDA: parseFloat(item.basic) + parseFloat(item.DA) || 0,
              otherPayment: parseFloat(item.otherCash) || 0,
              incentive: item.incentiveAmount || 0,
              grossPayment: Math.round(item.total) || 0,
              pf:
                Math.round(
                  0.13 *
                    (Number(item.attendance) * Number(item.payRate) +
                      Number(item.otherCash))
                ) || 0, // Assuming 12% PF
              esi: item.employee?.ESICApplicable
                ? Math.round(0.0325 * item.total)
                : 0,
            }))
        );
        if (allData.length == 0) {
          toast.error('No Compliences record found for this Month and Year');
          setLoading(false);
        }
        setLoading(false);
      } else {
        toast.error('Can not fetch compliences data!');
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    console.log('Changed data', data);
  }, [data]);

  const calculateTotal = (key) => {
    return data.reduce((acc, row) => acc + row[key], 0).toFixed(2);
  };

  const generatePDF = async (fdata) => {
    const pdf = new jsPDF('l', 'pt', 'a4'); // Create a landscape PDF
    const ogId = `Compliences-Register`;
    // Create a container element to hold the content and table

    const originalElement = document.getElementById(ogId);
    const tableElement = originalElement.cloneNode(true) as HTMLElement;

    // Append the table to the container element

    tableElement.style.width = '1250px';

    pdf.html(tableElement, {
      callback: async () => {
        pdf.save(`${ogId}.pdf`);
        const pdfDataUrl = pdf.output('dataurlstring');
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.6 },
      autoPaging: 'text',
    });
  };

  const handleDownloadPDF = async () => {
    if (!data) {
      toast.error('Compliences data not available for PDF generation.');
      return;
    }

    await generatePDF(data);
  };

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `ComplienceData`,
  });

  const handleOnClick = async () => {
    if (!data) {
      toast.error('Compliences data not available for Print generation.');
      return;
    }
    reactToPrintFn();
  };

  return (
    <>
      <div className='flex gap-2 mb-2 ml-[80px]'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      <div ref={contentRef} id='Compliences-Register'>
        <div className='flex justify-center items-center'>
          <h1 className='text-xl font-bold'>
            4700024707 FORM I Compliance Clearance Breakup for the month of{' '}
            {monthName[month - 1]} - {year}.
          </h1>
        </div>
        <div className='flex ml-[80px] mt-2 w-[90%] justify-center'>
          <div className='pl-[90px]'>
            <p>
              JMR no: {workOrderName} - {month}
            </p>
          </div>
          {/* <div className="pl-[90px]">        
          <p>Work Order: {workOrderName}</p>
        </div> */}
        </div>
        {!loading && data.length > 0 ? (
          <div className='p-4 ml-[80px]'>
            <PDFTable className='border-2 border-black w-full'>
              <TableHeader>
                <TableRow className='text-black font-bold h-14 text-center'>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    Sl No.
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    Name of Workman
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    Workman Sl No.
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    Designation
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    Days Worked
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    NH
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    Rate
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    Basic and DA
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    Other Payment
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    Incentive
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    Gross Payment
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    PF
                  </TableHead>
                  <TableHead className='border-2 border-black px-4 py-2'>
                    ESI
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} className='text-center h-12'>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.sl}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.name}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.workmanSlNo}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.designation}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.daysWorked}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.NH}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.rate}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.basicAndDA?.toFixed(2)}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.otherPayment?.toFixed(2)}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.incentive?.toFixed(2)}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.grossPayment?.toFixed(2)}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.pf?.toFixed(2)}
                    </TableCell>
                    <TableCell className='border-2 border-black px-4 py-2'>
                      {row.esi?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className='font-semibold bg-gray-200 text-center h-14'>
                  <TableCell
                    className='border-2 border-black px-4 py-2'
                    colSpan={4}
                  >
                    Total
                  </TableCell>
                  <TableCell className='border-2 border-black px-4 py-2'>
                    {calculateTotal('daysWorked')}
                  </TableCell>
                  <TableCell className='border-2 border-black px-4 py-2'>
                    {calculateTotal('NH')}
                  </TableCell>
                  <TableCell className='border-2 border-black px-4 py-2'></TableCell>
                  <TableCell className='border-2 border-black px-4 py-2'>
                    {calculateTotal('basicAndDA')}
                  </TableCell>
                  <TableCell className='border-2 border-black px-4 py-2'>
                    {calculateTotal('otherPayment')}
                  </TableCell>
                  <TableCell className='border-2 border-black px-4 py-2'>
                    {calculateTotal('incentive')}
                  </TableCell>
                  <TableCell className='border-2 border-black px-4 py-2'>
                    {calculateTotal('grossPayment')}
                  </TableCell>
                  <TableCell className='border-2 border-black px-4 py-2'>
                    {calculateTotal('pf')}
                  </TableCell>
                  <TableCell className='border-2 border-black px-4 py-2'>
                    {calculateTotal('esi')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </PDFTable>
          </div>
        ) : !loading && data.length === 0 ? (
          <div className='flex flex-col justify-center items-center h-[400px]'>
            <h1 className='text-2xl'>No Data Found</h1>
          </div>
        ) : (
          <div className='flex flex-col justify-center items-center h-[400px]'>
            <Loader2 size={50} className='animate-spin' />
            <h1>Fetching Complience Report...</h1>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;

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
import wagesAction from '@/lib/actions/HR/wages/wagesAction';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';

import React, { useEffect, useState } from 'react';
import { parse } from 'path';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';
import { IEnterprise } from '@/interfaces/enterprise.interface';

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const [bonusData, setBonusData] = useState(null);

  const [totalAttendanceSum, setTotalAttendanceSum] = useState(0);
  const [totalNetAmountPaidSum, setTotalNetAmountPaidSum] = useState(0);
  const [totalBonusSum, setTotalBonusSum] = useState(0);
  const [workOrderNumbers, setWorkOrderNumbers] = useState(null);
  const [ent, setEnt] = useState<IEnterprise | null>(null);

  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
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
  const handleOnClick = async () => {
    if (!bonusData) {
      toast.error('Attendance data not available for Print generation.');
      return;
    }
    reactToPrintFn();
  };

  const handleDownloadPDF = async () => {
    if (!bonusData) {
      toast.error('Attendance data not available for PDF generation.');
      return;
    }

    await generatePDF(bonusData);
  };
  const handleClick = () => {
    const query = {
      year: searchParams.year,
      workOrder: searchParams.wo,
    };
    console.log('I am query', query);
    const queryString = new URLSearchParams(query).toString();
    window.open(`workOrdersList?${queryString}`, '_blank');
  };
  const generatePDF = async (bonusData) => {
    const pdf = new jsPDF('l', 'pt', 'a4'); // Create a landscape PDF
    const ogId = `Bonus-register/${searchParams.year}`;

    // Create a container element to hold the content and table
    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;
    console.log(tableElement);

    // Append the table to the container element
    tableElement.style.width = '1250px';
    tableElement.style.fontSize = '24px';

    pdf.html(tableElement, {
      callback: async () => {
        pdf.save(`${ogId}.pdf`);
        const pdfDataUrl = pdf.output('dataurlstring');
      },
      x: 10,
      y: 90, // Adjust the y position to accommodate the heading
      html2canvas: { scale: 0.6 },
      autoPaging: 'text',
    });
  };
  const calculateTotalWorkOrder = (employee) => {
    // Initialize an array to hold the count for each month (12 months)
    let workOrderArray = new Array();

    // Loop through each wage entry for the employee
    employee.wages.forEach((wage) => {
      if (wage.workOrderHr && !workOrderArray.includes(wage.workOrderHr)) {
        workOrderArray.push(wage.workOrderHr);
      }
    });

    // console.log(workOrderArray, "workOrderArray");

    return workOrderArray;
  };

  //   console.log('yeich toh hain', searchParams);

  useEffect(() => {
    const fn = async () => {
      try {
        setBonusData(null);
        const data = {
          // @ts-ignore
          year: parseInt(searchParams.year),
          workOrder: searchParams.wo,
          bonusPercentage: parseFloat(searchParams.bp),
        };
        console.log('shaiaiijsjs', data);
        const filter = await JSON.stringify(data);
        console.log(filter);

        const response = await wagesAction.FETCH.fetchWagesForFinancialYear(
          filter
        );
        const workOrderResp =
          await WorkOrderHrAction.FETCH.fetchAllWorkOrderHr();
        const success = workOrderResp.success;
        // const error = workOrderResp.error
        // const data = JSON.parse(workOrderResp.data)

        if (success) {
          const workOrderNumbers = JSON.parse(workOrderResp.data);
          setWorkOrderNumbers(workOrderNumbers);
          console.log('yeraaaa wowowowwoncjd', workOrderNumbers);
        } else {
          toast.error('Can not fetch work order numbers!');
        }

        //   console.log(JSON.parse(response.data))
        const responseData = JSON.parse(response.data);
        setBonusData(responseData);
        console.log('response aagya bawa', responseData);
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
      const totalAttendance = bonusData.reduce(
        (acc, employee) => acc + employee.totalAttendance,
        0
      );
      const totalNetAmountPaid = bonusData.reduce(
        (acc, employee) => acc + employee.totalNetAmountPaid,
        0
      );
      const totalBonus = bonusData.reduce(
        (acc, employee) => acc + employee.bonus,
        0
      );

      // Step 3: Update state with the calculated sums
      setTotalAttendanceSum(totalAttendance);
      setTotalNetAmountPaidSum(totalNetAmountPaid.toFixed(2));
      setTotalBonusSum(totalBonus.toFixed(2));
    }
  }, [bonusData]);

  console.log('sahi h bhai');
  const nextYear = parseInt(searchParams.year) + 1;
  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array of days (1 to 31)
  const months = [
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
    'jan',
    'feb',
    'mar',
  ];
  //issue in print function
  return (
    <div>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
        <Button onClick={handleClick}>WorkOrders List</Button>
      </div>

      <div id={`Bonus-register/${searchParams.year}`} ref={contentRef}>
        <div
          className='flex gap-4 p-0 container left-0 right-0  overflow-hidden font-mono w-full  mb-6'
          id='container-id'
        >
          <div className=' '>
            <h1 className='font-bold text-2xl'>FORM C</h1>

            <p className=''>
              Under Rule 4(d) of the Payment of Bonus Rules, 1965
            </p>
            <p className=''>
              Bonus Paid to Employees for the Accounting Year ending on the
            </p>
          </div>
          <div className='flex flex-col ml-4'>
            <div className='font-bold'>Name of Establishment</div>
            {ent?.name ? (
              <div className='uppercase'>{ent?.name}</div>
            ) : (
              <div className='text-red-500'>
                {' '}
                No company found. Try by Reloading
              </div>
            )}
            ,&nbsp;
            {ent?.address ? (
              <div>{ent?.address}</div>
            ) : (
              <div className='text-red-500'>
                {' '}
                No address found. Try by Reloading
              </div>
            )}
          </div>

          <div className='flex flex-col gap-2 ml-16 mb-6 '>
            <h1 className='font-bold underline text-center'>Bonus Register</h1>

            <div className=''>
              {`From Date:`}&nbsp;&nbsp;&nbsp;&nbsp;
              {`01-04-${searchParams.year}`}
            </div>
            <div className=''>
              {`To Date:`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {`30-03-${nextYear}`}
            </div>

            <div className=''>
              {`Order Number:`}&nbsp;&nbsp;{`${searchParams.wog}`}
            </div>
          </div>
        </div>

        {bonusData && (
          <PDFTable className='border-2 border-black  '>
            <TableHeader className=' py-8 h-16 overflow-auto '>
              <TableRow>
                <TableHead
                  className=' text-black border-2 border-black'
                  colSpan={7}
                ></TableHead>{' '}
                {/* Empty cells to align "Dates" */}
                <TableHead
                  className=' text-black border-2 border-black text-center'
                  colSpan={5}
                >
                  DEDUCTION
                </TableHead>
                <TableHead
                  className=' text-black border-2 border-black'
                  colSpan={4}
                ></TableHead>{' '}
                {/* Empty cells to align after "Dates" */}
              </TableRow>
              <TableRow className='text-black h-28 '>
                <TableHead className=' text-black border-2 border-black'>
                  Sl No.
                </TableHead>

                <TableHead className=' text-black border-2 border-black'>
                  Employee Name
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Father&apos;s Name
                </TableHead>
                {/* Table headers for each day */}

                <TableHead className=' text-black border-2 border-black'>
                  Whether he has letted 15 of Age at the beginning of the
                  Accounting Year
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Desg
                </TableHead>

                <TableHead className=' text-black border-2 border-black'>
                  No. of Days worked in the Year
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Total salary or wages in respec of Acc. Year
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Amount of bonus payable under Section 10 & 11 as the case may
                  be
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Puja bonus or other customary bonus paid during the Acc. Year
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Interim Bonus paid in advance
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Deduction on A/c of financial loss if any caused by Misconduct
                  of the Employee
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Total Sum deducted Col 9, 10, 11
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Net Payable Amount Col 8 minus Col 10
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Amount actually paid
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Date on which
                </TableHead>
                <TableHead className=' text-black border-2 border-black'>
                  Signature or thumb impression of employee
                </TableHead>
                {/* <TableHead className=" text-black border-2 border-black">
                  WorkOrder
                </TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonusData.map((employee, index) => {
                let workOrderArray = calculateTotalWorkOrder(employee);

                return (
                  <TableRow key={employee._id} className='h-16'>
                    <TableCell className='border-black border-2 text-black'>
                      {index + 1}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee.employee.name}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee.employee.fathersName}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {/* Empty cell or whatever you want */}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee.employee.designation_details[0]?.designation}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee.totalAttendance}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee.totalNetAmountPaid.toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee.bonus.toFixed(2)}
                    </TableCell>

                    <TableCell className='border-black border-2 text-black'></TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>

                    {/* Mapping over workOrderArray to render each month count */}

                    <TableCell className='border-black border-2 text-black'>
                      {employee.bonus.toFixed(2)}{' '}
                      {/* Duplicate for the last column? */}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee.bonus.toFixed(2)}{' '}
                      {/* Duplicate for the last column? */}
                    </TableCell>

                    <TableCell className='border-black border-2 text-black'>
                      {/* Empty cell or whatever you want */}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>
                    {/* <TableCell className="border-black border-2 text-black">
                    {workOrderArray.map((wo, monthIndex) => {
                      // Find the workOrderNumber that matches the current "wo"
                      const workOrder = workOrderNumbers.find(
                        (wn) => wn._id === wo
                      );
                      return (
                       <div
                          key={monthIndex}
                        >
                          <div>
                            {workOrder ? workOrder.workOrderNumber : null}
                          </div>
                          </div>
                      );
                    })}
                    </TableCell> */}
                  </TableRow>
                );
              })}

              {bonusData && bonusData?.length > 0 && (
                <TableRow className='h-16'>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'>
                    {totalAttendanceSum}
                  </TableCell>
                  <TableCell className=' text-black'>
                    {totalNetAmountPaidSum}
                  </TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'>{totalBonusSum}</TableCell>
                  <TableCell className=' text-black'></TableCell>
                  <TableCell className=' text-black'></TableCell>
                </TableRow>
              )}
            </TableBody>
          </PDFTable>
        )}
        {!bonusData && (
          <div className='text-red'>NO ATTENDANCE DATA AVAILABLE</div>
        )}
      </div>
    </div>
  );
};

export default Page;

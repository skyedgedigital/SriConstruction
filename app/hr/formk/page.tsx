'use client';

import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  PDFTable,
  TableFooter,
  TableCaption,
} from '@/components/ui/table';
import wagesAction from '@/lib/actions/HR/wages/wagesAction';
import { useReactToPrint } from 'react-to-print';

import React, { useEffect, useState } from 'react';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';
import { IEnterprise } from '@/interfaces/enterprise.interface';

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const [bonusData, setBonusData] = useState(null);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [attTotals, setAttTotals] = useState([]);
  const [modifiedBonusData, setModifiedBonusData] = useState([]);
  const [totalWorkOrder, setTotalWorkOrder] = useState([]);
  const [ent, setEnt] = useState<IEnterprise | null>(null);

  const contentRef = React.useRef(null);
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
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `FormK/${searchParams.year}`,
  });
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

  const generatePDF = async (bonusData) => {
    const pdf = new jsPDF('l', 'pt', 'a4'); // Create a landscape PDF
    const ogId = `FormK/${searchParams.year}`;

    // Create a container element to hold the content and table

    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement?.cloneNode(true) as HTMLElement;

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

  //   console.log('yeich toh hain', searchParams);

  function calculateMonthlyTotals(employees) {
    // Initialize an array to hold the sums for 12 months, starting from 0 for each month
    let monthlyTotals = new Array(12).fill(0); // Initialize with zeros for all months

    // Sum up each month's netAmountPaid for all employees
    employees.forEach((employee) => {
      employee.wages.forEach((wage) => {
        // Calculate the correct month index (Apr = 0, May = 1, ..., Mar = 11)
        const monthIndex = (wage.month - 4 + 12) % 12; // Adjust to financial year (April is index 0)

        // Add the netAmountPaid for the corresponding month
        monthlyTotals[monthIndex] += parseFloat(wage.netAmountPaid); // Accumulate the netAmountPaid
      });
    });

    console.log(monthlyTotals, 'netAmount vala'); // Debugging: Check the totals for each month

    // Convert each total to a string with two decimal places (toFixed(2))
    return monthlyTotals.map((total) => total.toFixed(2));
  }

  function calculateAttTotals(employees) {
    // Initialize an array to hold the sums for 12 months (index 0 = Apr, 11 = Mar)
    let monthlyTotals = new Array(12).fill(0); // Initialize with zeros

    // Iterate through each employee and their wages
    employees.forEach((employee) => {
      employee.wages.forEach((wage) => {
        // Get the index for the month in the financial year (Apr = 0, Mar = 11)
        const monthIndex = (wage.month - 4 + 12) % 12; // Adjust for financial year (April is index 0)

        // Add the attendance to the correct month index if it exists for the employee
        monthlyTotals[monthIndex] += wage.attendance;
      });
    });

    console.log(monthlyTotals, 'monthlyTotals'); // Check the result

    // Return the aggregated attendance for all months
    return monthlyTotals;
  }

  function calculateBonusTotals(employees) {
    // Initialize an array to hold the sums for 12 months
    let monthlyTotals = 0;

    // Sum up each month's netAmountPaid for all employees

    employees.forEach((wage, index) => {
      monthlyTotals += wage.bonus;
    });

    // Convert each total to a string with two decimal places
    return monthlyTotals.toFixed(2);
  }

  const calculateTotalWorkOrder = (employees) => {
    // Initialize an array to hold the count for each month (12 months)
    let workOrderArray = new Array(12).fill(0);

    // Loop through each employee's wages
    employees.forEach((employee) => {
      // Loop through each wage entry for the employee
      employee.wages.forEach((wage) => {
        // Calculate the correct month index (Apr = 0, May = 1, ..., Mar = 11)
        const monthIndex = (wage.month - 4 + 12) % 12;

        // Check if 'workOrderHr' exists and is not an empty string
        if (wage.workOrderHr && wage.workOrderHr.trim() !== '') {
          // Increment the count for the corresponding month
          workOrderArray[monthIndex]++;
        }
      });
    });

    console.log(workOrderArray, 'workOrderArray');

    return workOrderArray;
  };

  const calculateTotalWorkOrder2 = (employee) => {
    // Initialize an array to hold the count for each month (12 months)
    let workOrderArray = new Array(12).fill(0);

    // Loop through each wage entry for the employee
    employee.wages.forEach((wage) => {
      // Calculate the correct month index (Apr = 0, May = 1, ..., Mar = 11)
      const monthIndex = (wage.month - 4 + 12) % 12;

      // Check if 'workOrderHr' exists and is not an empty string
      if (wage.workOrderHr && wage.workOrderHr.trim() !== '') {
        // Check if workOrderHr has already been counted for the current month
        if (workOrderArray[monthIndex] === 0) {
          // If not counted, set to 1 (this is the first work order for this month)
          workOrderArray[monthIndex] = 1;
        } else {
          // If already counted, increment the count for this month
          workOrderArray[monthIndex]++;
        }
      }
    });

    console.log(workOrderArray, 'workOrderArray');

    return workOrderArray;
  };

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
        console.log('bonus data', data);
        const filter = await JSON.stringify(data);

        const response = await wagesAction.FETCH.fetchWagesForFinancialYear(
          filter
        );
        //   console.log(JSON.parse(response.data))
        console.log('yahaaan tak are kya');
        const responseData = JSON.parse(response.data);
        setBonusData(responseData);
        setMonthlyTotals(calculateMonthlyTotals(responseData));
        setAttTotals(calculateAttTotals(responseData));
        setTotalWorkOrder(calculateTotalWorkOrder(responseData));

        console.log('response aagya bawa', responseData);
        console.log('aagya response');
      } catch (error) {
        toast.error('Internal Server Error');
        console.log('Internal Server Error:', error);
      }
    };

    fn();
  }, []);
  console.log('sahi h bhai');

  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array of days (1 to 31)
  const months = [
    'Apr',
    'May',
    'Jun',
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
  const months2 = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

  const nextYear = parseInt(searchParams.year) + 1;

  console.log(modifiedBonusData, 'I am modifiedBonusData');

  const calculateTotalDays = (aggregatedWages) => {
    let totalDays: number = 0;
    for (let month in aggregatedWages) {
      totalDays += aggregatedWages[month].attendance;
    }
    return totalDays;
  };
  return (
    <div>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      <div id={`FormK/${searchParams.year}`} ref={contentRef}>
        {/* <div className='text-center text-3xl font-semibold mb-6  font-sans ' >
      <h1 className='mb-4 text-center'>Leave CheckList</h1>
      </div> */}
        <div
          className='flex items-center justify-between container left-0 right-0  overflow-hidden font-mono w-full border-2 border-black mb-6'
          id='container-id'
        >
          <div className='flex flex-col'>
            {ent?.name ? (
              <div className='uppercase'>{ent?.name},</div>
            ) : (
              <div className='text-red-500'>
                {' '}
                No company found. Try by Reloading
              </div>
            )}
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
            <h1 className='font-bold underline'>Form K</h1>

            <div className=''>
              {`From Date:`}&nbsp;&nbsp;&nbsp;&nbsp;
              {`01-04-${searchParams.year}`}
            </div>
            <div className=''>
              {`To Date:`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {`30-03-${nextYear}`}
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;</div>
            <div className='ml-16'>
              {`Order Number:`}&nbsp;&nbsp;&nbsp;&nbsp;{`${searchParams.wog}`}
            </div>
          </div>
        </div>

        {bonusData && (
          <>
            {' '}
            <PDFTable className='border-2 border-black  '>
              <TableHeader className=' py-8 h-fit overflow-auto '>
                <TableRow className='text-black h-fit '>
                  <TableHead className=' text-black border-2 border-black'>
                    Sl No.
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    W. No.
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Bonus payment sheet/Form C-S no.
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Employee Name
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Designation
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Gender
                  </TableHead>
                  {/* Table headers for each day */}
                  {months?.map((mon) => (
                    <TableHead
                      key={mon}
                      className=' text-black border-2 border-black p-0'
                    >
                      <div className='pt-2 text-center'>{mon}</div>
                      <div className='flex mt-2 justify-center items-center border-t-2 border-black w-full'>
                        <div className='border-r-2 border-black flex-grow p-1'>
                          Days
                        </div>
                        <div className='flex-grow p-1'>Wages</div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className='w-fit text-black border-2 border-black'>
                    <div className='pt-2 text-center'>Arrear</div>
                    <div className='pt-2 text-center'>Wages</div>
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Total Days
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Total Wages
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Bank Statement Sl. no
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Bank Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonusData.map((employee, index) => {
                  let workOrderArray = calculateTotalWorkOrder2(employee);
                  // Calculate aggregated wages per employee per month
                  console.log('employee details', employee);
                  const aggregatedWages = employee.wages.reduce((acc, wage) => {
                    if (acc[wage.month]) {
                      acc[wage.month].attendance += wage.attendance;
                      acc[wage.month].netAmountPaid += wage.netAmountPaid;
                    } else {
                      acc[wage.month] = {
                        attendance: wage.attendance,
                        netAmountPaid: wage.netAmountPaid,
                      };
                    }
                    return acc;
                  }, {});

                  // Convert to array for rendering
                  const aggregatedWagesArray = Object.keys(aggregatedWages).map(
                    (month) => ({
                      month,
                      ...aggregatedWages[month],
                    })
                  );

                  return (
                    <TableRow key={employee._id} className='h-16'>
                      <TableCell className='border-black border-2 text-black'>
                        {index + 1}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {employee.employee.workManNo}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {index + 1}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {employee.employee.name}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {
                          employee?.employee?.designation_details[0]
                            ?.designation
                        }
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {employee.employee.sex}
                      </TableCell>

                      {/* Render aggregated data for each month */}
                      {months2.map((month, monthIndex) => {
                        console.log(aggregatedWages, 'I am aggregatedWages');
                        const aggregatedWage = aggregatedWages[month];
                        return (
                          <TableCell
                            key={monthIndex}
                            className='border-black border-2 text-black'
                          >
                            <div className='flex mt-2 justify-center items-center w-full'>
                              <div className='border-r-2 border-black flex-grow p-1'>
                                {aggregatedWage?.attendance || 0}
                              </div>
                              <div className='flex-grow p-1'>
                                {aggregatedWage?.netAmountPaid.toFixed(2) ||
                                  '0.00'}
                              </div>
                            </div>
                          </TableCell>
                        );
                      })}

                      <TableCell className='border-black border-2 text-black'>
                        -
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {calculateTotalDays(aggregatedWages)}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {employee.totalNetAmountPaid.toFixed(2)}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {index + 1}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        BA
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* <TableRow className='h-16'>
                  <TableCell className='border-black border-2 text-black font-bold'>
                    Total
                  </TableCell>
                  <TableCell className='border-black border-2 text-black'></TableCell>
                  <TableCell className='border-black border-2 text-black'></TableCell>
                  <TableCell className='border-black border-2 text-black'></TableCell>
                  <TableCell className='border-black border-2 text-black'></TableCell>
                  <TableCell className='border-black border-2 text-black'></TableCell>
                  {attTotals.map((att, index) => (
                    <TableCell
                      key={index}
                      className='border-black border-2 text-black font-bold'
                    >
                      <div className='flex mt-2 justify-center items-center w-full'>
                        <div className='border-r-2 border-black flex-grow p-1'>
                          {att}
                        </div>
                        <div className='flex-grow p-1'>
                          {monthlyTotals[index] ? monthlyTotals[index] : 'NA'}
                        </div>
                      </div>
                    </TableCell>
                  ))}

                  <TableCell className='border-black border-2 text-black'>
                    -
                  </TableCell>
                  <TableCell className='border-black border-2 text-black'></TableCell>
                  <TableCell className='border-black border-2 text-black'></TableCell>
                  <TableCell className='border-black border-2 text-black'></TableCell>
                  <TableCell className='border-black border-2 text-black font-bold'>
                    {calculateBonusTotals(bonusData)}
                  </TableCell>
                </TableRow> */}
              </TableBody>
            </PDFTable>
            <div className='mt-4 font-bold'>
              {/* First line: April to August */}
              <div className='grid grid-cols-5 gap-4'>
                {monthlyTotals.slice(0, 5).map((total, index) => (
                  <div key={index} className=' p-2 text-left capitalize'>
                    {`${months[index]}`}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {`${total}`}
                  </div>
                ))}
              </div>
              {/* Second line: September to January */}
              <div className='grid grid-cols-5 gap-4 mt-2 '>
                {monthlyTotals.slice(5, 10).map((total, index) => (
                  <div key={index} className=' p-2 text-left capitalize '>
                    {`${months[index + 5]}`}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {`${total}`}
                  </div>
                ))}
              </div>
              {/* Third line: February and March */}
              <div className='grid grid-cols-5 gap-4 mt-2 capitalize'>
                {monthlyTotals.slice(10, 12).map((total, index) => (
                  <div key={index} className=' p-2 text-left'>
                    {`${months[index + 10]}`}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {`${total}`}
                  </div>
                ))}
                <div className=' p-2 text-left capitalize'>
                  {`Arrear`}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {`0.00`}
                </div>
                <div className=' p-2 text-left'>{`Arrear`}</div>
              </div>
            </div>
          </>
        )}
        {!bonusData && (
          <div className='text-red'>NO ATTENDANCE DATA AVAILABLE</div>
        )}
      </div>
    </div>
  );
};

export default Page;

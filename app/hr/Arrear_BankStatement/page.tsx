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
import wagesAction from '@/lib/actions/HR/wages/wagesAction';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';
import { IEnterprise } from '@/interfaces/enterprise.interface';

const Page = ({
  searchParams,
}: {
  searchParams: { [Key: string]: string | undefined };
}) => {
  const [yearlywages, setYearlyWages] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalAttendance, setTotalAttendance] = useState([]);
  const [atten, setTotalAtten] = useState(null);
  const [updateWageData, setUpdateWageData] = useState({});
  const [daStatus, setDAStatus] = useState(false);
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
    if (!yearlywages) {
      toast.error('Attendance data not available for Print generation.');
      return;
    }
    reactToPrintFn();
  };
  const handleDownloadPDF = async () => {
    if (!yearlywages) {
      toast.error('Attendance data not available for PDF generation.');
      return;
    }

    await generatePDF(yearlywages);
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

  console.log('yeich toh hain', searchParams);
  const startDate = searchParams.startDate;
  const [syear, smonth, sday] = startDate.split('-').map(Number); //these value are in String
  const endDate = searchParams.endDate;
  const [eyear, emonth, eday] = endDate.split('-').map(Number);

  // useEffect(() => {
  //   if (searchParams.modifiedWages) {
  //     setUpdateWageData(JSON.parse(searchParams.modifiedWages));
  //   }
  // }, [searchParams.modifiedWages]);

  const keys = Object.keys(updateWageData); // it's keys array
  console.log('keys', keys);
  useEffect(() => {
    let yearEdgeCase = false;
    if (smonth >= 1 && emonth <= 3 && syear === eyear) {
      yearEdgeCase = true;
    }
    const fn = async () => {
      setDAStatus(JSON.parse(searchParams.DA));
      try {
        setYearlyWages(null);

        const data = {
          year: yearEdgeCase ? syear - 1 : syear,
          workOrder: searchParams.workOrder,
          bonusPercentage: 0,
        };
        const filter = JSON.stringify(data);
        console.log(filter);
        //function call to retrive date in b/w start and end month
        const response = await wagesAction.FETCH.fetchWagesForFinancialYear(
          filter
        );

        const responseData = JSON.parse(response.data);
        //changed
        // const wagesArray = responseData.filter((employee)=>{
        //   return employee.employee.designation_details[0].designation === searchParams.Designation

        // })
        setYearlyWages(responseData);
        console.log('response aa gaya', responseData);
      } catch (err) {
        toast.error('Internal Server Error');
        console.log('Internal Server Error:', err);
      }
    };
    if (syear && searchParams.workOrder) {
      // Ensure required params are defined
      fn();
    }
  }, [syear, searchParams.workOrder, searchParams.Designation]);

  useEffect(() => {
    if (yearlywages) {
      const updatedAttendance = yearlywages.map((employee) => {
        const attendanceSum = employee?.wages
          .filter((wage) => {
            const { month, year } = wage;

            // Check if the wage entry falls within the specified date range, including cross-year scenarios
            return (
              (year > syear || (year === syear && month >= smonth)) &&
              (year < eyear || (year === eyear && month <= emonth))
            );
          })
          .reduce((total, wage) => total + (wage.attendance || 0), 0);

        return { ...employee, totalAtteinrange: attendanceSum };
      });

      setTotalAttendance(updatedAttendance);
    }
  }, [yearlywages, sday, smonth, syear, eday, emonth, eyear]);
  console.log(totalAttendance, 'I am totalAtt');
  const months = [
    'apr',
    'may',
    'jun',
    'july',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
    'Jan',
    'feb',
    'mar',
  ];

  const months2 = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

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
          <div
            className='container left-0 right-0 bg-white  overflow-hidden font-mono  w-[1300px]'
            id='container-id'
          >
            <div className='flex justify-start items-center p-4'>
              <div className='flex justify-around font-bold p-4 w-[85%] border-2 border-black '>
                <div className='flex gap-3 '>
                  <div className='font-bold text-blue-600 max-w-64 '>
                    Name and Address of Contractor:
                  </div>
                  <div className='flex flex-col mb-4'>
                    <div>
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
                </div>

                <div className='flex flex-col gap-2'>
                  <span className='font-bold  text-blue-600 px-4 '>{`From ${sday}/${smonth}/${syear} `}</span>
                  <span className='font-bold  text-blue-600 px-4'>{`TO ${eday}/${emonth}/${eyear}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {yearlywages && (
          <div className='mt-4'>
            <PDFTable className='border-2 border-black  '>
              <TableHeader className=' py-8 h-24 overflow-auto  '>
                <TableRow className='text-black font-mono h-28'>
                  <TableHead className=' text-black border-2 border-black bg-white text-xl font-bold'>
                    Sl. No.
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black bg-white text-xl font-bold'>
                    W.M. Sl.No.
                  </TableHead>

                  <TableHead className=' text-black border-2 border-black bg-white text-xl font-bold'>
                    Name of Workman
                  </TableHead>
                  {/* Table headers for each day */}

                  <TableHead className=' text-black border-2 border-black bg-white text-xl font-bold'>
                    Bank A/c
                  </TableHead>

                  <TableHead className=' text-black border-2 border-black bg-white text-xl font-bold'>
                    IFSC Code
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black bg-white text-xl font-bold'>
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totalAttendance.map((employee, index) => {
                  const CurrentWage =
                    Number(employee.employee.designation_details[0].basic) +
                    (daStatus
                      ? Number(employee.employee.designation_details[0].DA)
                      : 0);

                  const LastWage =
                    Number(employee.employee.designation_details[0].OldBasic) +
                    (daStatus
                      ? Number(employee.employee.designation_details[0].OldDA)
                      : 0);

                  const WageDiff = CurrentWage - LastWage;

                  const Total =
                    WageDiff * employee?.totalAtteinrange +
                    (daStatus
                      ? Number(employee.employee.designation_details[0].DA) *
                        Number(employee?.totalAtteinrange)
                      : 0) +
                    (employee.employee?.otherCash
                      ? employee.employee?.otherCash
                      : 0.0);

                  return (
                    <TableRow key={employee._id} className=' h-16 '>
                      <TableCell className='border-black border-2 text-black text-lg '>
                        {index + 1}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black text-lg'>
                        {employee.employee.workManNo}
                      </TableCell>

                      <TableCell className='border-black border-2 text-black text-lg'>
                        {employee.employee.name}
                      </TableCell>
                      {/* Table data for each day (status) */}
                      <TableCell className='border-black border-2 text-black text-lg'>
                        {employee.employee.accountNumber}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black text-lg'>
                        {employee.employee.bank.ifsc}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black text-lg'>
                        {/* {keys.map((key, index) => {
                          // Skip iteration if employee ID does not match the current key
                          if (key !== employee?.employee._id) {
                            return null;
                          }

                          // Calculate the difference when the employee ID matches
                          const difference =
                            Number(
                              updateWageData[employee?.employee._id] || 0
                            ) +
                            Number(
                              employee.employee.designation_details[0]?.DA || 0
                            ) -
                            (Number(
                              employee.employee.designation_details[0].basic ||
                                0
                            ) +
                              Number(
                                employee.employee.designation_details[0].DA || 0
                              ));

                          // Return 0 if difference is negative; otherwise, return the actual difference
                          const finalDifference =
                            difference < 0 ? 0 : difference;

                          // Render the calculated difference for matching ID
                          return <span key={index}>{(Number((finalDifference*employee?.totalAtteinrange))-((Number(0.12*(finalDifference*employee?.totalAtteinrange)))+ Number(0.0075*(finalDifference*employee?.totalAtteinrange)))).toFixed(2)}</span>;
                        })} */}
                        {(
                          Total -
                          (0.12 * Total + 0.0075 * Total) -
                          (employee.employee?.otherDeduction
                            ? employee.employee?.otherDeduction
                            : 0)
                        ).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </PDFTable>
          </div>
        )}
        {!yearlywages && <div className='text-red'>NO DATA AVAILABLE</div>}
      </div>
    </div>
  );
};

export default Page;

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
import React, { useEffect, useState } from 'react';
import Designation from '@/lib/models/HR/designation.model';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';
import { IEnterprise } from '@/interfaces/enterprise.interface';

//Expected Query Params -> start date, end date,workOrder.
const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const [yearlywages, setYearlywages] = useState(null);
  const [totalAttendance, setTotalAttendance] = useState([]);
  const [updateWageData, setUpdateWageData] = useState({});
  const [daStatus, setDAStatus] = useState(null);
  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
  });
  const [ent, setEnt] = useState<IEnterprise | null>(null);

  const handleOnClick = async () => {
    if (!yearlywages) {
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
    if (!yearlywages) {
      toast.error('Attendance data not available for PDF generation.');
      return;
    }

    await generatePDF(yearlywages);
  };

  const generatePDF = async (yearlywages) => {
    const pdf = new jsPDF('l', 'pt', 'a4'); // Create a landscape PDF
    const ogId = `${smonth}/${syear}`;

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

  console.log('Search Params', searchParams);

  const startDate = searchParams.startDate;
  const [syear, smonth, sday] = startDate.split('-').map(Number); //these value are in String
  const endDate = searchParams.endDate;
  const [eyear, emonth, eday] = endDate.split('-').map(Number);

  useEffect(() => {
    if (searchParams.modifiedWages) {
      setUpdateWageData(JSON.parse(searchParams.modifiedWages));
    }
  }, [searchParams.modifiedWages]);

  const keys = Object.keys(updateWageData); // it's keys array
  console.log('keys', keys);

  useEffect(() => {
    const fn = async () => {
      setDAStatus(JSON.parse(searchParams.DA));
      try {
        let yearEdgeCase = false;
        if (smonth >= 1 && emonth <= 3 && syear === eyear) {
          yearEdgeCase = true;
        }
        setYearlywages(null);
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
        //change as demand
        // const wagesArray = responseData.filter((employee)=>{
        //   return employee.employee.designation_details[0].designation === searchParams.Designation

        // })
        setYearlywages(responseData);
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
  }, [syear, searchParams.workOrder, searchParams.designation]);

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

  return (
    <div className='ml-[80px]'>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      <div id={`${smonth}/${syear}`} ref={contentRef}>
        <div
          className='container left-0 right-0 bg-white  overflow-hidden font-mono  w-[1600px]'
          id='container-id'
        >
          <div className='px-2 py-6 text-center  '>
            <h2 className='text-xl font-bold text-blue-700   '>FORM XVII</h2>
            <p className='text-blue-600 font-bold mt-2 '>
              [See rule 78 (2) (a)]
            </p>
            <h1 className=' font-bold text-blue-600'>Arrear Register</h1>
          </div>
          <div className='flex justify-between mx-0 font-bold'>
            <div className='flex flex-col'>
              <div className='flex gap-3 mb-4 '>
                <div className='font-bold text-blue-600 max-w-64 '>
                  Name and Address of Contractor:
                </div>
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
          <h1 className='font-bold mb-4 text-blue-600 text-center'>{`From ${searchParams.startDate} TO ${searchParams.endDate}`}</h1>
          <div></div>
        </div>

        {totalAttendance && (
          <div>
            <PDFTable className='border-2 border-black  '>
              <TableHeader className=' py-8 h-24 overflow-auto  '>
                <TableRow className='font-mono h-24 '>
                  <TableHead
                    className=' text-black border-2 border-black'
                    colSpan={8}
                  ></TableHead>
                  <TableHead
                    className=' text-black border-2 border-black text-center'
                    colSpan={3}
                  >
                    AMOUNT OF WAGES Earned
                  </TableHead>
                  <TableHead
                    className=' text-black border-2 border-black'
                    colSpan={2}
                  ></TableHead>

                  <TableHead
                    className=' text-black border-2 border-black text-center'
                    colSpan={3}
                  >
                    Deduction, if any (indicate nature)
                  </TableHead>
                  <TableHead
                    className=' text-black border-2 border-black'
                    colSpan={4}
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
                    New Rates
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black tracking-normal'>
                    Old Rates
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black tracking-normal'>
                    Diff Rates
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Basic Wages
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    DA
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
                {totalAttendance?.map((employee, index) => {
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
                        {employee.employee.designation_details[0].designation}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {employee?.totalAtteinrange}
                      </TableCell>

                      <TableCell className='border-black border-2 text-black'>
                        {/* <div>
                        {keys.includes(employee?.employee._id)
                          ? `${updateWageData[employee?.employee._id]}  + 
                          ${employee.employee.designation_details[0]?.DA}`
                          : `0 
                        + ${employee.employee.designation_details[0]?.DA}`}
                      </div>
                      <div className="border-t-2 border-black text-left mt-1">
                        {keys.includes(employee?.employee._id)
                          ? (
                              Number(updateWageData[employee?.employee._id]) +
                              Number(
                                employee.employee.designation_details[0]?.DA
                              )
                            ).toFixed(2)
                          : Number(
                              employee.employee.designation_details[0]?.DA
                            )}
                      </div> */}
                        <div>
                          {employee.employee.designation_details[0].basic}{' '}
                          <br />+
                          {daStatus
                            ? employee.employee.designation_details[0].DA
                            : '0.00'}
                        </div>
                        <div className='border-t-2 border-black text-left mt-1'>
                          {CurrentWage.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {`${
                          employee.employee.designation_details[0]?.OldBasic
                        } + ${
                          daStatus
                            ? employee.employee.designation_details[0]?.OldDA
                            : '0.00'
                        }`}
                        <div className='border-t-2 border-black text-left mt-1'>
                          {LastWage.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {/* {keys.map((key, index) => {
                        // Skip iteration if employee ID does not match the current key
                        if (key !== employee?.employee._id) {
                          return null;
                        }

                        // Calculate the difference when the employee ID matches
                        const difference =
                          Number(updateWageData[employee?.employee._id] || 0) +
                          Number(
                            employee.employee.designation_details[0]?.DA || 0
                          ) -
                          (Number(
                            employee.employee.designation_details[0].basic || 0
                          ) +
                            Number(
                              employee.employee.designation_details[0].DA || 0
                            ));

                        // Return 0 if difference is negative; otherwise, return the actual difference
                        const finalDifference = difference < 0 ? 0 : difference;

                        // Render the calculated difference for matching ID
                        return (
                          <span key={index}>{finalDifference.toFixed(2)}</span>
                        );
                      })} */}
                        {WageDiff.toFixed(2)}
                      </TableCell>

                      <TableCell className='border-black border-2 text-black'>
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
                          return <span key={index}>{(finalDifference*employee?.totalAtteinrange).toFixed(2)}</span>;
                        })}
                      */}
                        {(WageDiff * employee?.totalAtteinrange).toFixed(2)}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {(daStatus
                          ? Number(
                              employee.employee.designation_details[0].DA
                            ) * Number(employee?.totalAtteinrange)
                          : 0
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        0{' '}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {employee.employee?.otherCash}
                      </TableCell>
                      {/* <TableCell className='border-black border-2 text-black'>
                  {employee.allowances}
                  </TableCell> */}
                      <TableCell className='border-black border-2 text-black'>
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
                          return <span key={index}>{(finalDifference*employee?.totalAtteinrange).toFixed(2)}</span>;
                        })} */}
                        {Total.toFixed(2)}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
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
                          return <span key={index}>{(0.12*(finalDifference*employee?.totalAtteinrange)).toFixed(2)}</span>;
                        })} */}
                        {(0.12 * Total).toFixed(2)}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
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
                          return <span key={index}>{(0.0075*(finalDifference*employee?.totalAtteinrange)).toFixed(2)}</span>;
                        })} */}
                        {(0.0075 * Total).toFixed(2)}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {employee.employee?.otherDeduction}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
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
                      <TableCell className='border-black border-2 text-black'></TableCell>
                      <TableCell className='border-black border-2 text-black'></TableCell>
                      <TableCell className='border-black border-2 text-black'></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </PDFTable>
          </div>
        )}
        {!yearlywages && (
          <div className='text-red'>NO Arrear DATA AVAILABLE</div>
        )}
      </div>
    </div>
  );
};
export default Page;

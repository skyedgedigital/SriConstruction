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
import { IEnterprise } from '@/interfaces/enterprise.interface';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';
interface Attendance {
  day: number;
  status: string;
  _id: string;
}
interface EmployeeIdAndAttendance {
  employeeId: string;
  attendance: Attendance[];
}

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const [attendanceData, setAttendanceData] = useState(null);
  console.log('FORM17 ATt DTA', attendanceData);
  const [attendanceArray, setAttendanceArray] = useState<
    EmployeeIdAndAttendance[]
  >([]);
  const [ent, setEnt] = useState<IEnterprise | null>(null);

  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `FormXVII/${searchParams.year}`,
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
          const attendanceArrayResult = await fetchAllAttendance(
            JSON.stringify({ month, year, workOrderHr: searchParams?.wo || '' })
          );
          if (attendanceArrayResult.success) {
            // console.log("LALA", JSON.parse(attendanceArrayResult.data));
            const parsed_attendance_data = JSON.parse(
              attendanceArrayResult.data
            );
            const updated_data: EmployeeIdAndAttendance[] =
              parsed_attendance_data.map((lol: any) => {
                return {
                  employeeId: lol?.employee?._id,
                  attendance: lol.days,
                };
              });
            setAttendanceArray(updated_data);
          }

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

  function calculateTotal(arr: [number]) {
    let total = arr.reduce((sum, current) => sum + current, 0);
    return total;
  }

  function CalculateNationalHolidays(arr: Attendance[]) {
    let count_nh = 0;
    arr.forEach((item) => {
      if (item.status === 'NH') {
        count_nh++;
      }
    });
    return count_nh;
  }

  function findAttendanceByEmployeeId(id: string) {
    const employee = attendanceArray.find((item) => item.employeeId === id);
    if (!employee) {
      return [];
    } else {
      return employee.attendance;
    }
  }

  const canShowNH = [1, 5, 8, 10].includes(parseInt(searchParams?.month));
  return (
    <div className='ml-[80px]'>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      <div id={`${searchParams.month}/${searchParams.year}`} ref={contentRef}>
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
                <div className='uppercase max-w-96 font-semibold'>
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
                  <TableHead className='text-black border-2 border-black'>
                    Total Allowance
                  </TableHead>
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
                {attendanceData?.map((employee, index) => (
                  <TableRow key={employee._id} className=' h-16 '>
                    <TableCell className='border-black border-2 text-black'>
                      {index + 1}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.employee?.name}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.employee?.workManNo}
                    </TableCell>
                    {/* Table data for each day (status) */}
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.designation?.designation}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      <div className='ml-5'>
                        {canShowNH
                          ? Number(employee?.attendance) -
                            CalculateNationalHolidays(
                              findAttendanceByEmployeeId(employee?.employee._id)
                            )
                          : Number(employee?.attendance)}
                      </div>
                      {canShowNH && (
                        <div>
                          {`NH: ${CalculateNationalHolidays(
                            findAttendanceByEmployeeId(employee?.employee._id)
                          )}`}
                        </div>
                      )}
                      {canShowNH && (
                        <div className='border-t-2 border-black pl-5'>
                          {employee?.attendance}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {!employee?.basic && (
                        <div className='text-red-500'>
                          PLEASE SAVE WAGE AGAIN
                        </div>
                      )}
                      {employee?.basic && (
                        <div>{`${employee?.basic} + ${employee?.DA}`}</div>
                      )}
                      {employee.basic && (
                        <div className='border-t-2 border-black text-left mt-1'>
                          {Number(employee?.payRate).toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {!employee?.basic && (
                        <div className='text-red-500'>
                          PLEASE SAVE WAGE AGAIN
                        </div>
                      )}

                      {employee?.basic && (
                        <div>
                          {Number(
                            employee?.basic * employee?.attendance
                          ).toFixed(2)}
                        </div>
                      )}
                      {employee?.basic && <div>Incent</div>}
                      {employee?.basic && (
                        <div>
                          {Number(employee?.incentiveAmount).toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {!employee?.DA && !(Number(employee?.DA) === 0) && (
                        <div className='text-red-500'>
                          PLEASE SAVE WAGE AGAIN
                        </div>
                      )}
                      {employee?.DA &&
                        (employee?.DA * employee?.attendance).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      0{' '}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {(employee?.employee?.attendanceAllowance
                        ? parseFloat(employee?.otherCashDescription?.eoc)
                        : 0
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {(
                        parseFloat(employee?.otherCashDescription?.hra) +
                        parseFloat(employee?.otherCashDescription?.mob) +
                        parseFloat(employee?.otherCashDescription?.incumb) +
                        parseFloat(employee?.otherCashDescription?.pb) +
                        parseFloat(employee?.otherCashDescription?.wa) +
                        parseFloat(employee?.otherCashDescription?.ca) +
                        parseFloat(employee?.otherCashDescription?.ma) +
                        parseFloat(employee?.otherCashDescription?.ssa) +
                        parseFloat(employee?.otherCashDescription?.oa)
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {(employee?.total).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {Math.round(
                        employee?.employee?.pfApplicable
                          ? employee?.attendance * employee?.payRate * 0.12
                          : 0
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {Math.round(
                        employee?.employee?.ESICApplicable &&
                          employee?.total < 21000
                          ? Number(0.0075 * employee?.total)
                          : 0
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {employee?.otherDeduction}
                    </TableCell>
                    <TableCell className='border-black border-2 text-black'>
                      {Math.round(employee?.netAmountPaid).toFixed(2)}
                    </TableCell>

                    <TableCell className='border-black border-2 text-black'></TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>
                    <TableCell className='border-black border-2 text-black'></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </PDFTable>
            <div className='w-[1675px] min-w-fit border-2 border-black mt-2 flex text-sm p-2 items-center justify-between gap-10'>
              <div className='flex items-center justify-center gap-4'>
                <span>Basic:</span>
                <span>
                  {Math.round(
                    calculateTotal(
                      attendanceData?.map((item) =>
                        Number(item?.basic * item?.attendance)
                      )
                    )
                  ).toFixed(2)}
                </span>
              </div>
              <div className='flex items-center justify-center gap-1'>
                <span>DA:</span>
                <span>
                  {Math.round(
                    calculateTotal(
                      attendanceData?.map((item) =>
                        Number(item?.DA * item?.attendance)
                      )
                    )
                  ).toFixed(2)}
                </span>
              </div>
              <div className='flex items-center justify-center gap-1'>
                <span>Total Attn.:</span>
                <span>
                  {' '}
                  {calculateTotal(
                    attendanceData?.map((item) => item?.attendance)
                  )}
                </span>
              </div>
              <div className='flex items-center justify-center gap-1'>
                <span>Gross Payment:</span>
                <span>
                  {Math.round(
                    calculateTotal(
                      attendanceData.map((item) => Number(item?.total))
                    )
                  ).toFixed(2)}
                </span>
              </div>
              <div className='flex items-center justify-center gap-1'>
                <span>P.F Amt.:</span>
                <span>
                  {calculateTotal(
                    attendanceData.map((item) => {
                      return item?.employee?.pfApplicable
                        ? Math.round(
                            Number(item?.attendance) *
                              Number(item?.payRate) *
                              0.12
                          )
                        : 0;
                    })
                  ).toFixed(2)}
                </span>
              </div>
              <div className='flex items-center justify-center gap-1'>
                <span>ESI Amt.:</span>
                <span>
                  {calculateTotal(
                    attendanceData.map((item) => {
                      return item?.employee?.ESICApplicable &&
                        item?.total < 21000
                        ? Math.round(0.0075 * Number(item?.total))
                        : 0;
                    })
                  ).toFixed(2)}
                </span>
              </div>
              <div className='flex items-center justify-center gap-1'>
                <span>Net Payment:</span>
                <span>
                  {calculateTotal(
                    attendanceData.map((item) =>
                      Math.round(Number(item?.netAmountPaid))
                    )
                  ).toFixed(2)}
                </span>
              </div>
              <div className='flex items-center justify-center gap-1'>
                <span>OT value:</span>
                <span>0.00</span>
              </div>
              <div className='flex items-center justify-center gap-1'>
                <span>Attn. Alw</span>
                <span>
                  {Math.round(
                    calculateTotal(
                      attendanceData.map((item) => {
                        return item?.employee?.attendanceAllowance
                          ? parseFloat(item?.otherCashDescription?.eoc)
                          : 0;
                      })
                    )
                  ).toFixed(2)}
                </span>
              </div>
              <div className='flex items-center justify-center gap-1'>
                <span>Monthly Incent</span>
                <span>
                  {Math.round(
                    calculateTotal(
                      attendanceData.map((item) => item.incentiveAmount)
                    )
                  ).toFixed(2)}
                </span>
              </div>
              <div className='flex items-center justify-center gap-1'>
                <span>CA</span>
                <span>
                  {calculateTotal(
                    attendanceData.map((item) =>
                      Number(item?.otherCashDescription?.ca)
                    )
                  ).toFixed(2)}
                </span>
              </div>
            </div>
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

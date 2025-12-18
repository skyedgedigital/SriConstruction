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
  TableHead,
  TableHeader,
  PDFTable,
} from '@/components/ui/table';

import wagesAction from '@/lib/actions/HR/wages/wagesAction';

import { fetchAllAttendance } from '@/lib/actions/attendance/fetch';

import React, { useEffect, useState } from 'react';
import { set } from 'mongoose';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';
import { IEnterprise } from '@/interfaces/enterprise.interface';

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  // const [attendanceData, setAttendanceData] = useState(null);
  const [finalSettlementData, setFinalSettlementData] = useState(null);
  const [settle, setSettle] = useState(0);

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
  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [ent, setEnt] = useState<IEnterprise | null>(null);

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
    if (!finalSettlementData) {
      toast.error('Attendance data not available for Print generation.');
      return;
    }
    reactToPrintFn();
  };
  const handleDownloadPDF = async () => {
    if (!finalSettlementData) {
      toast.error('Attendance data not available for PDF generation.');
      return;
    }

    await generatePDF(finalSettlementData);
  };

  const generatePDF = async (finalSettlementData) => {
    const pdf = new jsPDF('p', 'pt', 'a4'); // Create a landscape PDF
    const ogId = `${searchParams.month}/${searchParams.year}`;

    // Create a container element to hold the content and table
    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;

    // Set the table width
    tableElement.style.width = '1250px';

    // Style the table cells (padding, border, and other styles)
    const cells = tableElement.querySelectorAll('td, th');
    cells.forEach((cell: any) => {
      // cell.style.padding = '7px';
      cell.style.border = '1px solid #000'; // Optional: Add a border for better visibility
    });

    // Adjust the margins by increasing the x and y values
    const marginX = 40; // Adjust this value to increase horizontal margin
    const marginY = 40; // Adjust this value to increase vertical margin

    // Render the table to PDF
    pdf.html(tableElement, {
      /*************  ✨ Codeium Command ⭐  *************/
      /**
       * Callback function to save the generated PDF and get the PDF data URL.
       * @async
       * @returns {Promise<void>}
       */
      /******  4ab66197-b5b0-459f-aa1c-a7e16f32c687  *******/
      callback: async () => {
        pdf.save(`${finalSettlementData?.employee?.name}_final-settlement.pdf`);
        const pdfDataUrl = pdf.output('dataurlstring');
      },
      x: marginX, // Set horizontal margin
      y: marginY, // Set vertical margin
      html2canvas: { scale: 0.5 }, // Maintain scale for better PDF rendering
      autoPaging: 'text',
    });
  };

  console.log('yeich toh hain', searchParams);
  function getOrdinalNumber(index) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = index + 1; // +1 because your index starts from 0

    const lastDigit = value % 10;
    const lastTwoDigits = value % 100;

    if (lastDigit === 1 && lastTwoDigits !== 11) {
      return value + suffixes[1];
    } else if (lastDigit === 2 && lastTwoDigits !== 12) {
      return value + suffixes[2];
    } else if (lastDigit === 3 && lastTwoDigits !== 13) {
      return value + suffixes[3];
    } else {
      return value + suffixes[0];
    }
  }

  useEffect(() => {
    const fn = async () => {
      try {
        setFinalSettlementData(null);
        const data = {
          employee: searchParams.employee,
        };
        console.log('shaiaiijsjs', data);
        const filter = await JSON.stringify(data);

        const response = await wagesAction.FETCH.fetchFinalSettlement(filter);
        //   console.log(JSON.parse(response.data))
        const responseData = JSON.parse(response.data);
        setFinalSettlementData(responseData);
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
    const fn = async () => {
      try {
        if (!finalSettlementData) return;
        const totalBonusPaid =
          finalSettlementData?.totalAttendancePerYear?.reduce(
            (acc, e) =>
              e.status ? 0.0833 * (acc + e.totalNetAmountPaid) : acc,
            0
          );

        const totalLeavePaid =
          finalSettlementData?.totalAttendancePerYear?.reduce(
            (acc, e) => (e.status ? acc + e.leave : acc),
            0
          );

        const totalToBePaid = totalBonusPaid + totalLeavePaid;
        setSettle(totalToBePaid);
      } catch (error) {
        toast.error('Internal Server Error');
        console.log('Internal Server Error:', error);
      }
    };
    fn();
  }, [finalSettlementData]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array of days (1 to 31)

  const reverseCustom = (data) => {
    const temp = [];
    if (data) {
      for (let i = 0; i < data?.length; i++) {
        const item = data[data?.length - i - 1];
        temp.push(item);
      }
    }
    return temp;
  };

  return (
    <div className='ml-[80px]'>
      <div className='flex gap-4 items-center'>
        <Button onClick={handleOnClick}>Print</Button>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
      </div>

      <div id={`${searchParams.month}/${searchParams.year}`} ref={contentRef}>
        <div
          className='container left-0 right-0 bg-white  overflow-hidden font-mono  w-[1300px]'
          id='container-id'
        >
          <div className='px-2 py-6 text-center  '>
            <h2 className='text-xl font-bold w-fit ml-24  border-b-2 pb-2'>
              FINAL SETTLMENT ANNEXURE FORM - G
            </h2>
          </div>
          <div className='flex flex-col gap-3 mb-4 '>
            <div className='font-semibold flex gap-2  mb-6 '>
              <span>Vendor&apos;s Name =</span>
              {ent?.name ? (
                <span className='uppercase'>{ent?.name}</span>
              ) : (
                <span className='text-red-500'>
                  {' '}
                  No company found. Try by Reloading
                </span>
              )}{' '}
            </div>

            <div className='flex gap-52'>
              <div className='font-semibold flex gap-2   '>
                <span>Employee&apos;s Name :- </span>
                <span className='uppercase'>
                  {' '}
                  {finalSettlementData?.employee?.name}
                </span>
              </div>
              <div className='font-semibold flex gap-2   '>
                <span>Workman Sl :-</span>
                <span className='uppercase'>
                  {' '}
                  {finalSettlementData?.employee?.workManNo}
                </span>
              </div>
            </div>
            <div className='font-semibold flex gap-2 '>
              <span>Designation :-</span>
              <span className='uppercase'>
                {finalSettlementData?.designation?.designation}
              </span>
            </div>
            <div className='font-semibold flex gap-2   '>
              <span>Rate of Pay :-</span>
              <span className='uppercase'>
                {' '}
                {finalSettlementData?.designation?.PayRate}
              </span>
            </div>
            <div className='font-semibold flex gap-2 underline  '>
              <span>Date of Employment (From workmen register) :- </span>
              <span className='uppercase'>
                {' '}
                {finalSettlementData?.employee?.appointmentDate}
              </span>
            </div>
          </div>
          <div></div>
        </div>

        {/* NORMAL */}

        {finalSettlementData && (
          <table className={`border-2 border-black  text-center ml-10 `}>
            <thead className=' py-8 overflow-auto'>
              <tr className='text-black  '>
                <th className=' text-black border-2 border-black p-1'>Month</th>

                {reverseCustom(finalSettlementData.totalAttendancePerYear).map(
                  (obj, index) => (
                    <th key={index} className='border-2 border-black'>
                      <div>
                        <div className='border-b-2 border-black p-2'>
                          {getOrdinalNumber(index)}
                          year(
                          {obj.year})
                        </div>
                        <div className='flex flex-1 '>
                          <div className='flex-1 border-r-2 border-black p-1 text-center'>
                            {getOrdinalNumber(index)}
                            year number of days
                          </div>
                          <div className='flex-1 pl-2'>Gross Wages</div>
                        </div>
                      </div>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {months.map((month, index) => (
                <tr key={index} className='border-[1px] border-black'>
                  <td className=' text-black p-1 border-[1px] border-black pb-3'>
                    {month}
                  </td>
                  {reverseCustom(finalSettlementData.wages[index + 1]).map(
                    (wage, idx) => (
                      <td
                        key={idx}
                        className='border-[1px] border-black p-1 pb-3'
                      >
                        <div className='flex'>
                          <div className=' flex-1 '>{wage.attendance}</div>
                          <div className='flex-1'>
                            {wage.netAmountPaid.toFixed(2)}
                          </div>
                        </div>
                      </td>
                    )
                  )}
                </tr>
              ))}
              <tr className='font-semibold border-[1px] border-black'>
                <td className='border-[1px] border-black p-1 text-black pb-3'>
                  TOTAL
                </td>

                {reverseCustom(finalSettlementData.totalAttendancePerYear).map(
                  (att: any, idx: any) => (
                    <React.Fragment key={idx}>
                      <td className='border-[1px] border-black font-bold'>
                        <div className='flex'>
                          <div className=' flex-1'>{att?.totalAttendance}</div>
                          <div className=' flex-1 '>
                            {att?.totalNetAmountPaid.toFixed(2)}
                          </div>
                        </div>
                      </td>
                    </React.Fragment>
                  )
                )}
              </tr>
            </tbody>
          </table>
        )}

        <div className=' flex font-bold justify-between'>
          <div className='flex-1 '>
            <div className='mb-3 mt-4'>
              <span>Total no. of days:</span>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {finalSettlementData?.totalAttendance}
              </span>
            </div>
            <div className='mb-3'>
              <span>Total Gross Wages:</span>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {finalSettlementData?.totalWages.toFixed(2)}
              </span>
            </div>
          </div>
          <div className='flex-1 '>
            <div className='mb-3 mt-4'>
              <span>No. of EL(1day for 20 days Working):</span>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {
                  finalSettlementData?.totalAttendancePerYear[
                    finalSettlementData?.totalAttendancePerYear.length - 1
                  ]?.EL
                }
              </span>
            </div>
            <div className='mb-3'>
              <span>No. of CL(1day for 35 days Working):</span>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {
                  finalSettlementData?.totalAttendancePerYear[
                    finalSettlementData?.totalAttendancePerYear.length - 1
                  ]?.CL
                }
              </span>
            </div>
            <div className='mb-3'>
              <span>No. of FL(1day for 60 days Working):</span>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {
                  finalSettlementData?.totalAttendancePerYear[
                    finalSettlementData?.totalAttendancePerYear.length - 1
                  ]?.FL
                }
              </span>
            </div>
            <div className='mb-3'>
              <span>Total no. of days for leave payment:</span>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {finalSettlementData?.totalAttendancePerYear[
                  finalSettlementData?.totalAttendancePerYear.length - 1
                ]?.FL +
                  finalSettlementData?.totalAttendancePerYear[
                    finalSettlementData?.totalAttendancePerYear.length - 1
                  ]?.CL +
                  finalSettlementData?.totalAttendancePerYear[
                    finalSettlementData?.totalAttendancePerYear.length - 1
                  ]?.EL}
              </span>
            </div>
          </div>
        </div>
        <div className=' flex flex-col gap-1 font-semibold my-6'>
          <div className='flex gap-52'>
            <div>
              {finalSettlementData?.totalAttendancePerYear?.map((e) => (
                <div key={e.year}>
                  <span>{`Total Gross Wages(April ${e.year} to March ${
                    e.year + 1
                  })`}</span>
                  <span>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {e.totalNetAmountPaid?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div>
              {' '}
              {finalSettlementData?.bonusDetails?.map((e) => (
                <div key={e.year}>
                  <span className='uppercase'>Bonus(8.33%)</span>
                  <span>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {e.status ? '(Already Paid)' : e.bonus?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='flex gap-24 my-6 font-bold'>
          <div>
            {finalSettlementData?.totalAttendancePerYear.map((e) => (
              <div key={e.year}>
                <span className='uppercase'>{`Leave Amount (${e.year}):`}</span>
                <span>{e.status ? '(Already Paid)' : e.leave?.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className='font-bold'>
            <div>
              <span className='uppercase'>Gratuity amount :</span>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;N/A
              </span>
            </div>
            <div>
              <span className='uppercase'>Gratuity amount :</span>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;N/A
              </span>
            </div>
            <div>
              <span className='uppercase'>Retrenchment benefit:</span>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {searchParams.Retrenchment_benefit
                  ? finalSettlementData?.designation?.PayRate * 15
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className='uppercase'>Notice Pay :</span>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;N/A
              </span>
            </div>
          </div>
        </div>
        <div className='my-6 font-bold'>
          <span className='uppercase'>
            Total amount towards full and final settlement Rs.
          </span>
          <span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {settle.toFixed(2)}
          </span>
        </div>
        {!finalSettlementData && (
          <div className='text-red'>NO ATTENDANCE DATA AVAILABLE</div>
        )}
      </div>
    </div>
  );
};

export default Page;

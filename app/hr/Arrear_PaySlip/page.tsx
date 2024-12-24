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

  useEffect(() => {
    if (searchParams.modifiedWages) {
      setUpdateWageData(JSON.parse(searchParams.modifiedWages));
    }
  }, [searchParams.modifiedWages]);

  const keys = Object.keys(updateWageData); // it's keys array
  console.log('keys', keys);
  useEffect(() => {
    let yearEdgeCase = false;
    if (smonth >= 1 && emonth <= 3 && syear === eyear) {
      yearEdgeCase = true;
    }
    const fn = async () => {
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
  }, [syear, searchParams.workOrder]);

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
    <div className='p-5'>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>
      <div ref={contentRef} id='Wages-Register' className='p-4'>
        {totalAttendance?.map((employee) => {
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
            (employee.employee?.otherCash ? employee.employee?.otherCash : 0.0);

          const basic = Number(
            employee?.employee?.designation_details[0]?.basic || 0
          );
          const da = Number(
            employee?.employee?.designation_details[0]?.DA || 0
          );
          const otherCash = Number(
            employee?.employee?.designation_details[0].otherCash || 0
          );
          const totalAttendance = employee?.totalAtteinrange || 0;

          // Calculate the wage difference

          // Calculate deductions
          const pfDeduction = 0.12 * Total;
          const esiDeduction = 0.0075 * Total;
          const netWages =
            Total -
            (pfDeduction + esiDeduction) -
            (employee.employee?.otherDeduction
              ? employee.employee?.otherDeduction
              : 0);

          return (
            <div
              key={`${employee?.employee?.name}-${employee?.employee?.workManNo}`}
              id={`${employee?.employee?.name}-${employee?.employee?.workManNo}`}
              className='border-2 border-black p-2 mb-4'
            >
              <div className='flex justify-between pr-10'>
                <h1 className='uppercase'>Arrear Wages slip</h1>
                <span>[ See Rule 78 (2) (B) ]</span>
              </div>

              <div className='flex gap-4 my-4'>
                <span>Name & Address of Contractor :- </span>
                <span className='uppercase'>
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
                </span>
              </div>

              <div>
                <h2 className='font-semibold my-2'>Contract Under</h2>
                <div className='flex gap-52'>
                  <div>
                    <div className='flex gap-2'>
                      <span>Name of Workman :-</span>
                      <span className='uppercase'>
                        {employee?.employee?.name}
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      <span>Nature & Location of Work :-</span>
                      <span className='uppercase'></span>
                    </div>
                    <div className='flex gap-2'>
                      <h1 className='font-bold mb-4 text-blue-600 text-center'>
                        {`From ${sday}/${smonth}/${syear} TO ${eday}/${emonth}/${eyear}`}
                      </h1>
                    </div>
                  </div>
                  <div>
                    <div className='flex gap-2'>
                      <span>Workman No:-</span>
                      <span className='uppercase'>
                        {employee?.employee?.workManNo}
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      <span>Account No :-</span>
                      <span className='uppercase'>
                        {employee?.employee?.accountNumber}
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      <span>UAN :-</span>
                      <span className='uppercase'>
                        {employee?.employee?.UAN}
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      <span>ESIC No :-</span>
                      <span className='uppercase'>
                        {employee?.employee?.ESICNo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <ol className='list-decimal ml-5 my-3'>
                <li>
                  <span>No. of Days Worked :- </span>
                  <span>{totalAttendance}</span>
                </li>
                <li>
                  <span>No. of Units Worked in Case of Piece Rate of Work</span>
                  {'  :- '}
                  <span>-</span>
                </li>
                <li>
                  <span>Rate of Daily Wages @ Piece Rate :- </span>
                  <span>{WageDiff.toFixed(2)}</span>
                </li>
                <li>
                  <span>Amount of Wages :- </span>
                  <span>
                    {(WageDiff * totalAttendance).toFixed(2)} +{' '}
                    {(daStatus
                      ? Number(employee?.employee?.designation_details[0]?.DA)
                      : 0) * totalAttendance}{' '}
                    + {otherCash}
                  </span>
                </li>
                <li>
                  <span>Amount of Overtime Wages :- </span> <span>-</span>
                </li>
                <li>
                  <span>Gross Wages Payable :- </span>
                  <span>{Total.toFixed(2)}</span>
                </li>
                <li>
                  <span>Deduction if Any Advance :- </span>
                  <span>
                    P.F : {pfDeduction.toFixed(2)} E.S.I :{' '}
                    {esiDeduction.toFixed(2)}
                  </span>
                </li>
                <li>
                  <span>Net Amount of Wages Paid :- </span>
                  <span>{netWages.toFixed(2)}</span>
                </li>
              </ol>

              <div className='my-5'>
                Initial of Contractor or his Representative
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Page;

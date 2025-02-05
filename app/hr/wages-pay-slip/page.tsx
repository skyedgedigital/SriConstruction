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

import React, { useEffect, useState } from 'react';
import { FLOAT } from 'html2canvas/dist/types/css/property-descriptors/float';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';
import { IEnterprise } from '@/interfaces/enterprise.interface';

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const [wagesData, setWagesData] = useState(null);
  const [ent, setEnt] = useState<IEnterprise | null>(null);

  useEffect(() => {
    const fn = async () => {
      try {
        // @ts-ignore
        const data = await JSON.parse(searchParams.employee);
        console.log(data);

        setWagesData(data);
      } catch (error) {
        toast.error('Internal Server Error');
        console.log('Internal Server Error:', error);
      }
    };
    fn();
  }, []);
  console.log('yyyyyyy wages data', wagesData);
  // Array of days (1 to 31)

  const months = [
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

  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `BonusStatement/${searchParams.year}`,
  });
  const handleOnClick = async () => {
    if (!wagesData) {
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
    if (!wagesData) {
      toast.error('Attendance data not available for PDF generation.');
      return;
    }

    await generatePDF(wagesData);
  };

  const generatePDF = async (wagesData) => {
    const pdf = new jsPDF('l', 'pt', 'a4'); // Create a landscape PDF
    const ogId = `${wagesData?.existingWage?.employee?.workManNo}`;
    console.log('siiiiiii', wagesData);

    // Get the original HTML element and clone it
    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;

    // Apply custom styles for better alignment in the PDF
    tableElement.style.width = '1250px';

    // Create a style block to fix the alignment of numbered lists with flexbox
    const style = document.createElement('style');
    style.innerHTML = `
      ol {
        padding-left: 0; /* Remove default padding */
      }
      ol li {
        display: flex;
        align-items: flex-start;
        padding-left: 0;
        margin-bottom: 10px;
      }
      ol li::before {
        content: counter(li) ". "; /* Add number before the text */
        counter-increment: li;
        padding-right: 10px; /* Add space between number and text */
        font-weight: bold; /* Make the number bold */
      }
      ol {
        counter-reset: li; /* Reset counter */
      }
    `;

    // Append the style to the cloned tableElement
    tableElement.appendChild(style);

    // Render the HTML content to the PDF
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

  return (
    <div className='p-5'>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      {wagesData ? (
        <div
          ref={contentRef}
          id={`${wagesData?.existingWage?.employee?.workManNo}`}
          className='ml-[80px] border-2 border-black p-4'
        >
          <div className=' flex justify-between pr-10'>
            <h1 className='uppercase'>FOR XIX</h1>
            <span className='uppercase'>Wages slip</span>
            <span>[ See Rule 78 (2) (B) ]</span>
          </div>
          <div className=' flex gap-4 my-4'>
            <span>Name & Address of Contractor : </span>
            <div className='flex flex-col'>
              {ent?.name ? (
                <span>{ent?.name},&nbsp;</span>
              ) : (
                <span className='text-red-500'>
                  No company found. Try by Reloading
                </span>
              )}

              {ent?.address ? (
                <span>{ent?.address}</span>
              ) : (
                <span className='text-red-500'>
                  No address found. Try by Reloading
                </span>
              )}
            </div>
          </div>
          <div className='border-t-2 border-black'>
            <h2 className='font-semibold my-2'>Contract Under</h2>
            <div className='flex justify-between'>
              <div>
                <div className=' flex gap-2 '>
                  <span>Name of Workman :</span>
                  <span className='uppercase font-bold'>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {wagesData?.name}{' '}
                  </span>
                </div>
                <div className=' flex gap-2   '>
                  <span>Nature & Location of Work :</span>
                  <span className='uppercase'> </span>
                </div>
                <div className=' flex gap-2   '>
                  <span>
                    For the Month
                    :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                  <span className='uppercase'>
                    {' '}
                    {months[Number(wagesData?.month - 1)]} &nbsp;{' '}
                    {wagesData?.year}
                  </span>
                </div>
              </div>
              <div>
                <div className=' flex gap-2  '>
                  <span>Workman No</span>
                  <span className='uppercase font-bold'>
                    &nbsp;&nbsp;{wagesData?.existingWage?.employee?.workManNo}{' '}
                  </span>
                </div>
                <div className=' flex gap-2   '>
                  <span>A/c No.</span>
                  <span className='uppercase font-bold'>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {wagesData?.existingWage?.employee?.accountNumber}
                  </span>
                </div>
                <div className=' flex gap-2   '>
                  <span>UAN</span>
                  <span className='uppercase font-bold'>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {wagesData?.existingWage?.employee?.UAN}
                  </span>
                </div>
                <div className=' flex gap-2   '>
                  <span>ESIC No.</span>
                  <span className='uppercase font-bold'>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {wagesData?.existingWage?.employee?.ESICNo}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <ol className='list-decimal ml-5 my-3'>
            <li>
              <span>No. of Days Worked : </span>{' '}
              <span className='font-bold'>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {wagesData?.attendance}
              </span>
            </li>
            <li>
              <span>No. of Units Worked in Case of Piece Rate of Work</span>
              {'  : '}
              <span>-</span>
            </li>
            <li>
              <span>Rate of Daily Wages @ Piece Rate : </span>{' '}
              <span className='font-bold'>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {Number(wagesData?.existingWage?.basic).toFixed(2)}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; +
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {Number(wagesData?.existingWage.DA).toFixed(2)}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; =
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {Number(wagesData?.existingWage?.payRate).toFixed(2)}
              </span>
            </li>
            <li>
              <span>Amount of Wages : </span>{' '}
              <span className='font-bold'>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {(
                  wagesData?.existingWage?.basic * wagesData?.attendance
                ).toFixed(2)}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; +
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {(wagesData?.existingWage.DA * wagesData?.attendance)?.toFixed(
                  2
                )}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; +
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {wagesData?.existingWage?.otherCash?.toFixed(2)}{' '}
              </span>
            </li>
            <li>
              <span>Amount of Overtime Wages : </span> <span></span>
            </li>
            <li>
              <span>Gross Wages Payable : </span>{' '}
              <span className='font-bold'>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {wagesData?.existingWage?.total.toFixed(2)}
              </span>
            </li>
            <li>
              <span>
                Deduction if Any Advance :{' '}
                <span className='font-bold'>
                  {wagesData?.existingWage?.advanceDeduction != null &&
                    (wagesData?.existingWage?.advanceDeduction).toFixed(2)}{' '}
                </span>
              </span>
              {'   '}
              <span className='ml-6'>
                Deduction if Any Damage :{' '}
                <span className='font-bold'>
                  {wagesData?.existingWage?.damageDeduction != null &&
                    (wagesData?.existingWage?.damageDeduction).toFixed(2)}{' '}
                </span>
              </span>{' '}
              <span className='ml-6'>PF:</span>{' '}
              <span className='font-bold ml-6'>
                {(
                  0.12 *
                  (wagesData?.existingWage?.attendance *
                    wagesData?.existingWage?.payRate)
                ).toFixed(2)}
              </span>
              <span className='ml-6'>ESI:</span>
              <span className='font-bold ml-6'>
                {wagesData?.employee?.ESICApplicable &&
                wagesData?.existingWage?.total < 21000
                  ? (0.0075 * wagesData?.existingWage?.total).toFixed(2)
                  : 0}
              </span>
            </li>
            {wagesData?.existingWage?.incentiveApplicable ? (
              <li>
                <span>Total Incentive amount : </span>{' '}
                <span className='font-bold'>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
                  {(wagesData?.existingWage?.incentiveAmount).toFixed(2)}
                </span>
              </li>
            ) : (
              <li>
                <span>Total Incentive amount : </span>{' '}
                <span className='font-bold'>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; NA
                </span>
              </li>
            )}
            <li>
              <span>Net Amount of Wages Paid : </span>{' '}
              <span className='font-bold'>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {Math.round(wagesData?.existingWage?.netAmountPaid).toFixed(2)}
              </span>
            </li>
          </ol>

          <div className='my-5'>
            Initial of Contractor or his Representative
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Page;

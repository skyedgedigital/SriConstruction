'use client'

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
    PDFTable
  } from "@/components/ui/table"

import { fetchAllAttendance } from '@/lib/actions/attendance/fetch';

import React, { useEffect, useState } from 'react';


const Page =  ({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) => {

    const [attendanceData, setAttendanceData] = useState(null);

  const contentRef = React.useRef(null);
 const reactToPrintFn = useReactToPrint({ contentRef, })
 const handleOnClick = React.useCallback(() => {
  reactToPrintFn();
}, [reactToPrintFn]);

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
            pdf.save(`${ogId}PF.pdf`);
            const pdfDataUrl = pdf.output('dataurlstring');
          },
          x: 10,
          y: 10,
          html2canvas: { scale: 0.6 },
          autoPaging: 'text',
        });
      };


console.log("yeich toh hain",searchParams)

 
function calculateAge(dateString) {

  if (!dateString || typeof dateString !== "string") {
    return ;
  }
  // Split the input date string into day, month, and year
  const [day, month, year] = dateString.split("-").map(Number);

  // Create a date object from the parsed values
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();

  // Adjust age if the birthday hasn't occurred yet this year
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}
useEffect(() => {
    const fn = async () => {
        try {
           setAttendanceData(null)
          // @ts-ignore
          const month=parseInt(searchParams.month)
          // @ts-ignore
            const year=parseInt(searchParams.year)
                 // @ts-ignore
            const department = searchParams.dept;

        
           console.log("shaiaiijsjs")
   
        
            const response=await wagesAction.FETCH.fetchFilledWages(month,year,"Default")
          //   console.log(JSON.parse(response.data))
          if(response?.success)
            {toast.success(response.message)
            const responseData=JSON.parse(response.data)
            console.log("iiiiiiiiiii",responseData)
         const parsedData=responseData.map(item => ({
            ...item, // Spread operator to copy existing properties
            otherCashDescription: JSON.parse(item.otherCashDescription),
            otherDeductionDescription: JSON.parse(item.otherDeductionDescription),
          }));
          const filteredData = department === "All Departments"
          ? parsedData
          : parsedData.filter(item => item.employee && item.employee.department._id === department);
          
          console.log("bbbbbbbbbb",filteredData)


            console.log("aagya response", parsedData)
            const CheckMultipleEntry = filteredData.filter((obj,index)=> obj.employee &&
              filteredData.findIndex((item)=> item.employee && item.employee.UAN === obj.employee.UAN) === index
            )
            console.log(CheckMultipleEntry,"Filterd entry")
            setAttendanceData(CheckMultipleEntry)
            }
            else {
                toast.error(response.message)
            }
         
           
            
          } catch (error) {
            toast.error('Internal Server Error')
            console.error('Internal Server Error:', error);
      
          } 
    };
    fn();
  }, []);
console.log("sahi h bhai")
 

  



const days = Array.from({ length: 31 }, (_, i) => i + 1);        // Array of days (1 to 31)
      
        return (
          <div>
            <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
              PF
            </h1>

            <div className='flex gap-2 mb-2'>
              <Button onClick={handleDownloadPDF}>Download PDF</Button>
              <Button onClick={handleOnClick}>Print</Button>
            </div>

            <div
              id={`${searchParams.month}/${searchParams.year}`}
              ref={contentRef}
            >
              {attendanceData && (
                <div>
                  <PDFTable className='border-2 border-black  '>
                    <TableHeader className=' py-8 h-24 overflow-auto  '>
                      <TableRow className='text-black font-mono h-28'>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          UAN
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          Employee Name
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          EPF Wages
                        </TableHead>
                        {/* Table headers for each day */}

                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          EPF Wages
                        </TableHead>

                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          EPS Wages
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          EDLI Wages
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black tracking-normal'>
                          PF
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          EPF Amount
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          PPF Amount
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceData.map((employee, index) => (
                        <TableRow key={employee._id} className=' h-16 '>
                          <TableCell className='border-black border-2 text-black'>
                            {employee?.employee?.UAN}
                          </TableCell>
                          <TableCell className='border-black border-2 text-black'>
                            {employee?.employee?.name}
                          </TableCell>
                          {/* Table data for each day (status) */}
                          <TableCell className='border-black border-2 text-black'>
                            {(employee?.total >= 15000 ? 15000 : employee?.total).toFixed(2)}
                          </TableCell>
                          <TableCell className='border-black border-2 text-black'>
                            {(employee?.total >= 15000 ? 15000 : employee.total).toFixed(2)}
                          </TableCell>
                          <TableCell className='border-black border-2 text-black'>
                            {calculateAge(employee?.employee?.dob) > 60
                              ? 0
                              : employee?.total >= 15000
                              ? 15000
                              : (employee.total).toFixed(2)}
                          </TableCell>
                          <TableCell className='border-black border-2 text-black'>
                            {employee?.total >= 15000 ? 15000 : (employee.total).toFixed(2)}
                          </TableCell>
                          <TableCell className='border-black border-2 text-black'>
                            {(0.12 * employee?.total).toFixed(2)}
                          </TableCell>
                          <TableCell className='border-black border-2 text-black'>
                            {calculateAge(employee?.employee?.dob) > 60
                              ? 0
                              : (0.0833 * employee?.total).toFixed(2)}
                          </TableCell>
                          <TableCell className='border-black border-2 text-black'>
                            {calculateAge(employee?.employee?.dob) > 60
                              ? (0.12 * employee?.total).toFixed(2)
                              : (0.0367 * employee?.total).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </PDFTable>
                </div>
              )}
              {!attendanceData && (
                <div className='text-red'>NO DATA AVAILABLE</div>
              )}
            </div>
          </div>
        );
    

};

export default Page;

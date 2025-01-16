'use client'
"use client";

import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  PDFTable,
} from "@/components/ui/table";
import wagesAction from "@/lib/actions/HR/wages/wagesAction";
import WorkOrderHrAction from "@/lib/actions/HR/workOrderHr/workOrderAction";

import React, { useEffect, useState } from "react";
import { parse } from "path";
import { fetchEnterpriseInfo } from "@/lib/actions/enterprise";
import { IEnterprise } from "@/interfaces/enterprise.interface";

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
      toast.error("Attendance data not available for Print generation.");
      return;
    }
    reactToPrintFn();
  };

  const handleDownloadPDF = async () => {
    if (!bonusData) {
      toast.error("Attendance data not available for PDF generation.");
      return;
    }

    await generatePDF(bonusData);
    
  };
  const generatePDF = async (bonusData) => {
    const pdf = new jsPDF("l", "pt", "a4"); // Create a landscape PDF
    const ogId = `Bonus-register/${searchParams.year}`;

    // Create a container element to hold the content and table
    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;
    console.log(tableElement);

    // Append the table to the container element
    tableElement.style.width = "1250px";
    tableElement.style.fontSize = "24px";

    pdf.html(tableElement, {
      callback: async () => {
        pdf.save(`${ogId}.pdf`);
        const pdfDataUrl = pdf.output("dataurlstring");
      },
      x: 10,
      y: 90, // Adjust the y position to accommodate the heading
      html2canvas: { scale: 0.6 },
      autoPaging: "text",
    });
  };
  const calculateTotalWorkOrder = (employee) => {
    // Initialize an array to hold the count for each month (12 months)
    let workOrderArray = new Array()

    // Loop through each wage entry for the employee
    employee.wages.forEach((wage) => {

      if (wage.workOrderHr && !workOrderArray.includes(wage.workOrderHr)) {
          workOrderArray.push(wage.workOrderHr) 
        
      }
    });

    // console.log(workOrderArray, "workOrderArray");

    return workOrderArray;
  };
  useEffect(() => {
    const fn = async () => {
      try {
        setBonusData(null);
        const data = {
          // @ts-ignore
          year: parseInt(searchParams.year),
          workOrder: searchParams.workOrder,
          bonusPercentage: 0, // we are only intrested in employee data
        };
        console.log("We are searchParams",searchParams)
        console.log("shaiaiijsjs", data);
        const filter = await JSON.stringify(data);
        console.log(filter);

        const response = await wagesAction.FETCH.fetchWagesForFinancialYear(
          filter
        );
       
        // const error = workOrderResp.error
        // const data = JSON.parse(workOrderResp.data)

        //   console.log(JSON.parse(response.data))

        const workOrderResp =
          await WorkOrderHrAction.FETCH.fetchAllWorkOrderHr();
        const success = workOrderResp.success;
        // const error = workOrderResp.error
        // const data = JSON.parse(workOrderResp.data)

        if (success) {
          const workOrderNumbers = JSON.parse(workOrderResp.data);
          setWorkOrderNumbers(workOrderNumbers);
          console.log("yeraaaa wowowowwoncjd", workOrderNumbers);
        } else {
          toast.error("Can not fetch work order numbers!");
        }

        const responseData = JSON.parse(response.data);
        setBonusData(responseData);
        console.log("response aagya bawa", responseData);
        console.log("aagya response");
      } catch (error) {
        toast.error("Internal Server Error");
        console.log("Internal Server Error:", error);
      }
    };
    fn();
  }, []);
  const nextYear = parseInt(searchParams.year) + 1;

  return (
    <div className='ml-[80px]'>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      <div id={`Bonus-register/${searchParams.year}`} ref={contentRef}>
        <div
          className='flex justify-between p-0 container left-0 right-0 overflow-hidden font-mono w-full mb-6'
          id='container-id'
        >
          <div className='flex flex-col ml-4'>
            <div className='font-bold'>Name of Establishment</div>
            <div>
              {ent?.name ? (
                ent?.name
              ) : (
                <span className='text-red-500'>
                  No company found. Try by Reloading
                </span>
              )}
              {ent?.address ? (
                ent?.address
              ) : (
                <span className='text-red-500'>
                  No address found. Try by Reloading
                </span>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-2 ml-16 mb-6'>
            <h1 className='font-bold underline text-center'>workOrders List</h1>
            <div>{`From Date: 01-04-${searchParams.year}`}</div>
            <div>{`To Date: 30-03-${nextYear}`}</div>
          </div>
        </div>

        {bonusData && (
          <PDFTable className='border-2 border-black'>
            <TableHeader className='py-8 h-16 overflow-auto'>
              <TableRow>
                <TableHead
                  className='text-black border-2 border-black'
                  colSpan={3}
                ></TableHead>
              </TableRow>
              <TableRow className='text-black h-28'>
                <TableHead className='text-black border-2 border-black'>
                  Sl No.
                </TableHead>
                <TableHead className='text-black border-2 border-black'>
                  Employee Name
                </TableHead>
                <TableHead className='text-black border-2 border-black'>
                  Father&apos;s Name
                </TableHead>
                <TableHead className='text-black border-2 border-black'>
                  Work Orders
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bonusData.map((employee, index) => {
                const workOrderArray = calculateTotalWorkOrder(employee);

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

                    {/* Mapping over workOrderArray */}
                    <TableCell className='border-black border-2 text-black'>
                      {workOrderArray.map((wo, monthIndex) => {
                        const workOrder = workOrderNumbers.find(
                          (wn) => wn._id === wo
                        );
                        return (
                          <div key={monthIndex}>
                            <div>
                              {workOrder ? workOrder.workOrderNumber : null}
                            </div>
                          </div>
                        );
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </PDFTable>
        )}

        {!bonusData && (
          <div className='text-red'>NO ATTENDANCE DATA AVAILABLE</div>
        )}
      </div>
    </div>
  );
}  

export default Page
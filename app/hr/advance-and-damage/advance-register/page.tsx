"use client";

import { Button } from "@/components/ui/button";
import ComplianceRegisterAction from "@/lib/actions/HR/compliance-and-register/complianceRegisterAction";
import jsPDF from "jspdf";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

const Page = ({
  searchParams,
}: {
  searchParams: { [Key: string]: string | undefined };
}) => {

  const [tdata, settData] = useState(null);
  const [employees, setEmployees] = useState(null);

  const fromDate = searchParams.fromData;
  const toDate = searchParams.toData;

  useEffect(() => {
    const getAdvanceRegisterData = async () => {
      const response = await ComplianceRegisterAction.FETCH.fetchAdvanceRegister(fromDate, toDate);
      if (response.success) {
        const parsedData = JSON.parse(response?.data);
        toast.success(response.message);
        settData(parsedData);
      } else {
        toast.error(response.message);
      }
    }
    getAdvanceRegisterData();
    console.log("Data Captured: ", fromDate, toDate);
  }, [])
  
  useEffect(() => {
    console.log("T Data: ", tdata);
    setEmployees(tdata);
  }, [tdata])

  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef, documentTitle: `advanceRegister` })
  
  const handleOnClick = async () => {
    if (!employees) {
      toast.error('Employees data not available for Print generation.');
      return;
    }
    reactToPrintFn();
  };

  const handleDownloadPDF = async () => {
    if (!employees) {
      toast.error("Attendance data not available for PDF generation.");
      return;
    }

    await generatePDF(employees);
  };

  const generatePDF = async (employees) => {
    const pdf = new jsPDF("l", "pt", "a4"); // Create a landscape PDF
    const ogId = `123445`;

    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;

    // Apply custom styles for better alignment in the PDF
    tableElement.style.width = "1250px";

    const style = document.createElement("style");
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
    
    tableElement.appendChild(style);

    pdf.html(tableElement, {
      callback: async () => {
        pdf.save(`${ogId}.pdf`);
        const pdfDataUrl = pdf.output("dataurlstring");
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.6 },
      autoPaging: "text",
    });
  };

  return (
    <div className="ml-[80px] w-auto">
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button> 
      </div>
      {/* Employee Table */}
      <div className="mt-8" ref={contentRef}>
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-4xl font-bold">FORM XIII</h1>
          <span className="font-medium">[ See Rule 78 (2) (d) ]</span>
          <h2 className="text-3xl font-semibold">
            Register of Advance Given to Employees
          </h2>
        </div>
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Sl. No.</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Designation</th>
              <th className="border px-4 py-2">Amount of Advance Given</th>
              <th className="border px-4 py-2">Date of Advance Given</th>
              <th className="border px-4 py-2">Purpose of Advance Given</th>
              <th className="border px-4 py-2">Number of Installments</th>
              <th className="border px-4 py-2">Installments Left</th>
              <th className="border px-4 py-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {employees?.map((employee, index) => (
              <tr key={index} className="text-center">
                <td className="border px-4 py-2">{index+1}</td>
                <td className="border px-4 py-2">{employee.employeeName}</td>
                <td className="border px-4 py-2">{employee.designation}</td>
                <td className="border px-4 py-2">{employee.amountOfAdvanceGiven}</td>
                <td className="border px-4 py-2">{new Date(employee.dateOfAdvanceGiven).toISOString().split("T")[0]}</td>
                <td className="border px-4 py-2">{employee.purposeOfAdvanceGiven}</td>
                <td className="border px-4 py-2">{employee.numberOfInstallments}</td>
                <td className="border px-4 py-2">{employee.installmentsLeft}</td>
                <td className="border px-4 py-2">{employee.remarks}</td>
              </tr>
            ))}
            {employees?.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  No employees added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;

"use client";
import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const [wagesRate, setWagesRate] = useState("");
  const [wagesPeriod, setWagesPeriod] = useState("");
  const [tenureEmployement, setTenureEmployement] = useState("");
  const [remarks, setRemarks] = useState("");
  const [contractorName, setContractorName] = useState("");
  const [estName, setEstName] = useState("");
  const [workName, setWorkName] = useState("");
  const [principal, setPrincipal] = useState("");

  const params = useSearchParams();
  const name = params.get('name')
  const slNo = params.get('slNo')
  const designation = params.get('designation')

  // Function to handle generating the PDF in landscape
  const handleGeneratePdf = () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: "a4",
    });
  
    pdf.setFontSize(24);
    pdf.text("EMPLOYMENT CARD", pdf.internal.pageSize.getWidth() / 2, 30, { align: "center" });
  
    pdf.setFontSize(12);
  
    // Define the contractor and establishment information fields
    const fieldData = [
      ["Name and address of Contractor", contractorName],
      ["Name and address of Establishment", estName],
      ["Name and Location of Work", workName],
      ["Name and address of Principal Employer", principal],
    ];
  
    let startY = 50; // Starting Y position for the fields
  
    // Render each field in two-column format
    fieldData.forEach((field, index) => {
      const yPos = startY + index * 20; // Adjust vertical spacing between fields
      pdf.text(field[0] + ":", 40, yPos);
      pdf.text(field[1], pdf.internal.pageSize.getWidth() / 2, yPos);
    });
  
    // Define table content for remaining fields
    const tableData = [
      ['Name of the WorkMan',name],
      ["Sl. No. in the register of WorkMan Employed", slNo],
      ["Nature of Employement/Designation",designation],
      ["Wages Rate (with particulars of unit)", wagesRate],
      ["Wages Period", wagesPeriod],
      ["Tenure Employment", tenureEmployement],
      ["Remarks", remarks],
    ];
  
    // Render the table below the contractor fields
    autoTable(pdf, {
      body: tableData,
      startY: startY + fieldData.length * 20 + 10, // Position table below the last field
      theme: "grid",
      styles: { fontSize: 12, cellPadding: 8, halign: "center" },
      columnStyles: {
        0: { cellWidth: 200 },
        1: { cellWidth: 250 },
      },
    });
  
    pdf.save("employment_card.pdf");
  };
  
  

  return (
    <>
      <div className="ml-16" id="pdf-content">
        <p className="w-full text-center text-5xl font-bold">EMPLOYMENT CARD</p>
        <div className="mt-4">
          <div className="flex flex-row w-full p-2 justify-between px-20">
            <div className="flex flex-col items-center">
              <span>Name and address of Contractor</span>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter Value here"
              />
            </div>
            <div className="flex flex-col items-center">
              <span>
                Name and address of Establishment In/Under which contractor is
                carried on
              </span>
              <input
                type="text"
                value={estName}
                onChange={(e) => setEstName(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter Value here"
              />
            </div>
          </div>
          <div className="flex flex-row w-full p-2 justify-between px-20">
            <div className="flex flex-col items-center">
              <span>Name and Location of Work</span>
              <input
                type="text"
                value={workName}
                onChange={(e) => setWorkName(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter Value here"
              />
            </div>
            <div className="flex flex-col items-center">
              <span>Name and address of Principal Employer</span>
              <input
                type="text"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter Value here"
              />
            </div>
          </div>
        </div>
        <table className="w-full border-collapse border border-blue-500 mt-10">
          <thead>
            <tr>
              <th className="border border-blue-500 px-4 py-2">Field</th>
              <th className="border border-blue-500 px-4 py-2">Input</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-blue-500 px-4 py-2">
                Name of the WorkMan
              </td>
              <td className="border border-blue-500 px-4 py-2">
                {/* You can replace this with a text input if needed */}
                {name}
              </td>
            </tr>
            <tr>
              <td className="border border-blue-500 px-4 py-2">
                Sl. No. in the register of WorkMan Employed
              </td>
              <td className="border border-blue-500 px-4 py-2">
                {slNo}
              </td>
            </tr>
            <tr>
              <td className="border border-blue-500 px-4 py-2">
                Nature of Employment/Designation
              </td>
              <td className="border border-blue-500 px-4 py-2">
                {designation}
              </td>
            </tr>
            <tr>
              <td className="border border-blue-500 px-4 py-2">
                Wages Rate (with particulars of unit in case of piece work)
              </td>
              <td className="border border-blue-500 px-4 py-2">
                <input
                  type="number"
                  value={wagesRate}
                  onChange={(e) => setWagesRate(e.target.value)}
                  className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-blue-500 px-4 py-2">Wages Period</td>
              <td className="border border-blue-500 px-4 py-2">
                <input
                  type="number"
                  value={wagesPeriod}
                  onChange={(e) => setWagesPeriod(e.target.value)}
                  className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-blue-500 px-4 py-2">
                Tenure Employment
              </td>
              <td className="border border-blue-500 px-4 py-2">
                <input
                  type="number"
                  value={tenureEmployement}
                  onChange={(e) => setTenureEmployement(e.target.value)}
                  className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-blue-500 px-4 py-2">Remarks</td>
              <td className="border border-blue-500 px-4 py-2">
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Generate PDF Button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={handleGeneratePdf}
          className="bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600"
        >
          Generate PDF
        </button>
      </div>
    </>
  );
};

export default Page;

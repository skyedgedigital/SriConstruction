import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { storage } from "@/utils/fireBase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PpeAction from "@/lib/actions/ppe/ppeAction";
import toast from "react-hot-toast";
const PpeIssueAndReplacement = () => {
  const [rows, setRows] = useState([]);
  const sigCanvasRefs = useRef([]);
  const [revNo, setRevNo] = useState("");
  const [docNo, setDocNo] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [empCode,setEmpCode] = useState("");
  const [selectedDate,setSelectedDate] = useState("")

  const addRow = () => {
    setRows([
      ...rows,
      { ppeItem: "", type: "Issued", date: "", signature: null },
    ]);
  };

  const removeRow = (index) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleInputChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const saveSignature = (index) => {
    const signatureRef = sigCanvasRefs.current[index];
    if (signatureRef) {
      const newRows = [...rows];
      newRows[index].signature = signatureRef.toDataURL();
      setRows(newRows);
    }
  };

  const clearSignature = (index) => {
    const signatureRef = sigCanvasRefs.current[index];
    if (signatureRef) {
      signatureRef.clear();
      const newRows = [...rows];
      newRows[index].signature = null;
      setRows(newRows);
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("PPE Data");

    worksheet.addRow(["Rev No",revNo,"Document No",docNo,"Effective Date",effectiveDate])
    worksheet.addRow(["Employee Name",employeeName,"Employee Code",empCode])
    worksheet.addRow(["Designation",designation])
    worksheet.addRow(["Department",department])
    worksheet.addRow(["Site Location",siteLocation])
    worksheet.addRow(["Issue/Replacement Date",selectedDate])
    worksheet.addRow(["PPE Item","Type","Date","Signature"])

    worksheet.columns = [
      { key: "ppeItem", width: 20 },
      {  key: "type", width: 20 },
      {  key: "date", width: 20 },
      {  key: "signature", width: 40 },
    ];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = worksheet.addRow({
        ppeItem: row.ppeItem,
        type: row.type,
        date: row.date,
      }).number;

      if (row.signature) {
        const imageId = workbook.addImage({
          base64: row.signature,
          extension: "png",
        });
        worksheet.addImage(imageId, {
          tl: { col: 3, row: rowIndex - 1 },
          ext: { width: 200, height: 100 },
        });
      }
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow([]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `PPE_Issue_Replacement${selectedDate ? `_${selectedDate}` : ''}.xlsx`;
    // saveAs(new Blob([buffer]), "PPE_Issue_Replacement.xlsx");
    const storageRef = ref(storage, `PPE_IssueAndReplacement/${fileName}`);
    const metadata = {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const snapshot = await uploadBytes(storageRef, buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.warn(downloadURL);
    const obj = {
      link:downloadURL,
      revNo:revNo,
      docNo:docNo,
      date:selectedDate
    }
    const resp = await PpeAction.CREATE.createPpeIssueAndReplacement(JSON.stringify(obj))
    if(resp.success){
      toast.success("Excel Saved")
    }
    else{
      toast.error("An Error Occurred")
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div>
        <h1 className="text-center my-2 text-2xl">Add Ppe Issue/Replacement</h1>
        <div className="py-5 px-3 flex flex-wrap">
          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Document No.
            </label>
            <input
              type="text"
              id="input"
              value={docNo}
              onChange={(e) => {
                setDocNo(e.target.value);
              }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
              min="0"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Rev No.
            </label>
            <input
              type="text"
              id="input"
              value={revNo}
              onChange={(e) => {
                setRevNo(e.target.value);
              }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
              min="0"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Effective Date
            </label>
            <input
              type="date"
              id="date"
              value={effectiveDate}
              onChange={(e) => {
                setEffectiveDate(e.target.value);
              }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
              min="0"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Employee Name
            </label>
            <input
              type="text"
              id="date"
              value={employeeName}
              onChange={(e) => {
                setEmployeeName(e.target.value);
              }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
              min="0"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Employee Code No.
            </label>
            <input
              type="text"
              id="date"
              value={empCode}
              onChange={(e) => {
                setEmpCode(e.target.value);
              }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
              min="0"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Designation
            </label>
            <input
              type="text"
              id="date"
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);
              }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
              min="0"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Department
            </label>
            <input
              type="text"
              id="date"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
              }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
              min="0"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Site Location
            </label>
            <input
              type="text"
              id="date"
              value={siteLocation}
              onChange={(e) => {
                setSiteLocation(e.target.value);
              }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
              min="0"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Issue/Replacement Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
              }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
              min="0"
            />
          </div>


        </div>
      </div>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">PPE Item</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Signature of Recipient</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <React.Fragment key={index}>
              <tr>
                <td className="py-2 px-4 border-b">
                  <input
                    type="text"
                    value={row.ppeItem}
                    onChange={(e) =>
                      handleInputChange(index, "ppeItem", e.target.value)
                    }
                    className="border border-gray-300 p-2 w-full"
                  />
                </td>
                <td className="py-2 px-4 border-b">
                  <select
                    value={row.type}
                    onChange={(e) =>
                      handleInputChange(index, "type", e.target.value)
                    }
                    className="border border-gray-300 p-2 w-full"
                  >
                    <option value="Issued">Issued</option>
                    <option value="Replacement">Replacement</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b">
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) =>
                      handleInputChange(index, "date", e.target.value)
                    }
                    className="border border-gray-300 p-2 w-full"
                  />
                </td>
                <td className="py-2 px-4 border-b">
                  {row.signature ? (
                    <img src={row.signature} alt="Signature" className="h-24" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <SignatureCanvas
                        penColor="black"
                        canvasProps={{
                          width: 300,
                          height: 100,
                          className: "border border-gray-300",
                        }}
                        ref={(ref) => (sigCanvasRefs.current[index] = ref)}
                      />
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={() => saveSignature(index)}
                          className="bg-blue-500 text-white py-1 px-2 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => clearSignature(index)}
                          className="bg-red-500 text-white py-1 px-2 rounded"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => removeRow(index)}
                    className="bg-red-500 text-white py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              {[...Array(4)].map((_, i) => (
                <tr key={`spacer-${index}-${i}`} className="h-6">
                  <td colSpan={5}></td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex space-x-2">
        <button
          onClick={addRow}
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          Add Row
        </button>
        <button
          onClick={exportToExcel}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default PpeIssueAndReplacement;

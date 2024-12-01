import React, { useState } from 'react'
import SignatureCanvas from "react-signature-canvas";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/utils/fireBase/config';
import toast from 'react-hot-toast';
import SafetyToolsAction from '@/lib/actions/safetyTools/safetyToolsAction';
const SafetyToolIssueAndReplacement = () => {
    const [rows, setRows] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
  
    const addRow = () => {
      setRows([
        ...rows,
        {
          id: Date.now(), // Unique identifier for each row
          date: "",
          description: "",
          quantity: "",
          takenBySignature: "",
          givenBySignature: "",
          rnr: "",
          location: "",
          returnBySignature: "",
          receivedBySignature: "",
          remarks: "",
          takenBySignatureRef: React.createRef(),
          givenBySignatureRef: React.createRef(),
          returnBySignatureRef: React.createRef(),
          receivedBySignatureRef: React.createRef(),
        },
      ]);
    };
  
    const handleChange = (index, field, value) => {
      const newRows = [...rows];
      newRows[index][field] = value;
      setRows(newRows);
    };
  
    const handleSignature = (index, field, ref) => {
      const newRows = [...rows];
      newRows[index][field] = ref?.current?.toDataURL();
      setRows(newRows);
    };
  
    const clearSignature = (index, field, ref) => {
      ref.current.clear();
      handleSignature(index, field, ref);
    };
  
    const handleSubmit = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Chemical Issue and Replacement');
    
      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Taken By Signature', key: 'takenBySignature', width: 30 },
        { header: 'Given By Signature', key: 'givenBySignature', width: 30 },
        { header: 'R/NR', key: 'rnr', width: 10 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Return By Signature', key: 'returnBySignature', width: 30 },
        { header: 'Received By Signature', key: 'receivedBySignature', width: 30 },
        { header: 'Remarks', key: 'remarks', width: 30 },
      ];
    
      rows.forEach((row, rowIndex) => {
        const rowData = {
          date: row.date,
          description: row.description,
          quantity: row.quantity,
          rnr: row.rnr,
          location: row.location,
          remarks: row.remarks,
        };
    
        // Add row data
        const newRow = worksheet.addRow(rowData);
    
        // Add 4 empty rows after the current row
        for (let i = 0; i < 4; i++) {
          worksheet.addRow({});
        }
    
        // Add images for signatures
        const signatureKeys = [
          { key: 'takenBySignature', colIndex: 3 },
          { key: 'givenBySignature', colIndex: 4 },
          { key: 'returnBySignature', colIndex: 7 },
          { key: 'receivedBySignature', colIndex: 8 },
        ];
    
        signatureKeys.forEach(({ key, colIndex }) => {
          if (row[key]) {
            const imageId = workbook.addImage({
              base64: row[key],
              extension: 'png',
            });
    
            const startRow = newRow.number - 1;  // Images should start one row above
            const startCol = colIndex;
    
            worksheet.addImage(imageId, {
              tl: { col: startCol, row: startRow },
              ext: { width: 200, height: 50 },
            });
          }
        });
      });
    
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      let fileName = 'Tool_Issue_And_Replacement_' + (selectedDate !== "" ? `${selectedDate}` : "No_Date_Selected")+'.xlsx';
      const storageRef = ref(storage, `SafetyIndAndTraining/${fileName}`);
      const metadata = {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      const snapshot = await uploadBytes(storageRef, buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      if (downloadURL) {
        const obj = {
          link: downloadURL,
          date: selectedDate,
        };
        const resp = await SafetyToolsAction.CREATE.createIssueAndReplacement(JSON.stringify(obj))
        if (resp.success) {
          toast.success("File Saved");
        } else {
          toast.error("An Error Occurred!");
        }
      }
    };
  
    return (
      <div className="p-4">
        <div className='my-3'>
          <p className='text-center text-2xl font-semibold'>
            Chemical Issue And Replacement Register
          </p>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="border p-2 rounded" 
          />
        </div>
        <button
          className="bg-blue-500 text-white p-2 rounded mb-4"
          onClick={addRow}
        >
          Add Row
        </button>
        <div className="overflow-x-auto">
          <table className="min-w-max bg-white border-collapse">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Description</th>
                <th className="py-2 px-4 border">Quantity</th>
                <th className="py-2 px-4 border">Taken By Signature</th>
                <th className="py-2 px-4 border">Given By Signature</th>
                <th className="py-2 px-4 border">R/NR</th>
                <th className="py-2 px-4 border">Location</th>
                <th className="py-2 px-4 border">Return By Signature</th>
                <th className="py-2 px-4 border">Received By Signature</th>
                <th className="py-2 px-4 border">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="border p-2">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => handleChange(index, "date", e.target.value)}
                      className="w-full border p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <textarea
                      value={row.description}
                      onChange={(e) => handleChange(index, "description", e.target.value)}
                      className="w-full border p-1"
                      
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => handleChange(index, "quantity", e.target.value)}
                      className="w-full border p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <SignatureCanvas
                      penColor="black"
                      canvasProps={{ className: "sigCanvas border w-full h-16" }}
                      ref={row.takenBySignatureRef}
                      onEnd={() => handleSignature(index, "takenBySignature", row.takenBySignatureRef)}
                    />
                    <button
                      className="bg-red-500 text-white p-1 mt-1 rounded"
                      onClick={() => clearSignature(index, "takenBySignature", row.takenBySignatureRef)}
                    >
                      Clear
                    </button>
                  </td>
                  <td className="border p-2">
                    <SignatureCanvas
                      penColor="black"
                      canvasProps={{ className: "sigCanvas border w-full h-16" }}
                      ref={row.givenBySignatureRef}
                      onEnd={() => handleSignature(index, "givenBySignature", row.givenBySignatureRef)}
                    />
                    <button
                      className="bg-red-500 text-white p-1 mt-1 rounded"
                      onClick={() => clearSignature(index, "givenBySignature", row.givenBySignatureRef)}
                    >
                      Clear
                    </button>
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.rnr}
                      onChange={(e) => handleChange(index, "rnr", e.target.value)}
                      className="w-full border p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.location}
                      onChange={(e) => handleChange(index, "location", e.target.value)}
                      className="w-full border p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <SignatureCanvas
                      penColor="black"
                      canvasProps={{ className: "sigCanvas border w-full h-16" }}
                      ref={row.returnBySignatureRef}
                      onEnd={() => handleSignature(index, "returnBySignature", row.returnBySignatureRef)}
                    />
                    <button
                      className="bg-red-500 text-white p-1 mt-1 rounded"
                      onClick={() => clearSignature(index, "returnBySignature", row.returnBySignatureRef)}
                    >
                      Clear
                    </button>
                  </td>
                  <td className="border p-2">
                    <SignatureCanvas
                      penColor="black"
                      canvasProps={{ className: "sigCanvas border w-full h-16" }}
                      ref={row.receivedBySignatureRef}
                      onEnd={() => handleSignature(index, "receivedBySignature", row.receivedBySignatureRef)}
                    />
                    <button
                      className="bg-red-500 text-white p-1 mt-1 rounded"
                      onClick={() => clearSignature(index, "receivedBySignature", row.receivedBySignatureRef)}
                    >
                      Clear
                    </button>
                  </td>
                  <td className="border p-2">
                    <textarea
                      value={row.remarks}
                      onChange={(e) => handleChange(index, "remarks", e.target.value)}
                      className="w-full border p-1"
                      
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="bg-green-500 text-white p-2 rounded mt-4"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    );
}

export default SafetyToolIssueAndReplacement

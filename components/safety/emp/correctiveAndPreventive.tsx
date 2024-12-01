import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { storage } from "@/utils/fireBase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import weeklyAuditAction from "@/lib/actions/SafetyEmp/weekly/weeklyAction";
import toast from "react-hot-toast";
const CorrectiveAndPreventive = () => {
  const [revNo, setRevNo] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [docNo, setDocNo] = useState("");
  const [capa, setCapa] = useState("");
  const [severity, setSeverity] = useState("");
  const [raisedBy, setRaisedBy] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [raisedByDate, setRaisedByDate] = useState("");
  const [raisedByRemarks, setRaisedByRemarks] = useState("");
  const [description, setDescription] = useState("");
  const [immediateAction, setImmediateAction] = useState("");
  const [completedBy, setCompletedBy] = useState("");
  const [completedByDate, setCompletedByDate] = useState("");
  const [completedByRemarks, setCompletedByRemarks] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [determinedBy, setDeterminedBy] = useState("");
  const [determinedByDate, setDeterminedByDate] = useState("");
  const [determinedByRemarks, setDeterminedByRemarks] = useState("");
  const [actionLongTerm, setActionLongTerm] = useState("");
  const [closedByDate, setClosedByDate] = useState("");
  const [closedBy, setClosedBy] = useState("");
  const [closedByRemarks, setClosedByRemarks] = useState("");
  const [verifiedByDate, setVerifiedByDate] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [verifiedByRemarks, setVerifiedByRemarks] = useState("");
  const [approvedBySignature, setApprovedBySignature] = useState("");
  const [preparedBySignature, setPreparedBySignature] = useState("");

  const approvedBySigPad = useRef(null);
  const preparedBySigPad = useRef(null);
  const signatureRef1 = useRef(null);
  const signatureRef2 = useRef(null);

  // Clear functions for signatures
  const clearSignature1 = () => signatureRef1.current.clear();
  const clearSignature2 = () => signatureRef2.current.clear();

  const saveSignature1 = () => {
    const signature1DataURL = signatureRef1.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    setApprovedBySignature(signature1DataURL);
  };

  const saveSignature2 = () => {
    const signature2DataURL = signatureRef2.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    setPreparedBySignature(signature2DataURL);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Corrective and Preventive Actions");

    for (let i = 1; i <= 6; i++) {
      worksheet.getColumn(i).width = 20; // Adjust the width as per your requirement
    }
  
    // Add other form fields here...
    worksheet.addRow(["Rev No", revNo, "Effective Date", effectiveDate]);
    worksheet.addRow(["Document No", docNo]);
    worksheet.addRow([]);
    worksheet.addRow(["CAPA No", capa]);
    worksheet.addRow(["Severity", severity]);
    worksheet.addRow(["Raised By", raisedBy, "Assigned To", assignedTo, "Date", raisedByDate]);
    worksheet.addRow(["Description"]);
    worksheet.addRow([description]);
    worksheet.addRow(["Immediate Action (Correction)"]);
    worksheet.addRow([immediateAction]);
    worksheet.addRow(["Completed by", completedBy, "Date", completedByDate, "Remarks", completedByRemarks]);
    worksheet.addRow(["Root Cause"]);
    worksheet.addRow([rootCause]);
    worksheet.addRow(["Determined By", determinedBy, "Date", determinedByDate, "Remarks", determinedByRemarks]);
    worksheet.addRow(["Action for Long term Solution (Corrective/Preventive Action)"]);
    worksheet.addRow([actionLongTerm]);
    worksheet.addRow(["Closed By", closedBy, "Date", closedByDate, "Remarks", closedByRemarks]);
    worksheet.addRow(["Verified By", verifiedBy, "Date", verifiedByDate, "Remarks", verifiedByRemarks]);
  
    // Add approved by signature
    worksheet.addRow([]);
    worksheet.addRow(["Approved By Signature"]);
    if (approvedBySignature) {
      const imageId = workbook.addImage({
        base64: approvedBySignature,
        extension: "png",
      });
      worksheet.addImage(imageId, {
        tl: { col: 1, row: worksheet.rowCount + 1 },
        ext: { width: 200, height: 100 },
      });
    }
  
    // Insert empty rows to create vertical space
    for (let i = 0; i < 5; i++) {
      worksheet.addRow([]);
    }
  
    // Add prepared by signature
    worksheet.addRow(["Prepared By Signature"]);
    if (preparedBySignature) {
      const imageId = workbook.addImage({
        base64: preparedBySignature,
        extension: "png",
      });
      worksheet.addImage(imageId, {
        tl: { col: 1, row: worksheet.rowCount + 1 },
        ext: { width: 200, height: 100 },
      });
    }
  
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `Corrective_And_Preventive${raisedByDate ? `_${raisedByDate}` : ''}.xlsx`;
    const storageRef = ref(storage, `SafetyIndAndTraining/${fileName}`);
    const metadata = {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const snapshot = await uploadBytes(storageRef, buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    if(downloadURL){
      console.warn(downloadURL)
      const obj = {
        link:downloadURL,
        date:raisedByDate,
        revNo:revNo,
        docNo:docNo
      }
      const resp = await weeklyAuditAction.CREATE.createCorrectiveAndPrev(JSON.stringify(obj))
      if(resp.success){
        toast.success("Excel Saved")
      }
      else{
        toast.error("An Error Occurred");
      }
    }
    // saveAs(new Blob([buffer]), `CorrectiveAndPreventiveActions.xlsx`);
  };
  
  

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">
          Corrective and Preventive Actions
        </h2>

        <div className="flex flex-wrap">
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
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
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
              id="input"
              value={effectiveDate}
              onChange={(e) => {
                setEffectiveDate(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

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
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          
        </div>

        <div className="flex flex-wrap">
          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              CAPA No.
            </label>
            <input
              type="text"
              id="input"
              value={capa}
              onChange={(e) => {
                setCapa(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Severity
            </label>
            <input
              type="text"
              id="input"
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Raised By
            </label>
            <input
              type="text"
              id="input"
              value={raisedBy}
              onChange={(e) => {
                setRaisedBy(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Assigned To:
            </label>
            <input
              type="text"
              id="input"
              value={assignedTo}
              onChange={(e) => {
                setAssignedTo(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Date:
            </label>
            <input
              type="date"
              id="input"
              value={raisedByDate}
              onChange={(e) => {
                setRaisedByDate(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Remarks:
            </label>
            <textarea
              id="input"
              value={raisedByRemarks}
              onChange={(e) => {
                setRaisedByRemarks(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>
        </div>

        <div className="m-2">
          <label htmlFor="textarea">Description</label>
          <textarea
            className="p-3 w-full h-auto border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
            placeholder="Enter Description here"
            name="desc"
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="m-2">
          <label htmlFor="textarea">Immediate Action</label>
          <textarea
            className="p-3 w-full h-auto border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
            placeholder="Enter Description here"
            name="immediateAction"
            id="immediateAction"
            value={immediateAction}
            onChange={(e) => setImmediateAction(e.target.value)}
          ></textarea>
        </div>

        <div className="flex flex-wrap">
          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Completed By:
            </label>
            <input
              type="text"
              id="input"
              value={completedBy}
              onChange={(e) => {
                setCompletedBy(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Date:
            </label>
            <input
              type="date"
              id="input"
              value={completedByDate}
              onChange={(e) => {
                setCompletedByDate(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Remarks:
            </label>
            <textarea
              id="input"
              value={completedByRemarks}
              onChange={(e) => {
                setCompletedByRemarks(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>
        </div>

        <div className="m-2">
          <label htmlFor="textarea">Root Cause:</label>
          <textarea
            className="p-3 w-full h-auto border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
            name="input"
            id="input"
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
          ></textarea>
        </div>

        <div className="flex flex-wrap">
          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Determined By:
            </label>
            <input
              type="text"
              id="input"
              value={determinedBy}
              onChange={(e) => {
                setDeterminedBy(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Date:
            </label>
            <input
              type="date"
              id="input"
              value={determinedByDate}
              onChange={(e) => {
                setDeterminedByDate(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Remarks:
            </label>
            <textarea
              id="input"
              value={determinedByRemarks}
              onChange={(e) => {
                setDeterminedByRemarks(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>
        </div>

        <div className="m-2">
          <label htmlFor="textarea">Action for Long Term Solution:</label>
          <textarea
            className="p-3 w-full h-auto border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
            name="input"
            id="input"
            value={actionLongTerm}
            onChange={(e) => setActionLongTerm(e.target.value)}
          ></textarea>
        </div>

        <div className="flex flex-wrap">
          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Closed By:
            </label>
            <input
              type="text"
              id="input"
              value={closedBy}
              onChange={(e) => {
                setClosedBy(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Date:
            </label>
            <input
              type="date"
              id="input"
              value={closedByDate}
              onChange={(e) => {
                setClosedByDate(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Remarks:
            </label>
            <textarea
              id="input"
              value={closedByRemarks}
              onChange={(e) => {
                setClosedByRemarks(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Verified By:
            </label>
            <input
              type="text"
              id="input"
              value={verifiedBy}
              onChange={(e) => {
                setVerifiedBy(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Date:
            </label>
            <input
              type="date"
              id="input"
              value={verifiedByDate}
              onChange={(e) => {
                setVerifiedByDate(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Remarks:
            </label>
            <textarea
              id="input"
              value={verifiedByRemarks}
              onChange={(e) => {
                setVerifiedByRemarks(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>
        </div>

        <div>
          <div className="m-4">
            <label className="block text-sm font-medium text-gray-700">
              Approved By Signature
            </label>
            <SignatureCanvas
              ref={signatureRef1}
              penColor="black"
              canvasProps={{ className: "border border-gray-300 w-full h-24" }}
            />
            <button
              type="button"
              onClick={clearSignature1}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-700 mt-2"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={saveSignature1}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 mt-2 ml-2"
            >
              Save
            </button>
            {approvedBySignature && (
              <img className="border-blue-500" src={approvedBySignature} alt="approvedBySign" />
            )}
          </div>

          <div className="m-4">
            <label className="block text-sm font-medium text-gray-700">
              Prepared By Signature
            </label>
            <SignatureCanvas
              ref={signatureRef2}
              penColor="black"
              canvasProps={{ className: "border border-gray-300 w-full h-24" }}
            />
            <button
              type="button"
              onClick={clearSignature2}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-700 mt-2"
            >
              Clear 
            </button>
            <button
              type="button"
              onClick={saveSignature2}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 mt-2 ml-2"
            >
              Save 
            </button>
            {preparedBySignature && (
              <img className="border-blue-400" src={preparedBySignature} alt="Prepared By Signature" />
            )}
          </div>
        </div>

        <button
          onClick={exportToExcel}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Export to Excel
        </button>
      </div>
    </>
  );
};

export default CorrectiveAndPreventive;

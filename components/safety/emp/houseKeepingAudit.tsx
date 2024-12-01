import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { storage } from "@/utils/fireBase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import weeklyAuditAction from "@/lib/actions/SafetyEmp/weekly/weeklyAction";
import toast from "react-hot-toast";

const groupHeadings = [
  "1S- SEIRI (Sort Out)",
  "2S - SEITON (Set in order)",
  "3S - SEISO (CLEANING)",
  "4S - SEIKETSU (STANDARDIZE)",
  "5S -SHITSUKE (SUSTAIN)"
]

const questions = [
  "No unwanted things are lying on M/c, table, self etc",
  "Things are not kept which are not in use.",
  "No spare component, tools, files, paper, etc, are lying unnecessarily.",
  "Things which cannot be used are removed.",
  "Call notice boards are displays of information are arranged properly.",
  "Specified place for keeping components, tools and files.",
  "Everyone is keeping things at decided place.",
  "An arrangement of restroom is good.",
  "Bench, table, chair, computer, printer, telephone and cups are kept properly.",
  "The identification system of the entire above is good.",
  "There is no scrap, dust, oil leakage and water leakage.",
  "Cleaning of machine is good.",
  "No dirt, dust, cobweb, all spillage in the room of workplace.",
  "Scrap-bin/Dustbin are not overflowing.",
  "Places for keeping component, tools, gauge and file are specified.",
  "Places for keeping component, tools, gauge and file are neat and tidy.",
  "The work area is not dirty.",
  "The machine and gauge are not dirty.",
  "The machine are being inspected and maintained in good condition.",
  "Indications are easy to see or not.",
  "All workers are using required PPE.",
  "PPE used are being worn properly.",
  "People are not smoking spitting at workplace.",
  "Dustbins for waste material are kept in place.",
  "Everyone is keeping things in decided place.",
];

const HouseKeepingAudit = () => {
  const [responses, setResponses] = useState(
    questions.map(() => ({ yes: false, no: false, action: "" }))
  );
  const [signature, setSignature] = useState(null);
  const [date, setDate] = useState("");
  const [sheetNo, setSheetNo] = useState("");
  const [revNo, setRevNo] = useState("");
  const [docNo, setDocNo] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [area, setArea] = useState("");
  const [members, setMembers] = useState("");
  const sigCanvas = useRef({});

  const handleRadioChange = (index, value) => {
    setResponses(
      responses.map((response, i) =>
        i === index
          ? { ...response, yes: value === "yes", no: value === "no" }
          : response
      )
    );
  };

  const handleActionChange = (index, value) => {
    setResponses(
      responses.map((response, i) =>
        i === index ? { ...response, action: value } : response
      )
    );
  };

  const handleClear = () => {
    //@ts-ignore
    sigCanvas.current.clear();
  };

  const handleSave = () => {
    //@ts-ignore
    setSignature(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
  };

  const uploadToFirebase = async (buffer, filename) => {
    const storageRef = ref(storage, `audit_reports/${filename}`);
    const metadata = {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const snapshot = await uploadBytes(storageRef, buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    if(downloadURL){
      const obj = {
        link:downloadURL,
        date:date,
        revNo:revNo,
        docNo:docNo
      }
      const resp = await weeklyAuditAction.CREATE.createHouseKeepingAudit(JSON.stringify(obj))
      if(resp.success){
        toast.success("Excel Saved");
      }
      else{
        toast.error("An Error Occurred")
      }
    }
    console.log('File available at', downloadURL);
    // alert(`File uploaded successfully! URL: ${downloadURL}`);
  };

  const exportToExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Audit Data");

    // Add extra fields to the sheet
    worksheet.addRow(["Audit Date", date]);
    worksheet.addRow(["Sheet No.", sheetNo]);
    worksheet.addRow(["Doc No.", docNo]);
    worksheet.addRow(["Rev No.", revNo]);
    worksheet.addRow(["Effective Date", effectiveDate]);
    worksheet.addRow(["Area", area]);
    worksheet.addRow(["Members Present", members]);
    worksheet.addRow([]);

    worksheet.columns = [
      { header: "Questions", key: "questions", width: 50 },
      { header: "Yes", key: "yes", width: 10 },
      { header: "No", key: "no", width: 10 },
      { header: "Actions Taken", key: "actions_taken", width: 30 },
    ];

    data.forEach((item) => {
      if (item.group) {
        worksheet.addRow([item.group, "", "", ""]).font = { bold: true };
      } else {
        worksheet.addRow(item);
      }
    });

    // Add signature to the last row
    const signatureRow = worksheet.addRow(["Signature"]);
    if (signature) {
      const imageId = workbook.addImage({
        base64: signature,
        extension: "png",
      });
      worksheet.addImage(imageId, {
        tl: { col: 3, row: signatureRow.number - 1 },
        ext: { width: 150, height: 100 },
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `HouseKeepingAudit${date ? `_${date}` : ""}.xlsx`;
    await uploadToFirebase(buffer, filename);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!signature) {
      alert("Please provide a signature.");
      return;
    }

    const data = [];
    questions.forEach((question, index) => {
      if (index % 5 === 0) {
        data.push({ group: `Group ${Math.floor(index / 5) + 1} Questions` });
      }
      data.push({
        questions: question,
        yes: responses[index].yes ? "Yes" : "",
        no: responses[index].no ? "No" : "",
        actions_taken: responses[index].action,
      });
    });

    exportToExcel(data);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">HouseKeeping Audit</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Audit Date
            </label>
            <input
              type="date"
              id="input"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
              }}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Date Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Sheet No.
            </label>
            <input
              type="text"
              id="input"
              value={sheetNo}
              onChange={(e) => {
                setSheetNo(e.target.value);
              }}
              className="mt-1  block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Doc No.
            </label>
            <input
              type="text"
              id="input"
              value={docNo}
              onChange={(e) => {
                setDocNo(e.target.value);
              }}
              className="mt-1  block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
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
              className="mt-1  block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              className="mt-1  block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Area
            </label>
            <input
              type="text"
              id="input"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
              }}
              className="mt-1  block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>

          <div className="m-4">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Members Present
            </label>
            <input
              type="text"
              id="input"
              value={members}
              onChange={(e) => {
                setMembers(e.target.value);
              }}
              className="mt-1  block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Here"
            />
          </div>
        </div>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="py-3 px-6 border-b font-medium text-gray-700">
                Questions
              </th>
              <th className="py-3 px-6 border-b font-medium text-gray-700">
                Yes
              </th>
              <th className="py-3 px-6 border-b font-medium text-gray-700">
                No
              </th>
              <th className="py-3 px-6 border-b font-medium text-gray-700">
                Actions Taken
              </th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <React.Fragment key={index}>
                {index % 5 === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="bg-gray-100 py-2 px-6 font-semibold text-gray-800"
                    >
                      {/* {`Group ${Math.floor(index / 5) + 1} Questions`} */}
                      {groupHeadings[Math.floor(index/5)]}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-3 px-6 border-b">{question}</td>
                  <td className="py-3 px-6 border-b text-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={responses[index].yes}
                      onChange={() => handleRadioChange(index, "yes")}
                    />
                  </td>
                  <td className="py-3 px-6 border-b text-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={responses[index].no}
                      onChange={() => handleRadioChange(index, "no")}
                    />
                  </td>
                  <td className="py-3 px-6 border-b">
                    <input
                      type="text"
                      value={responses[index].action}
                      onChange={(e) =>
                        handleActionChange(index, e.target.value)
                      }
                      className="border border-gray-300 rounded p-1 w-full"
                    />
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-2">Signature</h3>
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{ className: "border border-gray-300 w-full h-48" }}
          />
          <div className="mt-2">
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-700 mr-2"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
          {signature && (
            <div className="mt-4">
              <img
                src={signature}
                alt="Saved Signature"
                className="border border-gray-300"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default HouseKeepingAudit;

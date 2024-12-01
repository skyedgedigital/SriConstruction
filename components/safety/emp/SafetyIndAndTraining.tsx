import React, { useState, useRef, use } from "react";
import SignatureCanvas from "react-signature-canvas";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { storage } from "@/utils/fireBase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import weeklyAuditAction from "@/lib/actions/SafetyEmp/weekly/weeklyAction";
import toast from "react-hot-toast";

const SafetyIndAndTraining = () => {
  const [employees, setEmployees] = useState([]);
  const sigCanvasRefs = useRef([]);
  const [revNo, setRevNo] = useState("");
  const [docNo, setDocNo] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [workName, setWorkName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [trainingTopic, setTrainingTopic] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [sop, setSop] = useState("");
  const [totalManPower, setTotalManPower] = useState("");
  const [workers, setWorkers] = useState("");
  const [supervisors, setSuperVisors] = useState("");
  const [safety, setSafety] = useState("");

  const handleAddRow = () => {
    setEmployees([
      ...employees,
      { empId: "", empName: "", trade: "", signature: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    const newEmployees = employees.filter((_, i) => i !== index);
    setEmployees(newEmployees);
  };

  const handleInputChange = (index, field, value) => {
    const newEmployees = employees.map((emp, i) =>
      i === index ? { ...emp, [field]: value } : emp
    );
    setEmployees(newEmployees);
  };

  const handleSaveSignature = (index) => {
    const signature = sigCanvasRefs.current[index]
      .getTrimmedCanvas()
      .toDataURL("image/png");
    const newEmployees = employees.map((emp, i) =>
      i === index ? { ...emp, signature } : emp
    );
    setEmployees(newEmployees);
  };

  const handleClearSignature = (index) => {
    sigCanvasRefs.current[index].clear();
    const newEmployees = employees.map((emp, i) =>
      i === index ? { ...emp, signature: "" } : emp
    );
    setEmployees(newEmployees);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Safety InductionTraining");

    // Add additional fields as headers
    worksheet.addRow(["Rev No.", revNo]);
    worksheet.addRow(["Doc No.", docNo]);
    worksheet.addRow(["Effective Date", effectiveDate]);
    worksheet.addRow(["Name of Work", workName]);
    worksheet.addRow(["Date", date]);
    worksheet.addRow(["Work Order Number", workOrder]);
    worksheet.addRow(["Time", time]);
    worksheet.addRow(["Training Topic", trainingTopic]);
    worksheet.addRow(["Trainer Name", trainerName]);
    worksheet.addRow(["SOP/SWP Ref No.", sop]);
    worksheet.addRow(["Total Man Power", totalManPower]);
    worksheet.addRow(["Total Workers", workers]);
    worksheet.addRow(["Supervisors", supervisors]);
    worksheet.addRow(["Safety", safety]);

    // Add a blank row for spacing
    worksheet.addRow([]);
    worksheet.addRow(["EmpId","Emp Name","Trade","Signature"]);

    // Define employee columns
    worksheet.columns = [
      { header: "", key: "empId", width: 15 },
      { header: "", key: "empName", width: 25 },
      { header: "", key: "trade", width: 20 },
      { header: "", key: "signature", width: 30 },
    ];

    // Add employee data
    employees.forEach((emp, index) => {
      const rowIndex = worksheet.rowCount + 1; // Get the next available row

      worksheet.addRow({
        empId: emp.empId,
        empName: emp.empName,
        trade: emp.trade,
      });

      if (emp.signature) {
        const imageId = workbook.addImage({
          base64: emp.signature,
          extension: "png",
        });
        worksheet.addImage(imageId, {
          tl: { col: 3, row: rowIndex + 1 }, // Adjust the row for the image
          ext: { width: 100, height: 50 },
        });
      }

      for (let i = 0; i < 4; i++) {
        worksheet.addRow([]); // Add empty rows for spacing
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `SafetyInductionTraining${date ? `_${date}` : ''}.xlsx`;
    const storageRef = ref(storage, `SafetyIndAndTraining/${fileName}`);
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
      const resp = await weeklyAuditAction.CREATE.createSafetyIndAndTraining(JSON.stringify(obj))
      if(resp.success){
        toast.success("Excel Saved")
      }
      else{
        toast.error("Error saving Excel")
      }
    }
    console.warn(downloadURL)
  };



  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">
        Safety Induction/Training Attendance Register
      </h2>
      <div className="flex flex-wrap p-3">
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
            Doc No.
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
            Name of Work
          </label>
          <input
            type="text"
            id="input"
            value={workName}
            onChange={(e) => {
              setWorkName(e.target.value);
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
            Date
          </label>
          <input
            type="date"
            id="input"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
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
            Work Order Number
          </label>
          <input
            type="text"
            id="input"
            value={workOrder}
            onChange={(e) => {
              setWorkOrder(e.target.value);
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
            Time
          </label>
          <input
            type="time"
            id="input"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
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
            Training Topic
          </label>
          <input
            type="text"
            id="input"
            value={trainingTopic}
            onChange={(e) => {
              setTrainingTopic(e.target.value);
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
            Trainer Name
          </label>
          <input
            type="text"
            id="input"
            value={trainerName}
            onChange={(e) => {
              setTrainerName(e.target.value);
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
            Sop/SWP Ref No.
          </label>
          <input
            type="text"
            id="input"
            value={sop}
            onChange={(e) => {
              setSop(e.target.value);
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
            Total Man Power
          </label>
          <input
            type="text"
            id="input"
            value={totalManPower}
            onChange={(e) => {
              setTotalManPower(e.target.value);
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
            Total Workers
          </label>
          <input
            type="text"
            id="input"
            value={workers}
            onChange={(e) => {
              setWorkers(e.target.value);
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
            Supervisors
          </label>
          <input
            type="text"
            id="input"
            value={supervisors}
            onChange={(e) => {
              setSuperVisors(e.target.value);
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
            Safety
          </label>
          <input
            type="text"
            id="input"
            value={safety}
            onChange={(e) => {
              setSafety(e.target.value);
            }}
            className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Here"
          />
        </div>
      </div>
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead>
          <tr>
            <th className="py-3 px-6 border-b font-medium text-gray-700">
              EmpId
            </th>
            <th className="py-3 px-6 border-b font-medium text-gray-700">
              Emp Name
            </th>
            <th className="py-3 px-6 border-b font-medium text-gray-700">
              Trade
            </th>
            <th className="py-3 px-6 border-b font-medium text-gray-700">
              Signature
            </th>
            <th className="py-3 px-6 border-b font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => (
            <tr key={index}>
              <td className="py-3 px-6 border-b">
                <input
                  type="text"
                  value={employee.empId}
                  onChange={(e) =>
                    handleInputChange(index, "empId", e.target.value)
                  }
                  className="border border-gray-300 rounded p-1 w-full"
                />
              </td>
              <td className="py-3 px-6 border-b">
                <input
                  type="text"
                  value={employee.empName}
                  onChange={(e) =>
                    handleInputChange(index, "empName", e.target.value)
                  }
                  className="border border-gray-300 rounded p-1 w-full"
                />
              </td>
              <td className="py-3 px-6 border-b">
                <input
                  type="text"
                  value={employee.trade}
                  onChange={(e) =>
                    handleInputChange(index, "trade", e.target.value)
                  }
                  className="border border-gray-300 rounded p-1 w-full"
                />
              </td>
              <td className="py-3 px-6 border-b">
                <SignatureCanvas
                  ref={(el) => (sigCanvasRefs.current[index] = el)}
                  penColor="black"
                  canvasProps={{
                    className: "border border-gray-300 w-full h-24",
                  }}
                />
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveSignature(index)}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-700 mr-2"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearSignature(index)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
                  >
                    Clear
                  </button>
                </div>
                {employee.signature && (
                  <div className="mt-2">
                    <img
                      src={employee.signature}
                      alt="Saved Signature"
                      className="border border-gray-300"
                    />
                  </div>
                )}
              </td>
              <td className="py-3 px-6 border-b text-center">
                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <button
          type="button"
          onClick={handleAddRow}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 mr-2"
        >
          Add Row
        </button>
        <button
          type="button"
          onClick={exportToExcel}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-700"
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default SafetyIndAndTraining;

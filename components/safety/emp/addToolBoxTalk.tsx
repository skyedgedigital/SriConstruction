import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { storage } from "@/utils/fireBase/config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import toast from "react-hot-toast";
import toolBoxTalkAction from "@/lib/actions/SafetyEmp/daily/toolBoxTalk/toolBoxTalkAction";
const AddToolBoxTalk = () => {
  const [selectedDate, setSelectedDate] = useState("");

  const [formData, setFormData] = useState({
    sheetNo: "",
    revNo: "",
    effectiveDate: "",
    documentNo: "",
    programName: "",
    workOrderNo: "",
    time: "",
    safetyRep: "",
    vendorCode: "",
    contractorRep: "",
    supervisor: "",
    totalManpower: "",
    workers: "",
    supervisors: "",
    emps: "",
    safety: "",
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    options: {
      option1: false,
      option2: false,
      option3: false,
      option4: false,
      option5: false,
      option6: false,
      option7: false,
      option8: false,
      option9: false,
    },
    q5: "",
    suggestion: "",
    feedback: "",
  });

  const [tableData, setTableData] = useState([]);
  const [newAction, setNewAction] = useState("");
  const [newWhen, setNewWhen] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const handleAddRow = () => {
    if (newAction && newWhen && newDate && newStatus) {
      setTableData([
        ...tableData,
        { action: newAction, when: newWhen, date: newDate, status: newStatus },
      ]);
      setNewAction("");
      setNewWhen("");
      setNewDate("");
      setNewStatus("");
    }
  };

  const handleDeleteRow = (index) => {
    const updatedData = tableData.filter((_, i) => i !== index);
    setTableData(updatedData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        [name]: checked,
      },
    }));
  };

  const generateExcel = () => {
    console.log(tableData);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ["Label", "Value"],
      ["Sheet No.", formData.sheetNo],
      ["Rev No.", formData.revNo],
      ["Effective Date", formData.effectiveDate],
      ["Document No.", formData.documentNo],
      ["Name of the Program", formData.programName],
      ["Work Order Number", formData.workOrderNo],
      ["Time", formData.time],
      ["Safety Representative", formData.safetyRep],
      ["Vendor Code", formData.vendorCode],
      ["Contractor Representative", formData.contractorRep],
      ["Supervisor", formData.supervisor],
      ["Total Manpower", formData.totalManpower],
      ["Workers", formData.workers],
      ["Supervisors", formData.supervisors],
      ["Emps", formData.emps],
      ["Safety", formData.safety],
      ["First Question", formData.q1],
      ["Second Question", formData.q2],
      ["Third Question", formData.q3],
      ["Fourth Question", formData.q4],
      ["Options"],
      ["Option 1", formData.options.option1],
      ["Option 2", formData.options.option2],
      ["Option 3", formData.options.option3],
      ["Option 4", formData.options.option4],
      ["Option 5", formData.options.option5],
      ["Option 6", formData.options.option6],
      ["Option 7", formData.options.option7],
      ["Option 8", formData.options.option8],
      ["Option 9", formData.options.option9],
      ["Fifth Question", formData.q5],
      ["Suggestion", formData.suggestion],
      ["Feedback", formData.feedback],
      ["Actions Taken"],
      ["Action", "When", "Date", "Status"]
    ]);
  
    // Determine the starting row index for tableData
    const startingRowIndex = 38; // Hardcoded based on observed issue
  
    tableData.forEach((row, index) => {
      const currentRowIndex = startingRowIndex + index;
      ws[`A${currentRowIndex}`] = { v: row.action };
      ws[`B${currentRowIndex}`] = { v: row.when };
      ws[`C${currentRowIndex}`] = { v: row.date };
      ws[`D${currentRowIndex}`] = { v: row.status };
    });
  
    // Manually set the !ref to ensure worksheet dimensions include the new data
    ws['!ref'] = `A1:D${startingRowIndex + tableData.length - 1}`;

    ws['!cols'] = [
      { wch: 20 },  // Column A width
      { wch: 20 },  // Column B width
      { wch: 20 },  // Column C width
      { wch: 20 }   // Column D width
    ];
  
    XLSX.utils.book_append_sheet(wb, ws, "Form Data");
    XLSX.writeFile(wb,`Tool_Box_Talk${selectedDate || "No_Date"}.xlsx`);

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    const storageRef = ref(
      storage,
      `excel/Tool_Box_Talk${selectedDate || "No_Date"}.xlsx`
    );
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Error uploading Excel to Firebase:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL) => {
          const obj = {
            link:downloadURL,
            sheetNo:formData.sheetNo,
            revNo:formData.revNo,
            date:selectedDate
          }
          const resp = await toolBoxTalkAction.CREATE.createToolBoxTalk(JSON.stringify(obj))
          if(resp.success){
            toast.success("Excel Saved")
          }
          else{
            toast.error("Error Occurred")
          }
          console.log("Excel available at", downloadURL);
        });
      }
    );

  };
  
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
    // generatePDF();
    generateExcel();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4">Document Form</h1>
      <div>
        Date : <input type="date" name="date" id="date" value={selectedDate} onChange={(e)=>{
          setSelectedDate(e.target.value);
        }} />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          {/* Sheet No. */}
          <div className="form-group">
            <label
              htmlFor="sheetNo"
              className="block text-sm font-medium text-gray-700"
            >
              Sheet No.
            </label>
            <input
              type="text"
              id="sheetNo"
              name="sheetNo"
              value={formData.sheetNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Rev No. */}
          <div className="form-group">
            <label
              htmlFor="revNo"
              className="block text-sm font-medium text-gray-700"
            >
              Rev No.
            </label>
            <input
              type="text"
              id="revNo"
              name="revNo"
              value={formData.revNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Effective Date */}
          <div className="form-group">
            <label
              htmlFor="effectiveDate"
              className="block text-sm font-medium text-gray-700"
            >
              Effective Date
            </label>
            <input
              type="date"
              id="effectiveDate"
              name="effectiveDate"
              value={formData.effectiveDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Document No. */}
          <div className="form-group">
            <label
              htmlFor="documentNo"
              className="block text-sm font-medium text-gray-700"
            >
              Document No.
            </label>
            <input
              type="text"
              id="documentNo"
              name="documentNo"
              value={formData.documentNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Name of the Program */}
          <div className="form-group">
            <label
              htmlFor="programName"
              className="block text-sm font-medium text-gray-700"
            >
              Name of the Program
            </label>
            <input
              type="text"
              id="programName"
              name="programName"
              value={formData.programName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Work Order Number */}
          <div className="form-group">
            <label
              htmlFor="workOrderNo"
              className="block text-sm font-medium text-gray-700"
            >
              Work Order Number
            </label>
            <input
              type="text"
              id="workOrderNo"
              name="workOrderNo"
              value={formData.workOrderNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Time */}
          <div className="form-group">
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700"
            >
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Safety Representative */}
          <div className="form-group">
            <label
              htmlFor="safetyRep"
              className="block text-sm font-medium text-gray-700"
            >
              Safety Representative
            </label>
            <input
              type="text"
              id="safetyRep"
              name="safetyRep"
              value={formData.safetyRep}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Vendor Code */}
          <div className="form-group">
            <label
              htmlFor="vendorCode"
              className="block text-sm font-medium text-gray-700"
            >
              Vendor Code
            </label>
            <input
              type="text"
              id="vendorCode"
              name="vendorCode"
              value={formData.vendorCode}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Contractor Representative */}
          <div className="form-group">
            <label
              htmlFor="contractorRep"
              className="block text-sm font-medium text-gray-700"
            >
              Contractor Representative
            </label>
            <input
              type="text"
              id="contractorRep"
              name="contractorRep"
              value={formData.contractorRep}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Supervisor */}
          <div className="form-group">
            <label
              htmlFor="supervisor"
              className="block text-sm font-medium text-gray-700"
            >
              Supervisor
            </label>
            <select
              id="supervisor"
              name="supervisor"
              value={formData.supervisor}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select an option</option>
              <option value="Company_Supervisor">Company Supervisor</option>
              <option value="Line_Manager">Line Manager</option>
            </select>
          </div>

          {/* Total Manpower */}
          <div className="form-group">
            <label
              htmlFor="totalManpower"
              className="block text-sm font-medium text-gray-700"
            >
              Total Manpower
            </label>
            <input
              type="number"
              id="totalManpower"
              name="totalManpower"
              value={formData.totalManpower}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Workers */}
          <div className="form-group">
            <label
              htmlFor="workers"
              className="block text-sm font-medium text-gray-700"
            >
              Workers
            </label>
            <input
              type="number"
              id="workers"
              name="workers"
              value={formData.workers}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Supervisors */}
          <div className="form-group">
            <label
              htmlFor="supervisors"
              className="block text-sm font-medium text-gray-700"
            >
              Supervisors
            </label>
            <input
              type="number"
              id="supervisors"
              name="supervisors"
              value={formData.supervisors}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Emp's */}
          <div className="form-group">
            <label
              htmlFor="emps"
              className="block text-sm font-medium text-gray-700"
            >
              Emps
            </label>
            <input
              type="number"
              id="emps"
              name="emps"
              value={formData.emps}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Safety */}
          <div className="form-group">
            <label
              htmlFor="safety"
              className="block text-sm font-medium text-gray-700"
            >
              Safety
            </label>
            <input
              type="number"
              id="safety"
              name="safety"
              value={formData.safety}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <h1 className="text-2xl">Items Discussed</h1>
          <div className="form-group">
            <label
              htmlFor="q1"
              className="block text-sm font-medium text-gray-700"
            >
              First Question
            </label>
            <input
              type="text"
              id="q1"
              name="q1"
              value={formData.q1}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="form-group">
            <label
              htmlFor="q2"
              className="block text-sm font-medium text-gray-700"
            >
              Second Question
            </label>
            <input
              type="text"
              id="q2"
              name="q2"
              value={formData.q2}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="form-group">
            <label
              htmlFor="q3"
              className="block text-sm font-medium text-gray-700"
            >
              Third Question
            </label>
            <input
              type="text"
              id="q3"
              name="q3"
              value={formData.q3}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="form-group">
            <label
              htmlFor="q4"
              className="block text-sm font-medium text-gray-700"
            >
              Fourth Question
            </label>
            <input
              type="text"
              id="q4"
              name="q4"
              value={formData.q4}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <fieldset className="mb-6">
            <legend className="block text-sm font-medium text-gray-700">
              Options
            </legend>
            <div className="mt-2 space-y-2">
              {Object.keys(formData.options).map((optionKey) => (
                <div key={optionKey} className="flex items-center">
                  <input
                    type="checkbox"
                    id={optionKey}
                    name={optionKey}
                    checked={formData.options[optionKey]}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={optionKey}
                    className="ml-3 text-sm font-medium text-gray-700"
                  >
                    {optionKey.replace("option", "Option ")}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="form-group">
            <label
              htmlFor="q5"
              className="block text-sm font-medium text-gray-700"
            >
              Fifth Question
            </label>
            <input
              type="text"
              id="q5"
              name="q5"
              value={formData.q5}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-md">
          <h1 className="text-2xl font-semibold mb-4">Record Table</h1>
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="action"
                  className="block text-sm font-medium text-gray-700"
                >
                  Action
                </label>
                <textarea
                  id="action"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows={3}
                  placeholder="Enter action"
                />
              </div>
              <div>
                <label
                  htmlFor="when"
                  className="block text-sm font-medium text-gray-700"
                >
                  When
                </label>
                <input
                  type="text"
                  id="when"
                  value={newWhen}
                  onChange={(e) => setNewWhen(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter when"
                />
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <input
                  type="text"
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter status"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddRow}
              className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Row
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  When
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{row.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.when}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-group mt-2">
            <label
              htmlFor="q5"
              className="block text-sm font-medium text-gray-700"
            >
              Suggestion
            </label>
            <input
              type="text"
              id="suggestion"
              name="suggestion"
              value={formData.suggestion}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="q5"
              className="block text-sm font-medium text-gray-700"
            >
              Feedback
            </label>
            <input
              type="text"
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Pdf
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddToolBoxTalk;

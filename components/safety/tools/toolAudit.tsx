import SafetyToolsAction from "@/lib/actions/safetyTools/safetyToolsAction";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { storage } from "@/utils/fireBase/config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import toast from "react-hot-toast";

const ToolAudit = () => {
  const [tools, setTools] = useState([]);
  const [tableData, setTableData] = useState(
    Array.from({ length: 10 }).map(() => ({
      machineName: "",
      machineModel: "",
      assetNo: "",
      toolStatus: {},
      remarks: "",
    }))
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [docNo, setDocNo] = useState("");
  const [effectiveDate, setEffectieveDate] = useState("");
  const [revNo, setRevNo] = useState("");
  const [workName, setWorkName] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [names, setNames] = useState("");

  useEffect(() => {
    const fetchTools = async () => {
      const resp = await SafetyToolsAction.FETCH.fetchSafetyToolsAll();
      if (resp.success) {
        setTools(JSON.parse(resp.data));
      }
    };
    fetchTools();
  }, []);

  const handleInputChange = (rowIndex, field, value) => {
    const updatedData = [...tableData];
    updatedData[rowIndex][field] = value;
    setTableData(updatedData);
  };

  const handleSelectChange = (rowIndex, toolId, value) => {
    const updatedData = [...tableData];
    updatedData[rowIndex].toolStatus[toolId] = value;
    setTableData(updatedData);
  };

  const handleRemarksChange = (rowIndex, value) => {
    const updatedData = [...tableData];
    updatedData[rowIndex].remarks = value;
    setTableData(updatedData);
  };

  const generateExcel = () => {
    const header = [
      "Machine Name/Brand",
      "Machine Model No.",
      "Asset No.",
      ...tools.map((tool) => tool.category),
      "Remarks",
    ];
    const rows = tableData.map((row) => [
      row.machineName,
      row.machineModel,
      row.assetNo,
      ...tools.map((tool) => row.toolStatus[tool._id] || ""),
      row.remarks,
    ]);

    // Additional fields to be added above the table
    const aboveTableFields = [
      ["Doc No:", docNo],
      ["Effective Date:", effectiveDate],
      ["Rev No:", revNo],
      ["Work Name:", workName],
      ["Job Location:", jobLocation],
    ];

    // Additional fields to be added below the table
    const belowTableFields = [
      ["Remarks:", remarks],
      ["Names:", names],
    ];

    // Combine all parts into a single sheet
    const worksheetData = [
      ...aboveTableFields,
      [],
      header,
      ...rows,
      [],
      ...belowTableFields,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tool Check List");
    XLSX.writeFile(workbook, `Tool_Audit_${selectedDate || "No_Date"}.xlsx`);

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    const storageRef = ref(
      storage,
      `excel/Tool_Audit_${selectedDate || "No_Date"}.xlsx`
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
            docNo:docNo,
            revNo:revNo,
            date:selectedDate
          }
          const resp = await SafetyToolsAction.CREATE.createAudit(JSON.stringify(obj))
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

  return (
    <>
      <div className="text-2xl flex justify-center my-4">Tool Audit</div>

      <div className="flex justify-between">
        <div>
          Doc No:
          <input
            type="text"
            value={docNo}
            onChange={(e) => {
              setDocNo(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div>
          Rev No:
          <input
            type="text"
            value={revNo}
            onChange={(e) => {
              setRevNo(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div>
          Effective Date :
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => {
              setEffectieveDate(e.target.value);
            }}
            className="ml-1"
            placeholder="Enter Here"
          />
        </div>
      </div>
      <div className="mt-2 flex justify-between">
        <div>
          Work Name : 
          <input
            type="text"
            value={workName}
            onChange={(e) => {
              setWorkName(e.target.value);
            }}
            placeholder="Enter Here"
            className="ml-1"
          />
        </div>
        <div>
          Job Location :
          <input
            type="text"
            value={jobLocation}
            onChange={(e) => {
              setJobLocation(e.target.value);
            }}
            placeholder="Enter Here"
            className="ml-1"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <div>
          Date:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </div>
        <div>
          <button
            onClick={generateExcel}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
            className="mt-3"
          >
            Export to Excel
          </button>
        </div>
      </div>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "max-content",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
          className="mt-2"
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                }}
              >
                Machine Name/Brand
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                }}
              >
                Machine Model No.
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                }}
              >
                Asset No.
              </th>
              {tools.map((tool) => (
                <th
                  key={tool._id}
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                  }}
                >
                  {tool.category}
                </th>
              ))}
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                }}
              >
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  <input
                    type="text"
                    value={tableData[rowIndex].machineName}
                    onChange={(e) =>
                      handleInputChange(rowIndex, "machineName", e.target.value)
                    }
                    style={{ width: "90px" }} // Set specific width
                  />
                </td>
                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  <input
                    type="text"
                    value={tableData[rowIndex].machineModel}
                    onChange={(e) =>
                      handleInputChange(
                        rowIndex,
                        "machineModel",
                        e.target.value
                      )
                    }
                    style={{ width: "150px" }} // Set specific width
                  />
                </td>
                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  <input
                    type="text"
                    value={tableData[rowIndex].assetNo}
                    onChange={(e) =>
                      handleInputChange(rowIndex, "assetNo", e.target.value)
                    }
                    style={{ width: "150px" }} // Set specific width
                  />
                </td>
                {tools.map((tool) => (
                  <td
                    key={tool._id}
                    style={{ border: "1px solid #000", padding: "8px" }}
                  >
                    <select
                      value={tableData[rowIndex].toolStatus[tool._id] || ""}
                      onChange={(e) =>
                        handleSelectChange(rowIndex, tool._id, e.target.value)
                      }
                      style={{ width: "60px" }} // Set specific width
                    >
                      <option value="">Select</option>
                      <option value="ok">OK</option>
                      <option value="not ok">Not OK</option>
                      <option value="NA">NA</option>
                    </select>
                  </td>
                ))}
                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  <textarea
                    value={tableData[rowIndex].remarks}
                    onChange={(e) =>
                      handleRemarksChange(rowIndex, e.target.value)
                    }
                    style={{ width: "150px", height: "60px" }} // Set specific size
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>

      <div className="flex justify-between mt-2">
          <div>
            Remarks :
            <input
              type="text"
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
              }}
              placeholder="Enter Here"
            />
          </div>
          <div>
            Names :
            <input
              type="text"
              value={names}
              onChange={(e) => {
                setNames(e.target.value);
              }}
              placeholder="Enter Here"
            />
          </div>
        </div>
    </>
  );
};

export default ToolAudit;

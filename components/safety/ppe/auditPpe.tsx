import EmployeeDataAction from "@/lib/actions/HR/EmployeeData/employeeDataAction";
import PpeAction from "@/lib/actions/ppe/ppeAction";
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { storage } from "@/utils/fireBase/config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import toast from "react-hot-toast";

const PpeAudit = () => {
  const [emps, setEmps] = useState([]);
  const [ppes, setPpes] = useState([]);
  const [ppeStatus, setPpeStatus] = useState({});
  const [remarks, setRemarks] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [workName, setWorkName] = useState("");
  const [siteAndLocation, setSiteAndLocation] = useState("");
  const [docNo,setDocNo] = useState("")
  const [revNo,setRevNo] = useState("")

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const res = await EmployeeDataAction.FETCH.fetchAllEmployeeData();
      if (res.success) {
        const empsNames = [];
        const dataArray = JSON.parse(res.data);
        dataArray.forEach((item) => {
          empsNames.push({
            name: item.name,
            code: item.code,
            _id: item._id,
          });
        });
        setEmps(empsNames);
      }
    };

    const fetchPpeData = async () => {
      const resp = await PpeAction.FETCH.fetchPpeAll();
      if (resp.success) {
        const ppeData = JSON.parse(resp.data);
        setPpes(ppeData);
      }
    };

    fetchEmployeeData();
    fetchPpeData();
  }, []);

  const handleChange = (empId, ppeId, value) => {
    setPpeStatus((prevState) => ({
      ...prevState,
      [empId]: {
        ...prevState[empId],
        [ppeId]: value,
      },
    }));
    console.log(`Employee ${empId}, PPE ${ppeId} changed to ${value}`);
  };

  const handleRemarksChange = (empId, value) => {
    setRemarks((prevState) => ({
      ...prevState,
      [empId]: value,
    }));
    console.log(`Employee ${empId}, Remarks changed to ${value}`);
  };

  // const generatePDF = () => {
  //   const doc = new jsPDF("landscape");

  //   // Add "Shekhar Enterprises" and selected date as heading
  //   doc.setFontSize(18);
  //   doc.text("Shekhar Enterprises", 14, 20);
  //   doc.text("PPE CheckList", 94, 20);
  //   doc.setFontSize(12);
  //   doc.text(`Date: ${selectedDate}`, 14, 30);
  //   doc.text(`Work Name: ${workName}`, 14, 40);
  //   doc.text(`Site And Location: ${siteAndLocation}`, 14, 50);
  //   doc.text(`Doc No: ${docNo}`, 94, 40);
  //   doc.text(`Rev No: ${revNo}`, 94, 50);

  //   const tableColumn = [
  //     "Emps",
  //     "Code",
  //     ...ppes.map((ppe) => `${ppe.category} (${ppe.subcategory})`),
  //     "Remarks",
  //   ];

  //   const tableRows = emps.map((emp) => {
  //     const row = {
  //       name: emp.name,
  //       code: emp.code,
  //       remarks: remarks[emp._id] || "",
  //     };
  //     ppes.forEach((ppe) => {
  //       row[ppe._id] = ppeStatus[emp._id]?.[ppe._id] || "";
  //     });
  //     return row;
  //   });

  //   const tableData = tableRows.map((row) => {
  //     return [
  //       row.name,
  //       row.code,
  //       ...ppes.map((ppe) => row[ppe._id]),
  //       row.remarks,
  //     ];
  //   });

  //   (doc as any).autoTable({
  //     head: [tableColumn],
  //     body: tableData,
  //     startY: 60, // Start table below the heading
  //     styles: { cellPadding: 3, fontSize: 10 },
  //     theme: "grid",
  //   });

  //   doc.save(`PPE_CheckList_${selectedDate || "No_Date"}.pdf`);
  // };

  const generatePDF = () => {
    const doc = new jsPDF("landscape");
  
    // Add "Shekhar Enterprises" and selected date as heading
    doc.setFontSize(18);
    doc.text("Shekhar Enterprises", 14, 20);
    doc.text("PPE Audit", 94, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${selectedDate}`, 14, 30);
    doc.text(`Work Name: ${workName}`, 14, 40);
    doc.text(`Site And Location: ${siteAndLocation}`, 14, 50);
    doc.text(`Doc No: ${docNo}`, 94, 40);
    doc.text(`Rev No: ${revNo}`, 94, 50);
  
    const tableColumn = [
      "Emps",
      "Code",
      ...ppes.map((ppe) => `${ppe.category} (${ppe.subcategory})`),
      "Remarks",
    ];
  
    const tableRows = emps.map((emp) => {
      const row = {
        name: emp.name,
        code: emp.code,
        remarks: remarks[emp._id] || "",
      };
      ppes.forEach((ppe) => {
        row[ppe._id] = ppeStatus[emp._id]?.[ppe._id] || "";
      });
      return row;
    });
  
    const tableData = tableRows.map((row) => {
      return [
        row.name,
        row.code,
        ...ppes.map((ppe) => row[ppe._id]),
        row.remarks,
      ];
    });
  
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableData,
      startY: 60, // Start table below the heading
      styles: { cellPadding: 3, fontSize: 10 },
      theme: "grid",
    });
  
    const pdfName = `Ppe_Audit_${selectedDate || "No_Date"}.pdf`;
    const pdfBlob = doc.output("blob");
  
    // Save the PDF locally
    doc.save(pdfName);
  
    // Save the PDF to Firebase
    const storageRef = ref(storage, `pdfs/${pdfName}`);
    const uploadTask = uploadBytesResumable(storageRef, pdfBlob);
  
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Error uploading PDF to Firebase:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL) => {
          const obj = {
            link:downloadURL,
            date:selectedDate,
            docNo:docNo,
            revNo:revNo
          }
          const resp = await PpeAction.CREATE.createAudit(JSON.stringify(obj))
          if(resp.success){
            toast.success("Audit Saved");
          }
          else{
            toast.error("Audit Not Saved")
          }
          console.log("PDF available at", downloadURL);
        });
      }
    );
  };
  

  return (
    <>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div className="text-2xl flex justify-center my-4">PPE Audit</div>
        <div className="flex flex-row justify-between my-2">
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
              onClick={generatePDF}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Download & Save PDF
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            Work Name:
            <input
              type="text"
              value={workName}
              onChange={(e) => setWorkName(e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Here"
            />
          </div>
          <div>
            Doc No:
            <input
              type="text"
              value={docNo}
              onChange={(e) => setDocNo(e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Here"
            />
          </div>
        </div>

        <div className="flex justify-between">
          
          <div>
            Site And Location
            <input
              type="text"
              value={siteAndLocation}
              onChange={(e) => setSiteAndLocation(e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Here"
            />
          </div>
          <div>
            Rev No
            <input
              type="text"
              value={revNo}
              onChange={(e) => setRevNo(e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Here"
            />
          </div>
        </div>

        <div id="printable-table" className="mt-4" >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", padding: "8px" }}>
                  Emps
                </th>
                <th style={{ border: "1px solid #000", padding: "8px" }}>
                  Code
                </th>
                {ppes.map((ppe) => (
                  <th
                    key={ppe._id}
                    style={{ border: "1px solid #000", padding: "8px" }}
                  >
                    {ppe.category} ({ppe.subcategory})
                  </th>
                ))}
                <th style={{ border: "1px solid #000", padding: "8px" }}>
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {emps.map((emp) => (
                <tr key={emp._id}>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {emp.name}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {emp.code}
                  </td>
                  {ppes.map((ppe) => (
                    <td
                      key={ppe._id}
                      style={{ border: "1px solid #000", padding: "8px" }}
                    >
                      <select
                        onChange={(e) =>
                          handleChange(emp._id, ppe._id, e.target.value)
                        }
                        value={ppeStatus[emp._id]?.[ppe._id] || ""}
                        style={{ width: "100%" }}
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
                      value={remarks[emp._id] || ""}
                      onChange={(e) =>
                        handleRemarksChange(emp._id, e.target.value)
                      }
                      style={{
                        width: "100%",
                        resize: "none",
                        overflow: "hidden",
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PpeAudit;

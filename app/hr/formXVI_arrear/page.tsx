"use client";

import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  PDFTable,
} from "@/components/ui/table";

import { fetchAllAttendance } from "@/lib/actions/attendance/fetch";

import React, { useEffect, useState } from "react";
import { FaWindows } from "react-icons/fa6";
import WorkOrderHr from "@/lib/models/HR/workOrderHr.model";
import wagesAction from "@/lib/actions/HR/wages/wagesAction";
import { fetchEnterpriseInfo } from "@/lib/actions/enterprise";
import { IEnterprise } from "@/interfaces/enterprise.interface";

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const [totalAttendance, setTotalAttendance] = useState(null);
  const [updatedWage, setUpdateWageData] = useState(null);
  const [yearlywages, setYearlywages] = useState(null);
  const [atten, setAtten] = useState(null);
  const [ent, setEnt] = useState<IEnterprise | null>(null);

  let col = 0; // for coulum decide
  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `FormXVI/${searchParams.year}`,
  });
    useEffect(() => {
      const fn = async () => {
        const resp = await fetchEnterpriseInfo();
        console.log('response we got ', resp);
        if (resp.data) {
          const inf = await JSON.parse(resp.data);
          setEnt(inf);
          console.log(ent);
        }
        if (!resp.success) {
          toast.error(
            `Failed to load enterprise details, Please Reload or try later. ERROR : ${resp.error}`
          );
        }
      };
      fn();
    }, []);
  const handleOnClick = async () => {
    if (!yearlywages) {
      toast.error("Attendance data not available for Print generation.");
      return;
    }
    reactToPrintFn();
  };
  const handleDownloadPDF = async () => {
    if (!yearlywages) {
      toast.error("Attendance data not available for PDF generation.");
      return;
    }

    await generatePDF(yearlywages);
  };

  const generatePDF = async (attendanceData: any) => {
    const pdf = new jsPDF("l", "pt", "a4"); // Create a landscape PDF
    const ogId = `${searchParams.month}/${searchParams.year}`;

    // Create a container element to hold the content and table

    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;

    // Append the table to the container element

    tableElement.style.width = "1250px";

    const cells = tableElement.querySelectorAll("td, th");
    cells.forEach((cell: any) => {
      cell.style.padding = "8px"; // Adds padding to each cell
      cell.style.fontSize = "18px";
    });

    pdf.html(tableElement, {
      callback: async () => {
        pdf.save(`${ogId}.pdf`);
        const pdfDataUrl = pdf.output("dataurlstring");
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.5 },
      autoPaging: "text",
    });
  };

  function calculateAttTotals(employee) {
    // Initialize an array to hold the sums for 12 months (index 0 = Apr, 11 = Mar)
    let monthlyTotals = new Array(12).fill(0); // Initialize with zeros

    // Iterate through each employee and their wages

    employee.wages.forEach((wage) => {
      // Get the index for the month in the financial year (Apr = 0, Mar = 11)
      if (
        (wage.year > syear || (wage.year === syear && wage.month >= smonth)) &&
        (wage.year < eyear || (wage.year === eyear && wage.month <= emonth))
      ) {
        const monthIndex = (wage.month - 4 + 12) % 12;
        monthlyTotals[monthIndex] += wage.attendance;
      }

      // Adjust for financial year (April is index 0)

      // Add the attendance to the correct month index if it exists for the employee
    });

    console.log(monthlyTotals, "monthlyTotals"); // Check the result

    // Return the aggregated attendance for all months
    return monthlyTotals;
  }

  console.log("yeich toh hain", searchParams);
  const startDate = searchParams.startDate;
  const [syear, smonth, sday] = startDate.split("-").map(Number); //these value are in String
  const endDate = searchParams.endDate;
  const [eyear, emonth, eday] = endDate.split("-").map(Number);

  useEffect(() => {
    if (searchParams.modifiedWages) {
      setUpdateWageData(JSON.parse(searchParams.modifiedWages));
    }
  }, [searchParams.modifiedWages]);

  useEffect(() => {
    let yearEdgeCase = false;
    if (smonth >= 1 && emonth <= 3 && syear === eyear) {
      yearEdgeCase = true;
    }
    const fn = async () => {
      setAtten(null);
      try {
        setYearlywages(null);

        const data = {
          year: yearEdgeCase ? syear - 1 : syear,
          workOrder: searchParams.workOrder,
          bonusPercentage: 0,
        };
        const filter = JSON.stringify(data);
        console.log(filter);
        //function call to retrive date in b/w start and end month
        const response = await wagesAction.FETCH.fetchWagesForFinancialYear(
          filter
        );

        const responseData = JSON.parse(response.data);
        //changed
        // const wagesArray = responseData.filter((employee)=>{
        //   return employee.employee.designation_details[0].designation === searchParams.Designation

        // })
        setYearlywages(responseData);
        console.log("response aa gaya", responseData);
      } catch (err) {
        toast.error("Internal Server Error");
        console.log("Internal Server Error:", err);
      }
    };
    if (syear && searchParams.workOrder) {
      // Ensure required params are defined
      fn();
    }
  }, [syear, searchParams.workOrder]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array of days (1 to 31)

  const months = [
    "apr",
    "may",
    "jun",
    "july",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
    "Jan",
    "feb",
    "mar",
  ];

  useEffect(() => {
    if (yearlywages) {
      const updatedAttendance = yearlywages.map((employee) => {
        const attendanceSum = employee?.wages
          .filter((wage) => {
            const { month, year } = wage;

            // Check if the wage entry falls within the specified date range, including cross-year scenarios
            return (
              (year > syear || (year === syear && month >= smonth)) &&
              (year < eyear || (year === eyear && month <= emonth))
            );
          })
          .reduce((total, wage) => total + (wage.attendance || 0), 0);

        return { ...employee, totalAtteinrange: attendanceSum };
      });

      setTotalAttendance(updatedAttendance);
    }
  }, [yearlywages, sday, smonth, syear, eday, emonth, eyear]);

  const months2 = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

  return (
    <div className='ml-[80px]'>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>

      <div id={`${smonth}/${syear}`} ref={contentRef}>
        <div
          className='container left-0 right-0 bg-white  overflow-hidden font-mono  w-[1300px]'
          id='container-id'
        >
          <div className='px-2 py-6 text-center  '>
            <h2 className='text-xl font-bold text-blue-700   '>
              Arrear FORM XVI{' '}
            </h2>
            <p className='text-blue-600 font-bold mt-2 '>
              [See rule 78 (2) (a)]
            </p>
            <h1 className='font-bold text-blue-600'>MUSTER ROLL</h1>
          </div>
          <div className='flex justify-between mx-0 font-bold'>
            <div className='flex flex-col'>
              <div className='flex gap-3 mb-4 '>
                <div className='font-bold text-blue-600 max-w-64 '>
                  Name and Address of Contractor:
                </div>
                <div>
                  {ent?.name ? (
                    ent?.name
                  ) : (
                    <span className='text-red-500'>
                      No company found. Try by Reloading
                    </span>
                  )}
                  {ent?.address ? (
                    ent?.address
                  ) : (
                    <span className='text-red-500'>
                      No address found. Try by Reloading
                    </span>
                  )}
                </div>
              </div>
              <div className='flex gap-3 mb-4'>
                <div className='font-bold text-blue-600  '>
                  Name and Location of work:
                </div>
                <div className='uppercase '>
                  &nbsp;&nbsp;&nbsp;{searchParams?.location}
                </div>
              </div>
            </div>
            <div className='flex flex-col'>
              <div className='flex gap-3 mb-4'>
                <div className='font-bold text-blue-600 max-w-96 '>
                  Name and Address of Establishment in/ under which Contract is
                  carried on:
                </div>
                <div className='uppercase'>{searchParams?.employer}</div>
              </div>
              <div className='flex gap-3 mb-4'>
                <div className='font-bold text-blue-600'>
                  Name and Address of Principal Employer:
                </div>
                <div className='uppercase'>
                  &nbsp;&nbsp;&nbsp;&nbsp;{searchParams?.employer}
                </div>
              </div>
            </div>
          </div>
          <h1 className='font-bold mb-4 text-blue-600 text-center'>{`From ${sday}/${smonth}/${syear} TO ${eday}/${emonth}/${eyear}`}</h1>
          <div></div>
        </div>

        {yearlywages && (
          <div>
            <PDFTable className='border-2 border-black  '>
              <TableHeader className=' py-8 h-16 overflow-auto '>
                <TableRow>
                  <TableHead
                    className=' text-black border-2 border-black'
                    colSpan={4}
                  ></TableHead>{' '}
                  {/* Empty cells to align "Dates" */}
                  <TableHead
                    className=' text-black border-2 border-black text-center'
                    colSpan={12}
                  >
                    Months
                  </TableHead>
                  <TableHead
                    className=' text-black border-2 border-black'
                    colSpan={2}
                  ></TableHead>{' '}
                  {/* Empty cells to align after "Dates" */}
                </TableRow>
                <TableRow className='text-black h-28 '>
                  <TableHead className=' text-black border-2 border-black'>
                    Serial No.
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Name of Worker
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Father Name
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Sex
                  </TableHead>
                  {months.map((mo, index) => {
                    // const adjustedEndMonth =
                    //   emonth > 3 ? emonth - 4 : emonth + 8;

                    // if (index <= adjustedEndMonth) {
                    return (
                      <TableHead
                        key={index}
                        className='border-2 border-black text-black'
                      >
                        {mo}
                      </TableHead>
                    );
                  })}

                  {/* Table headers for each day */}
                  <TableHead className=' text-black border-2 border-black'>
                    Total Days
                  </TableHead>
                  <TableHead className=' text-black border-2 border-black'>
                    Remarks
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlywages.map((employee, index) => {
                  let atten = 0;
                  let attenArray = calculateAttTotals(employee);
                  console.log(attenArray, 'I am attenArray');
                  attenArray.map((att, index) => {
                    atten += att;
                    // Add the current attendance to the accumulator
                  });

                  // Aggregate the wages by month
                  const aggregatedWages = employee.wages.reduce((acc, wage) => {
                    const month = wage.month; // Assuming month is a number like 1 (January), 2 (February), etc.

                    if (acc[month]) {
                      acc[month].attendance += wage.attendance;
                    } else {
                      acc[month] = {
                        attendance: wage.attendance, // If you want to display the netAmountPaid later, include it.
                      };
                    }

                    return acc;
                  }, {});

                  // Convert the aggregated wages into an array for rendering
                  const aggregatedWagesArray = Object.keys(aggregatedWages).map(
                    (month) => ({
                      month,
                      ...aggregatedWages[month],
                    })
                  );

                  return (
                    <TableRow key={employee._id} className='h-16'>
                      <TableCell className='border-black border-2 text-black'>
                        {index + 1}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {employee.employee.name}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {employee.employee.fathersName}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'>
                        {employee.employee.sex}
                      </TableCell>
                      {/* Table data for each month */}
                      {months2.map((monthName, monthIndex) => {
                        const adjustedEndMonth =
                          emonth > 3 ? emonth - 4 : emonth + 8;
                        const adjustedStartMonth =
                          smonth > 3 ? smonth - 4 : smonth + 8;
                        const aggregatedWage =
                          monthIndex <= adjustedEndMonth &&
                          monthIndex >= adjustedStartMonth
                            ? aggregatedWages[monthName]
                            : null; // Retrieve the aggregated data for this month

                        return (
                          <TableCell
                            key={monthIndex}
                            className='border-black border-2 text-black'
                          >
                            <div>{aggregatedWage?.attendance}</div>
                          </TableCell>
                        );
                      })}

                      {/* Additional cells can be added here if necessary */}

                      <TableCell className='border-black border-2 text-black'>
                        {atten}
                      </TableCell>
                      <TableCell className='border-black border-2 text-black'></TableCell>
                      <TableCell className='border-black border-2 text-black'></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </PDFTable>
          </div>
        )}
        {!yearlywages && (
          <div className='text-red'>NO ATTENDANCE DATA AVAILABLE</div>
        )}
      </div>
    </div>
  );
};

export default Page;

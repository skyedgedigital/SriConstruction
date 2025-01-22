'use client';

import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Separator } from '@/components/ui/separator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Table, TableBody, TableRow, PDFTable } from '@/components/ui/table';
import wagesAction from '@/lib/actions/HR/wages/wagesAction';
import { useReactToPrint } from 'react-to-print';

import React, { useEffect, useState } from 'react';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';
import { IEnterprise } from '@/interfaces/enterprise.interface';
import {
  acutalLeave,
  RemainingLeaves,
  usedLeave,
} from '@/interfaces/HR/leaves.interface';

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  // const [bonusData, setBonusData] = useState(null);
  const [leaveFieldsRender, setLeaveFieldsRender] = useState<{
    showCL: boolean;
    showFL: boolean;
  }>({ showCL: true, showFL: true });
  const [leaveData, setLeaveData] = useState(null);
  const [ent, setEnt] = useState<IEnterprise | null>(null);

  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `BonusStatement/${searchParams.year}`,
  });
  const handleOnClick = async () => {
    if (!leaveData) {
      toast.error('Attendance data not available for Print generation.');
      return;
    }
    reactToPrintFn();
  };
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
  const handleDownloadPDF = async () => {
    if (!leaveData) {
      toast.error('Attendance data not available for PDF generation.');
      return;
    }

    await generatePDF(leaveData);
  };

  const generatePDF = async (leaveData) => {
    const pdf = new jsPDF('l', 'pt', 'a4'); // Create a landscape PDF
    const ogId = `Leave-register/${searchParams.year}`;

    // Create a container element to hold the content and table

    const originalElement = document.getElementById(ogId)!;
    const tableElement = originalElement.cloneNode(true) as HTMLElement;

    // Append the table to the container element

    tableElement.style.width = '1250px';

    pdf.html(tableElement, {
      callback: async () => {
        pdf.save(`${ogId}.pdf`);
        const pdfDataUrl = pdf.output('dataurlstring');
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.5 },
      autoPaging: 'text',
    });
  };
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (leaveData && leaveData.length > 0) {
      // Step 2: Calculate sums using reduce

      const totall = leaveData.reduce((acc, employee) => acc + employee.Net, 0);
      // Step 3: Update state with the calculated sums

      setTotal(totall);
    }
  }, [leaveData]);
  useEffect(() => {
    const fn = async () => {
      try {
        setLeaveData(null);
        const data = {
          // @ts-ignore
          year: parseInt(searchParams.year),
          workOrder: searchParams.wo,
        };
        console.log('shaiaiijsjs', data);
        const filter = await JSON.stringify(data);

        const response = await wagesAction.FETCH.fetchWagesForCalendarYear(
          filter
        );
        //   console.log(JSON.parse(response.data))
        const responseData = JSON.parse(response.data);
        setLeaveData(responseData);
        console.log('response aagya bawa', responseData);
        console.log('aagya response');
      } catch (error) {
        toast.error('Internal Server Error');
        console.log('Internal Server Error:', error);
      }
    };
    fn();
  }, []);
  console.log('sahi h bhai');

  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array of days (1 to 31)
  const months = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];

  function calculateRemainingLeaves(
    leaves: usedLeave[],
    acutalLeave: acutalLeave
  ) {
    const totalUsedLeaves = leaves.reduce(
      (acc, curr) => {
        acc.usedEL += curr.usedEL;
        acc.usedCL += curr.usedCL;
        acc.usedFL += curr.usedFL;
        return acc;
      },
      { usedEL: 0, usedCL: 0, usedFL: 0 }
    );
    return {
      remainingEL: acutalLeave.actualEL - totalUsedLeaves.usedEL,
      remainingCL: acutalLeave.actualCL - totalUsedLeaves.usedCL,
      remainingFL: acutalLeave.actualFL - totalUsedLeaves.usedFL,
    };
  }

  function calculateSumOfLeavesLeft(leave: RemainingLeaves) {
    return (
      (leaveFieldsRender.showCL && leave.remainingCL) +
      leave.remainingEL +
      (leaveFieldsRender.showFL && leave.remainingFL)
    );
  }

  function calculateTotal(leaveData) {
    const employeeLeavesArr: RemainingLeaves[] = leaveData.map((data) =>
      calculateRemainingLeaves(data.employeeLeaves, {
        actualCL: data.CL,
        actualEL: data.EL,
        actualFL: data.FL,
      })
    );
    console.log(employeeLeavesArr);
    const totalEmployeeELLeft = employeeLeavesArr.reduce(
      (acc, curr) => {
        acc.EL += curr.remainingEL;
        return acc;
      },
      { EL: 0 }
    );
    const totalEmployeeCLLeft = employeeLeavesArr.reduce(
      (acc, curr) => {
        acc.CL += curr.remainingCL;
        return acc;
      },
      { CL: 0 }
    );
    const totalEmployeeFLLeft = employeeLeavesArr.reduce(
      (acc, curr) => {
        acc.FL += curr.remainingFL;
        return acc;
      },
      { FL: 0 }
    );
    const employeeLeaveLeftArr = employeeLeavesArr.map((item) =>
      calculateSumOfLeavesLeft(item)
    );
    const totalEmployeeLeaveLeft = employeeLeaveLeftArr.reduce(
      (acc, curr) => acc + curr,
      0
    );
    return {
      totalEL: totalEmployeeELLeft.EL,
      totalFL: totalEmployeeFLLeft.FL,
      totalCL: totalEmployeeCLLeft.CL,
      total: totalEmployeeLeaveLeft,
    };
  }

  function calculateBasic(basic: number, employee) {
    return (
      basic *
      calculateSumOfLeavesLeft(
        calculateRemainingLeaves(employee.employeeLeaves, {
          actualCL: employee.CL,
          actualEL: employee.EL,
          actualFL: employee.FL,
        })
      )
    );
  }

  function calculateDA(DA: number, employee) {
    return (
      DA *
      calculateSumOfLeavesLeft(
        calculateRemainingLeaves(employee.employeeLeaves, {
          actualCL: employee.CL,
          actualEL: employee.EL,
          actualFL: employee.FL,
        })
      )
    );
  }

  function calculateTotalEmployeeWages(leaveData) {
    const lawda: number[] = leaveData.map((employee) => {
      return (
        calculateBasic(
          employee.employee.designation_details[0].basic,
          employee
        ) + calculateDA(employee.employee.designation_details[0].DA, employee)
      );
    });
    return lawda.reduce((acc, curr) => acc + curr, 0);
  }

  return (
    <div className='ml-[80px] flex flex-col gap-4'>
      <div className='flex gap-2 mb-2'>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleOnClick}>Print</Button>
      </div>
      {leaveData && (
        <div className='mb-2'>
          <fieldset>
            <legend>Choose Fields:</legend>
            <div className='flex gap-2'>
              <div>
                <input type='checkbox' id='EL' name='EL' checked disabled />
                <label htmlFor='el'>EL</label>
              </div>
              <div>
                <input
                  type='checkbox'
                  id='cl'
                  name='cl'
                  checked={leaveFieldsRender.showCL}
                  onChange={() =>
                    setLeaveFieldsRender((prevState) => {
                      return {
                        ...prevState,
                        showCL: !prevState.showCL,
                      };
                    })
                  }
                />
                <label htmlFor='cl'>CL</label>
              </div>
              <div>
                <input
                  type='checkbox'
                  id='fl'
                  name='fl'
                  checked={leaveFieldsRender.showFL}
                  onChange={() =>
                    setLeaveFieldsRender((prevState) => {
                      return {
                        ...prevState,
                        showFL: !prevState.showFL,
                      };
                    })
                  }
                />
                <label htmlFor='fl'>FL</label>
              </div>
            </div>
          </fieldset>
        </div>
      )}

      <div
        id={`Leave-register/${searchParams.year}`}
        className='  '
        ref={contentRef}
      >
        <div
          className='gap-6  overflow-hidden font-mono left-0 right-0 text-center  px-2 font-semibold w-[1600px]'
          id='container-id'
        >
          <div className='px-2 py-6 text-center  '>
            <h1 className='  uppercase text-3xl'>FORM XVII</h1>
            <p className=' mt-2 '>[See rule 78 (2) (a)]</p>
            <h1 className=' uppercase  '>Register of Leave payment</h1>
          </div>
          <div className='flex gap-6 justify-between ml-0   '>
            <div className='flex flex-col flex-1'>
              <div className='flex gap-3 mb-4 '>
                <div className=' max-w-64 text-left'>
                  Name and Address of Contractor
                </div>
                <div className='flex flex-col ml-4'>
                  {' '}
                  <div className='text-left'>
                    {ent?.name ? (
                      ent?.name
                    ) : (
                      <span className='text-red-500'>
                        No company found. Try by Reloading
                      </span>
                    )}
                    ,&nbsp;
                    {ent?.address ? (
                      ent?.address
                    ) : (
                      <span className='text-red-500'>
                        No address found. Try by Reloading
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className='text-left'>Nature and Location of work done</div>
              <div className='flex gap-3 mb-4'>
                <div className='text-left'>Work Order No.</div>
                <div className='ml-12'>{searchParams.wog}</div>
              </div>
            </div>
            <div className='flex gap-4 flex-1'>
              <div className='flex gap-3 mb-4'>
                <div className=' max-w-96 '>From Date:</div>
                <div>{`01-01-${searchParams.year}`} </div>
              </div>
              <div className='flex gap-3 mb-4'>
                <div className=''>To Date:</div>
                <div>{`31-12-${searchParams.year}`}</div>
              </div>
            </div>
            <div className='flex flex-col flex-1'>
              <div className='flex gap-3 mb-4'>
                <div className=' text-left'>
                  Name and Address of Establishment In under which Establishment
                  is carried on
                </div>
                <div>Tata Steel UISL</div>
              </div>
              <div className='flex gap-3 mb-4'>
                <div className='text-left'>
                  Name and Address of Principal Employer
                </div>
                <div className='text-right'>Tata Steel UISL</div>
              </div>
            </div>
          </div>{' '}
        </div>

        {leaveData && (
          <table className='border-2 text-center border-black  font-mono '>
            <thead className=' py-8  overflow-auto '>
              <tr className='text-black '>
                <th className='px-1 text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Sl No.
                </th>

                <th className='px-1 text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Name of Workman
                </th>
                <th className='px-1 text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Serial No. in the register of Workman
                </th>
                <th className='px-1 text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Designation Nature of work done
                </th>
                {/* Table headers for each day */}

                <th className='px-1 text-black border-[1px] p-1 text-center font-semibold border-black'>
                  No of days worked
                </th>
                <th className='px-1 text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Units of work done
                </th>
                <th className='px-1 text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Daile rate piece rate
                </th>
                <th className=' text-black border-[1px]  text-center font-semibold border-black'>
                  <div className='flex flex-col  justify-between '>
                    <div className='border-b-[1px] border-black p-1'>
                      Amount of Wages
                    </div>
                    <div className='flex  '>
                      <div className='flex-1 p-2 border-r border-black'>
                        Basic Wages
                      </div>
                      <div className='flex-1 p-2 border-r border-black'>DA</div>
                      <div className='flex-1 p-2 '>Over time</div>
                    </div>
                  </div>
                </th>

                <th className='px-4  text-black border-[1px] p-1 text-center font-semibold border-black'>
                  EARNE Other Cash Payment
                </th>
                <th className='px-4  text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Total
                </th>
                <th className='  text-black border-[1px]  text-center font-semibold border-black'>
                  {/* <div className='flex flex-col justify-between'> */}
                  <div className=' p-2'>Deduction if any (Indicate Nature)</div>
                  <div className='flex  w-full border-t-2 border-black '>
                    <div className='flex-1 p-2 border-r border-black '>PF</div>
                    <div className='flex-1 p-2 border-r border-black '>ESI</div>
                    <div className='flex-1 p-2 '>Over time</div>
                  </div>
                  {/* </div> */}
                </th>
                <th className='px-4  text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Net Amount Paid
                </th>

                <th className='px-4  text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Sign/Thumb impression of workman
                </th>
                <th className='px-4  text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Initial of Cont. or his representatives
                </th>
                <th className='px-4  text-black border-[1px] p-1 text-center font-semibold border-black'>
                  Sign of Cont. or his representatives
                </th>
              </tr>
            </thead>
            <>
              {leaveData.map((employee, index) => (
                <tr key={employee._id} className='h-16'>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {index + 1}
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {employee.employee.name}
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {employee.employee.workManNo}
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {employee.employee.designation_details[0].designation}
                  </td>
                  {/* Table data for each day (status) */}

                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {/* <div>{`EL: ${employee.EL}`}</div> */}
                    <div>{`EL: ${
                      calculateRemainingLeaves(employee.employeeLeaves, {
                        actualCL: employee.CL,
                        actualEL: employee.EL,
                        actualFL: employee.FL,
                      }).remainingEL
                    }`}</div>

                    {/* <div>{`CL: ${employee.CL}`}</div> */}
                    {leaveFieldsRender.showCL && (
                      <div>{`CL: ${
                        calculateRemainingLeaves(employee.employeeLeaves, {
                          actualCL: employee.CL,
                          actualEL: employee.EL,
                          actualFL: employee.FL,
                        }).remainingCL
                      }`}</div>
                    )}
                    {/* <div>{`FL: ${employee.FL}`}</div> */}
                    {leaveFieldsRender.showFL && (
                      <div>{`FL: ${
                        calculateRemainingLeaves(employee.employeeLeaves, {
                          actualCL: employee.CL,
                          actualEL: employee.EL,
                          actualFL: employee.FL,
                        }).remainingFL
                      }`}</div>
                    )}
                    <div className='border-t-2 border-black mt-2 pb-1'>
                      {/* {`${employee.tot}`} */}
                      {`${calculateSumOfLeavesLeft(
                        calculateRemainingLeaves(employee.employeeLeaves, {
                          actualCL: employee.CL,
                          actualEL: employee.EL,
                          actualFL: employee.FL,
                        })
                      )}`}
                    </div>
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    <div>{employee.employee.designation_details[0].basic}</div>
                    <div>{employee.employee.designation_details[0].DA}</div>
                    <div>
                      {employee.employee.designation_details[0].PayRate}
                    </div>
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    <div className='flex  '>
                      <div className='flex-1 p-1 pr-2 border-r-2 border-black '>
                        {' '}
                        {/* {employee.basicWages.toFixed(2)} */}
                        {calculateBasic(
                          employee.employee.designation_details[0].basic,
                          employee
                        ).toFixed(2)}
                      </div>
                      <div className='flex-1 p-1 px-2 border-r-2 border-black '>
                        {/* {employee.totalDA.toFixed(2)} */}
                        {calculateDA(
                          employee.employee.designation_details[0].DA,
                          employee
                        ).toFixed(2)}
                      </div>
                      <div className='flex-1 p-1 '>-</div>
                    </div>
                  </td>
                  {/* <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {employee.basicWages}
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {employee.totalDA}
                  </td> */}
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {/* {employee?.Net?.toFixed(2)} */}
                    {(
                      calculateBasic(
                        employee.employee.designation_details[0].basic,
                        employee
                      ) +
                      calculateDA(
                        employee.employee.designation_details[0].DA,
                        employee
                      )
                    ).toFixed(2)}
                  </td>
                  {/* <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td> */}

                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    <div className='flex  '>
                      <div className='flex-1 p-1 '></div>
                      <div className='flex-1 p-1 border-x-[1px] border-black'></div>
                      <div className='flex-1 p-1 '></div>
                    </div>
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {/* {employee.Net.toFixed(2)} */}
                    {(
                      calculateBasic(
                        employee.employee.designation_details[0].basic,
                        employee
                      ) +
                      calculateDA(
                        employee.employee.designation_details[0].DA,
                        employee
                      )
                    ).toFixed(2)}
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                </tr>
              ))}
              {leaveData?.length > 0 && (
                <tr className='h-16'>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  {/* Table data for each day (status) */}

                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    <div></div>
                    <div></div>
                    <div></div>
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    <div className='flex  '>
                      <div className='flex-1 p-1 '> </div>
                      <div className='flex-1 p-1  '></div>
                      <div className='flex-1 p-1 '>-</div>
                    </div>
                  </td>
                  {/* <td className='border-black border-[1px] p-1 text-center  text-black'>
  {employee.basicWages}
</td>
<td className='border-black border-[1px] p-1 text-center  text-black'>
  {employee.totalDA}
</td> */}
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {/* {total} */}
                    {calculateTotalEmployeeWages(leaveData).toFixed(2)}
                  </td>
                  {/* <td className='border-black border-[1px] p-1 text-center  text-black'></td>
<td className='border-black border-[1px] p-1 text-center  text-black'></td>
<td className='border-black border-[1px] p-1 text-center  text-black'></td> */}

                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    <div className='flex  '>
                      <div className='flex-1 p-1 '></div>
                      <div className='flex-1 p-1 border-x-[1px] border-black'></div>
                      <div className='flex-1 p-1 '></div>
                    </div>
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'>
                    {calculateTotalEmployeeWages(leaveData).toFixed(2)}
                  </td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                  <td className='border-black border-[1px] p-1 text-center  text-black'></td>
                </tr>
              )}
            </>
          </table>
        )}
        {!leaveData && (
          <div className='text-red'>NO ATTENDANCE DATA AVAILABLE</div>
        )}
      </div>
    </div>
  );
};

export default Page;

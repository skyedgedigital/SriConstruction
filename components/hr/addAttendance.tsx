'use client';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import attendanceAction from '@/lib/actions/attendance/attendanceAction';
import toast from 'react-hot-toast';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import { deleteWorkorderFromEmployeeData } from '@/lib/actions/HR/EmployeeData/delete';

const AddAttendance = ({ employeee }) => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceCopy, setAttendanceCopy] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [present, setPresent] = useState(0);
  const [absent, setAbsent] = useState(0);
  // const [leave, setLeave] = useState(0);
  const [halfDay, setHalfDay] = useState(0);
  const [nh, setNh] = useState(0);
  const [notPaid, setNotPaid] = useState(0);
  const [earnedLeaves, setEarnedLeaves] = useState(0);
  const [casualLeaves, setCasualLeaves] = useState(0);
  const [festivalLeaves, setFestivalLeaves] = useState(0);
  const [workOrderList, setWorkOrderList] = useState([]);
  const [workOrderListt, setWorkOrderListt] = useState([]);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [selectedWorkOrder, setSelectedWorkOrder] = useState({
    workOrderNumber: '',
    _id: '',
  });

  const [defaultt, setDefault] = useState({
    workOrderNumber: '',
    _id: '',
  });

  console.log('akshayyyy', employeee);
  useEffect(() => {
    const fn = async () => {
      // console.warn("The Emp DAta",employeece)
      const workOrderResponse =
        await WorkOrderHrAction.FETCH.fetchAllValidWorkOrderHr();
      if (workOrderResponse.success) {
        setWorkOrderList(JSON.parse(workOrderResponse.data));
      }
    };
    fn();
  }, [employeee]);

  useEffect(() => {
    if (workOrderList?.length == 0) return;
    let defaultWorkOrder;
    console.log('tttttttttttttttttttt', employeee);
    // Condition 1: If workOrder is not "Default" and workOrderHr exists
    if (employeee.wo !== 'Default' && employeee.employee?.workOrderHr) {
      defaultWorkOrder = workOrderList.find(
        (workOrder) => workOrder._id === employeee.wo
      );
    }

    // Condition 2: If workOrder is "Default" and workOrderHr exists, set to last element's workOrderHr
    else if (
      employeee.wo === 'Default' &&
      employeee.employee?.workOrderHr?.length > 0
    ) {
      console.log('iiiiiiiiiiiiiiiiii');
      const lastWorkOrderHr =
        employeee.employee.workOrderHr[
          employeee.employee.workOrderHr.length - 1
        ];
      defaultWorkOrder = workOrderList.find(
        (workOrder) => workOrder._id === lastWorkOrderHr.workOrderHr
      );
    }

    // Condition 3: If workOrder is "Default" and no workOrderHr exists, use first workOrder
    else if (
      employeee.wo === 'Default' &&
      employeee.employee?.workOrderHr?.length <= 0
    ) {
      console.log('kkkkkkkkkkkkkkkkkk');

      defaultWorkOrder = workOrderList[0]; // Use the first element from workOrderList
    }

    // Set the default selected work order if found
    if (defaultWorkOrder) {
      setDefault({
        _id: defaultWorkOrder._id,
        workOrderNumber: defaultWorkOrder.workOrderNumber,
      });
      setSelectedWorkOrder({
        _id: defaultWorkOrder._id,
        workOrderNumber: defaultWorkOrder.workOrderNumber,
      });
      console.log('weeeeeeeeeeeeez', selectedWorkOrder);

      setWorkOrderListt(workOrderList);
    }
  }, [workOrderList]);

  const caclQuantityofStatus = (att: any) => {
    let present = 0;
    let absent = 0;
    // let leave = 0;
    let halfDay = 0;
    let nh = 0;
    let np = 0;
    let el = 0;
    let cl = 0;
    let fl = 0;
    att?.forEach((element) => {
      if (element.status === 'Present') {
        present += 1;
      } else if (element.status === 'Absent') {
        absent += 1;
        // } else if (element.status === 'Leave') {
        //   leave += 1;
      } else if (element.status === 'NH') {
        nh += 1;
      } else if (element.status === 'Not Paid') {
        np += 1;
      } else if (element.status === 'Half Day') {
        halfDay += 1;
      } else if (element.status === 'Earned Leave') {
        el += 1;
      } else if (element.status === 'Casual Leave') {
        cl += 1;
      } else if (element.status === 'Festival Leave') {
        fl += 1;
      }
    });
    setFestivalLeaves(fl);
    setEarnedLeaves(el);
    setCasualLeaves(cl);
    setPresent(present);
    setAbsent(absent);
    // setLeave(leave);
    setHalfDay(halfDay);
    setNh(nh);
    setNotPaid(np);
  };

  const createAttendanceTable = (data) => {
    if (!data) return null; // Handle case where no data is available

    const { days, month } = data;

    const date = new Date(employeee.year, employeee.month - 1);
    console.log('date bangiiii', date);

    // Get the number of days in the month
    console.log(date.getMonth());
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    console.log('pancho', daysInMonth);

    // Get the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
    const firstDay = date.getDay();

    console.log('pancho', firstDay);

    // Define an array to hold attendance data for all days (1-31)
    const attendance = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      status: 'Present',
    }));
    // Fill in attendance data from the response
    if (days) {
      days.forEach((dayObj) => {
        attendance[dayObj.day - 1] = dayObj;
      });
      // console.warn(attendance)
      // caclQuantityofStatus(attendance)
    }
    // caclQuantityofStatus(attendance)
    // Extract day numbers and statuses from the attendance array

    const emptyCellsBefore = firstDay;

    // Calculate how many rows are needed based on the number of days and empty cells
    const rowsNeeded = Math.ceil((daysInMonth + emptyCellsBefore) / 7);
    const dayNumbers = attendance.map((dayData) => dayData.day);
    const statuses = attendance.map((dayData) => dayData.status);
    const weekdays = Array.from({ length: firstDay }, (_, i) => '');
    console.log('weekdays wow1', weekdays);
    const weekdaysShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']; // Short weekday names
    // @ts-ignore
    weekdays.push(...dayNumbers);
    weekdays.push(
      ...Array.from({ length: (6 - (weekdays.length % 7)) % 7 }, (_, i) => '')
    );
    console.log('weekdays wow', weekdays);
    console.log(statuses);
    // Table headers (including all days)

    const weeks = Array.from({ length: rowsNeeded }, (_, rowIndex) => {
      const week = [];

      // Add actual day numbers for the current week, ensuring correct indexing
      for (let i = 0; i < 7; i++) {
        const dayIndex = rowIndex * 7 + i - emptyCellsBefore;
        if (dayIndex >= 0 && dayIndex < daysInMonth) {
          week.push(attendance[dayIndex]);
        } else {
          week.push(''); // Add empty cell if beyond days in month or before first day
        }
      }

      return week;
    });

    console.log('these are the weeks huh', weeks);
    const tableHeaders = Array.from({ length: 31 }, (_, i) => i + 1);
    const tableHeaderss = weekdays.map((day, index) => (
      <TableCell key={index}>{day === '' ? '' : day}</TableCell>
    ));
    console.log(tableHeaderss);

    // Create table body with days and statuses

    const handleStatusChange = (dayIndex, newStatus) => {
      // Update attendance array with the new status
      console.log('oooooooooo', selectedWorkOrder);
      attendance[dayIndex].status = newStatus;
      console.warn(attendance);
      caclQuantityofStatus(attendance);
      // attendanceCopy[dayIndex].status = newStatus
      // Update UI (optional, re-render the table)
    };

    const handlePutAttendance = async () => {
      setLoading(true);
      if (!attendance) return;
      if (!employeeData) return;
      console.log('zzunc', selectedWorkOrder);
      console.log('zzuncc', defaultt);

      // Prepare data for putAttendance function (modify as needed)
      const dataString = JSON.stringify({
        arr: attendance,
        workOrder: selectedWorkOrder._id
          ? selectedWorkOrder._id
          : defaultt?._id,
      });

      try {
        const response = await attendanceAction.PUT.putAttendance(
          dataString,
          employeeData
        );
        console.log(response);
        if (response.success) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
        // Handle successful update (e.g., display success message)
      } catch (error) {
        console.error(error);
        // Handle errors (e.g., display error message)
      } finally {
        setLoading(false);
      }
    };

    // const handleDelete = (id: any) => {};
    const onDeleteHandler = async (
      workOrderHr_Id: string,
      employee_Id: string,
      month: number,
      year: number
    ) => {
      setLoading(true);
      if (!workOrderHr_Id || !employee_Id || !month || !year) {
        toast.error('Insufficient Data');
        return;
      }
      try {
        const resp = await deleteWorkorderFromEmployeeData(
          workOrderHr_Id,
          employee_Id,
          month,
          year
        );
        if (resp.success) {
          toast.success(resp.message);
        } else {
          toast.error(resp.message);
        }
      } catch (error) {
        toast.error(error?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        <div className='mt-6 flex flex-col'>
          {/* <Table className='overflow-auto overflow-x-scroll w-screen border-2 border-slate-500'>
            <TableBody>
            <TableRow>
            <TableCell>Days</TableCell>
            {tableHeaders.map(day => (
              <TableCell key={day}>{day}</TableCell>
            ))}
          </TableRow>,
  
          <TableRow>
            <TableCell>Status</TableCell>
            {statuses.map((status,index) => (
              <TableCell key={index}> <Select defaultValue={status} onValueChange={event => {
                // console.log(event)
                handleStatusChange(index, event)
              }
                }>
              <SelectTrigger >
                <SelectValue placeholder=""  />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel></SelectLabel>
                  <SelectItem value="Present" >Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                
                </SelectGroup>
              </SelectContent>
            </Select></TableCell>
            ))}
          </TableRow>
            </TableBody>
          </Table> */}
          <Table className='overflow-auto overflow-x-scroll w-screen border-2 border-slate-500'>
            <TableBody>
              {/* First row for weekdays (table headers) */}
              <TableRow className=' bg-yellow-400 text-black font-bold'>
                {weekdaysShort.map((day, index) => (
                  <TableCell key={index}>{day}</TableCell>
                ))}
              </TableRow>

              {/* Remaining rows for attendance data */}
              {weeks.map((week, rowIndex) => (
                <TableRow key={rowIndex} className=' bg-blue-200 text-black'>
                  {week.map((dayData, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {typeof dayData === 'string' ? (
                        ''
                      ) : (
                        <div>
                          {dayData.day}
                          {/* Select component for dayData.status */}
                          <Select
                            defaultValue={dayData.status}
                            onValueChange={(event) =>
                              handleStatusChange(
                                rowIndex * 7 + cellIndex - emptyCellsBefore,
                                event
                              )
                            } // Adjust index calculation based on empty cells
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel></SelectLabel>
                                <SelectItem value='Present'>Present</SelectItem>
                                <SelectItem value='Absent'>Absent</SelectItem>
                                {/* <SelectItem value='Leave'>Leave</SelectItem> */}
                                <SelectItem value='Casual Leave'>CL</SelectItem>
                                <SelectItem value='Earned Leave'>EL</SelectItem>
                                <SelectItem value='Festival Leave'>
                                  FL
                                </SelectItem>
                                <SelectItem value='Half Day'>
                                  Half Day
                                </SelectItem>
                                <SelectItem value='NH'>NH</SelectItem>
                                <SelectItem value='Not Paid'>
                                  Not Paid
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className='flex'>
            <Button
              onClick={handlePutAttendance}
              disabled={loading}
              className='left-0 mt-2 w-40 bg-green-500'
            >
              Save Attendance
            </Button>
            {/* <div className='inline' > */}
            <span className='mt-4 ml-4 text-black font-semibold'>
              Select/Update Work Order
            </span>
            {selectedWorkOrder?._id !== '' && (
              <select
                id='dropdown'
                value={selectedWorkOrder?._id}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const sselectedWorkOrder = workOrderList.find(
                    (workOrder) => workOrder._id === selectedId
                  );
                  setSelectedWorkOrder({
                    _id: selectedId,
                    workOrderNumber: sselectedWorkOrder
                      ? sselectedWorkOrder.workOrderNumber
                      : '',
                  });
                }}
                className='mt-2 ml-5 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              >
                {/* Default option */}
                <option value={defaultt._id} selected>
                  {defaultt.workOrderNumber}
                </option>
                {/* Work order options */}
                {workOrderList
                  .filter((ele) => defaultt._id != ele._id) // Exclude elements where ele.skip is true
                  .map((ele) => (
                    <option
                      value={ele._id}
                      key={ele._id}
                      selected={defaultt._id == ele._id}
                    >
                      {ele.workOrderNumber}
                    </option>
                  ))}
              </select>
            )}
            <Button
              className='mt-2 ml-2'
              disabled={loading}
              onClick={() => {
                setDialogOpen(true);
                // setSelectedWorkOrder(ele);
              }}
              // onClick={() =>
              //   onDeleteHandler(
              //     selectedWorkOrder._id,
              //     employeee.id,
              //     parseInt(employeee.month),
              //     parseInt(employeee.year)
              //   )
              // }
            >
              Delete Selected. Work Order
            </Button>

            {/* </div> */}
          </div>
        </div>
        <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-red-500'>
                Confirm Delete
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete attendance for selected Work
                Order? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className='bg-red-500'
                onClick={() =>
                  onDeleteHandler(
                    selectedWorkOrder._id,
                    employeee.id,
                    parseInt(employeee.month),
                    parseInt(employeee.year)
                  )
                }
                // onClick={() => handleDelete(selectedWorkOrder._id)}
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  useEffect(() => {
    const fn = async () => {
      try {
        console.log(employeee);
        setAttendanceData(null);
        const data = {
          employee: employeee.id,
          year: parseInt(employeee.year),
          month: parseInt(employeee.month),
          workOrderHr: employeee?.wo,
        };

        //   const response = await chalanAction.FETCH.getChalanByChalanNumber(data.chalanNumber)
        const filter = await JSON.stringify(data);
        setEmployeeData(filter);
        const response = await attendanceAction.FETCH.fetchAttendance(filter);
        console.log(JSON.parse(response.data));
        const responseData = JSON.parse(response.data);
        setAttendanceData(responseData);
        // caclQuantityofStatus(attendanceData)
        // setAttendanceCopy(responseData)
        console.warn('Att Data', responseData.workOrderHr);
        // const workOrderHrObj = responseData.workOrderHr._id
        // setSelectedWorkOrder({
        //   _id: workOrderHrObj._id,
        //   workOrderNumber:workOrderHrObj.workOrderNumber
        // })
        setSelectedWorkOrder({
          _id: responseData.workOrderHr?._id,
          workOrderNumber: responseData?.workOrderHr?.workOrderNumber,
        });
        console.log('aagya response');
        caclQuantityofStatus(responseData?.days);
        console.error('The SelectedWorkORder is', selectedWorkOrder);
      } catch (error) {
        toast.error('Internal Server Error');
        console.error('Internal Server Error:', error);
      }
    };
    fn();
  }, []);

  return (
    <>
      <div className=''>
        {employeee?.wo === 'Default' && (
          <div className='bg-yellow-100 text-yellow-600 p-1 mb-1 pl-2 rounded'>
            This is Default Pre-Filled Attendance
          </div>
        )}
        <span className='text-green-500 font-semibold mx-2'>
          Present {present}
        </span>
        <span className='text-red-500 font-semibold mx-2'>Absent {absent}</span>
        {/* <span className='text-blue-500 font-semibold mx-2'>Leave {leave}</span> */}
        <span className='text-blue-500 font-semibold mx-2'>
          Half Day (HD) {halfDay}
        </span>
        <span className='text-blue-500 font-semibold mx-2'>
          National Holiday(NH) {nh}
        </span>
        <span className='text-blue-500 font-semibold mx-2'>
          Not Paid (NP) {notPaid}
        </span>
        <span className='text-blue-500 font-semibold mx-2'>
          Earned Leaves (EL) {earnedLeaves}
        </span>
        <span className='text-blue-500 font-semibold mx-2'>
          Casual Leaves (CL) {casualLeaves}
        </span>
        <span className='text-blue-500 font-semibold mx-2'>
          Festival Leaves (FL) {festivalLeaves}
        </span>
        {!attendanceData ? (
          <div>Loading......</div>
        ) : (
          createAttendanceTable(attendanceData)
        )}
        {/* <div>
        This employee have saved attendances for workOrders :
        {employeee?.employee?.workOrderHr?.map((wo) => (
          <p key={wo?.workOrderHr}>{JSON.stringify(wo?.workOrderHr)}</p>
          ))}
          </div> */}
      </div>
    </>
  );
};

export default AddAttendance;

'use client';
import { useState, useEffect } from 'react';
import { fetchAllAttendance } from '@/lib/actions/attendance/fetch';
import { fetchAllDepAttendance } from '@/lib/actions/attendance/fetch';
import { wagesColumns } from '@/components/hr/WagesColumn';
import ReactDOMServer from 'react-dom/server';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import wagesAction from '@/lib/actions/HR/wages/wagesAction';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autotable from 'jspdf-autotable';
import { DataTable } from '@/components/data-table';
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
import employeeAction from '@/lib/actions/employee/employeeAction';
import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import attendanceAction from '@/lib/actions/attendance/attendanceAction';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import departmentHrAction from '@/lib/actions/HR/DepartmentHr/departmentHrAction';
import { fetchEmployeeByDep } from '@/lib/actions/HR/EmployeeData/fetch';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import { fetchAllEmployees } from '@/lib/actions/employee/fetch';
import { months, monthsName, years } from '@/constants';

const schema = z.object({
  year: z.string().trim().min(1, 'Required'),
  month: z.string().trim().min(1, 'Required'),
  workOrder: z.string().trim().min(1, 'Required'),
});

const secSchema = z.object({
  location: z.string().trim().min(1, 'Required'),
  employer: z.string().trim().min(1, 'Required'),
  workOrder: z.string().trim().min(1, 'Required'),
});

type SecondFormFields = z.infer<typeof secSchema>;

type FormFields = z.infer<typeof schema>;
const Client = () => {
  const router = useRouter();
  const form = useForm<FormFields>({
    defaultValues: {
      year: '',
      month: '',
      workOrder: '',
    },
    resolver: zodResolver(schema),
  });

  const secForm = useForm<SecondFormFields>({
    defaultValues: {
      location: '',
      employer: '',
      workOrder: '',
    },
    resolver: zodResolver(secSchema),
  });
  const [workOrderNumber, setWorkOrderNumber] = useState<any>(null);

  const [employees, setEmployees] = useState([]);
  const [aaction, setAAction] = useState('');

  const [departments, setDepartments] = useState([]);

  const [attendanceData, setAttendanceData] = useState(null);
  const [attendance, setAttendance] = useState(null);

  const [employeeData, setEmployeeData] = useState(null);

  const [wagesData, setWagesData] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [dep, setDep] = useState(null);
  const [allWorkOrderNumbers, setAllWorkOrderNumbers] = useState([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    const fetch = async () => {
      // const { data, success, error } =
      //   await workOrderAction.FETCH.fetchAllWorkOrder();

      const workOrderResp =
        await WorkOrderHrAction.FETCH.fetchAllValidWorkOrderHr();
      const success = workOrderResp.success;
      // const error = workOrderResp.error
      // const data = JSON.parse(workOrderResp.data)

      if (success) {
        const workOrderNumbers = JSON.parse(workOrderResp.data);
        setAllWorkOrderNumbers(workOrderNumbers);
        // console.log("yeraaaa wowowowwoncjd", workOrderNumbers);
      } else {
        toast.error('Can not fetch work order numbers!');
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    // console.log(
    //   "first lawde",
    //   page <= employees.length / 2,
    //   page,
    //   employees.length,
    //   employees
    // );
    if (!(page <= employees.length / 2)) return;
    // console.log("first jawda");
    const fn = async () => {
      if (employees.length / 15 < page) fetchAttendanceAndWages(page);
    };
    fn();
  }, [page]);

  // console.log("EMPLOYEES LENGTH XX", employees.length);
  const fetchMoreData = async (prevOrNext: 'next' | 'prev') => {
    if (prevOrNext === 'next') {
      // console.log("GILI");
      setPage((page) => page + 1);
    } else {
      setPage((page) => page - 1);
    }

    // if (employees.length / 15 < page) await fetchAttendanceAndWages(page);
  };

  const fetchAttendanceAndWages = async (page_sanku = 1, page_size = 15) => {
    try {
      // console.log("arree muaaa");
      // console.log("XX running");
      const res = await EmployeeDataAction.FETCH.fetchAllEmployeeData(
        page_sanku,
        page_size
      );
      // console.log("page_sanku", page_sanku);
      const depemployees = JSON.parse(res.data);
      if (!depemployees || depemployees.length === 0) {
        toast.error('No employees available');
        return;
      }
      // setEmployees((emp) => [...emp, depemployees]);
      setEmployees((emp) => emp.concat(depemployees));
      //   console.log(data);
      // //  setAttendanceData(null)
      //  setMonth(data.month)
      //  setYear(data.year)
      //  data.month = parseInt(data.month);

      const bata = {
        month: parseInt(month),
        year: parseInt(year),
        workOrder: workOrderNumber,
      };
      //   const response = await chalanAction.FETCH.getChalanByChalanNumber(data.chalanNumber)
      const filter = await JSON.stringify(bata);
      setEmployeeData(filter);

      const wageresponse = await wagesAction.FETCH.fetchFilledWages(
        month,
        year,
        workOrderNumber
      );
      if (wageresponse.success) {
        toast.success(wageresponse.message);
        const wagedata = await JSON.parse(wageresponse.data);
        setWagesData(wagedata);

        // console.log("wow kya wage hai", wagedata);
      } else {
        toast.error(wageresponse.message);
      }

      // console.log("ek aur respnnse aaigawa", wageresponse);
    } catch (error) {
      toast.error(
        'Something went wrong, Please check internet connection, refresh or Try Later:'
      );
      console.error('Internal Server Error:', error);
    }
  };

  const onSubmit: SubmitHandler<FormFields> = async (data: any, event) => {
    try {
      // console.log("arrrrreeee sahi h", workOrderNumber);
      // @ts-ignore
      const action = event.nativeEvent.submitter.value;
      const res = await EmployeeDataAction.FETCH.fetchAllEmployeeData();
      let depemployees = [];
      if (res.success) {
        depemployees = JSON.parse(res.data);
      }
      // console.log("DEP EMP:*** ", depemployees);
      if (!depemployees || depemployees.length === 0) {
        toast.error('No employees available');
        return;
      }
      setEmployees(depemployees);
      setPage(1);
      // console.log(data);
      //  setAttendanceData(null)
      setMonth(data.month);
      setYear(data.year);

      const query = {
        year: data.year,
        month: data.month,
        wo: data.workOrder,
      };
      const queryString = new URLSearchParams(query).toString();

      data.month = parseInt(data.month);

      data.year = parseInt(data.year);
      // console.log("kya baat", data);
      //   const response = await chalanAction.FETCH.getChalanByChalanNumber(data.chalanNumber)
      const filter = await JSON.stringify(data);
      setEmployeeData(filter);
      setPeriodData(`${data.month}-${data.year}`);
      // console.log("hhhhhhhhhhhhhhhhhh", data);
      const wageresponse = await wagesAction.FETCH.fetchFilledWages(
        data.month,
        data.year,
        data.workOrder
      );
      if (wageresponse.success) {
        toast.success(wageresponse.message);
        const wagedata = await JSON.parse(wageresponse.data);
        setWagesData(wagedata);

        // console.log("wow kya wage hai", wagedata);
      } else {
        toast.error(wageresponse.message);
      }

      // console.log("ek aur respnnse aaigawa", wageresponse);
      if (action === 'GWR') {
        // setAAction(action);
        window.open(`/hr/wages-register?${queryString}`, '_blank');
      } else if (action === 'AS') {
        window.open(`/hr/Allowances?${queryString}`, '_blank');
      }
    } catch (error) {
      toast.error(
        'Something went wrong, Please check internet connection, refresh or Try Later'
      );
      console.error(
        'Something went wrong, Please check internet connection, refresh or Try Later:',
        error
      );
    }
  };

  const onSecSubmit: SubmitHandler<SecondFormFields> = async (
    data: SecondFormFields,
    event
  ) => {
    try {
      // console.log("yeich hai second form data", event)
      const query = {
        year: year,
        month: month,
        location: data.location,
        employer: data.employer,
        wo: data.workOrder,
      };
      const queryString = new URLSearchParams(query).toString();
      // @ts-ignore
      const action: any = event.nativeEvent.submitter.value;
      //
      if (action === 'FORMXVI') {
        window.open(`/hr/formXVI?${queryString}`, '_blank');
      } else window.open(`/hr/formXVII?${queryString}`, '_blank');
    } catch (error) {
      toast.error(
        'Something went wrong, Please check internet connection, refresh or Try Later:'
      );
      console.error('error', error);
    }
  };

  // useEffect(() => {
  //   const fn = async () => {

  // try  {
  //   console.log("wowoowowow")
  //    const response =await EmployeeDataAction.FETCH.fetchAllEmployeeData();

  //       console.log(response);
  //     if(response.success)  {
  //       const responseData=await JSON.parse(response.data)
  //       console.log("sahi response", responseData)
  //       setEmployees(responseData)

  //         }else {
  // console.log(response.message)
  //           }
  // }catch(err)
  // {
  //   toast.error('Internal Serveeer Error')
  //   console.log('Internal Serveeer Error:', err);
  // }
  //   };
  //   fn();
  // }, []);

  useEffect(() => {
    const fn = async () => {
      try {
        // console.log("wowoowowow");
        const response = await departmentHrAction.FETCH.fetchDepartmentHr();

        // console.log(response);
        if (response?.success) {
          const responseData = await JSON.parse(response.data);
          // console.log("sahi response", responseData);
          setDepartments(responseData);
        } else {
          // console.log(response.message);
        }
      } catch (err) {
        toast.error(
          'Something went wrong, Please check internet connection, refresh or Try Later'
        );
        console.log('Internal Serveeer Error:', err);
      }
    };
    fn();
  }, []);

  useEffect(() => {
    const fn = async () => {
      try {
        setLoading(true);
        if (!wagesData) return;
        setAttendanceData(null);
        const response = await fetchAllDepAttendance(employeeData);
        // console.log(response);
        if (response?.success) {
          toast.success('Attendance Results retrieved');
          const responseData = JSON.parse(response.data);
          // console.log("yeri length", responseData.length);
          // console.log("sahi response 22", responseData);
          setAttendance(responseData);
          const newData = [];

          for (let index = 0; index < employees.length; index++) {
            const employee = employees[index];
            const parsed = JSON.parse(employeeData);

            if (!employee.workOrderHr && parsed.workOrder !== 'Default') {
              continue; // Skip this iteration
            }

            // Second condition: If workOrderHr exists but no matching period and parsed.workOrder is not "Default", continue
            if (employee.workOrderHr && parsed.workOrder !== 'Default') {
              const period = `${parsed.month}-${parsed.year}`;

              // Find a matching period
              const matchingPeriod = employee.workOrderHr.find(
                (workOrderHr) =>
                  workOrderHr.period.trim() === period.trim() &&
                  workOrderHr.workOrderHr.toString() ===
                    parsed.workOrder.toString()
              );

              // If no matching period
              if (!matchingPeriod) {
                // If the last workOrderHr matches, continue processing (don't skip)

                // If it doesn't match, skip this iteration
                continue; // Skip this iteration
              }
            }

            // console.log("dekhte han & ham bumhra", employees, employee[12]);
            const existingAttendance = responseData.find(
              (attendance) => attendance.employee.code === employee.code
            );

            // console.log("urrey vaiiii", existingAttendance);
            //yaha default vali condition dekhni hogi
            const attendance =
              parsed.workOrder !== 'Default' &&
              existingAttendance &&
              employee?.workOrderHr?.map((wo, index) =>
                wo.period.trim() === periodData &&
                wo.workOrderHr.toString() === parsed.workOrder
                  ? wo.workOrderAtten
                  : ''
              );
            // how is this being done, I have to check if something goes wrong
            const attendanceDefault =
              parsed.workOrder === 'Default' && existingAttendance
                ? existingAttendance.days.reduce((acc, day) => {
                    if (day.status === 'Present') {
                      return acc + 1;
                    } else if (day.status === 'NH') {
                      return acc + 1;
                    } else if (day.status === 'Half Day') {
                      return acc + 0.5;
                    } else if (
                      day.status === 'Earned Leave' ||
                      day.status === 'Casual Leave' ||
                      day.status === 'Festival Leave'
                    ) {
                      return acc + 1;
                    }
                    return acc;
                  }, 0)
                : 0;

            // console.log(
            //   "yeto load hi nii hua",
            //   wagesData,
            //   attendance,
            //   attendanceDefault
            // );

            const existingWage = wagesData.find((wage) => {
              if (wage.employee) {
                return wage.employee.code === employee.code;
              }
            });

            newData.push({
              serial: index + 1,
              id: employee._id,
              name: employee.name,
              safetypass: employee.safetyPassNumber,
              designation: employee.designation,
              attendance:
                parsed.workOrder !== 'Default' ? attendance : attendanceDefault,
              wages: existingWage ? 'Filled' : 'Not filled',
              existingWage,
              month: month,
              year: year,
              isAttendance: existingAttendance ? true : false,
              employee: employee,
              wo: parsed.workOrder,
            });
          }
          setAttendanceData(newData);
          setLoading(false);
          // console.log("yeich hai newData", newData);
          // console.log("aagya response");
          // if(aaction==="GWR")
          // {
          //   const query = { employee: JSON.stringify(attendanceData) };
          //   const queryString = new URLSearchParams(query).toString();

          //  window.open(/hr/wages-register?${queryString},'_blank')

          // }
        } else {
          console.log(response.message);
        }
      } catch (err) {
        toast.error(
          'Something went wrong, Please check internet connection, refresh or Try Later:'
        );
        console.log('Internal Server Error: ***', err);
      }
    };
    fn();
  }, [wagesData]);

  useEffect(() => {
    const fn = async () => {
      try {
        if (!attendanceData) return;
        if (aaction === 'GWR') {
          const query = { employee: JSON.stringify(attendanceData) };
          const queryString = new URLSearchParams(query).toString();

          window.open(`/hr/wages-register?${queryString}`, '_blank');
          setAAction('');
        }
      } catch (err) {
        toast.error(
          'Something went wrong, Please check internet connection, refresh or Try Later:'
        );
        console.error('Internal Server Error:', err);
      }
    };
    fn();
  }, [attendanceData]);

  const MyTable = ({ employeeData, onRenderComplete }) => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array of days (1 to 31)

    return (
      <Table className='overflow-auto'>
        <TableHeader>
          <TableRow>
            <TableHead>Serial No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Father Name</TableHead>
            {/* Table headers for each day */}
            {days.map((day, idx) => (
              <TableHead key={day + 'jum' + idx}>{day}</TableHead>
            ))}
            <TableHead>Total Attendance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employeeData.map((employee, index) => (
            <TableRow key={employee._id.toString()}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{employee.employee.name}</TableCell>
              <TableCell>{employee.employee.fathersName}</TableCell>
              {/* Table data for each day (status) */}
              {days.map((day) => (
                <TableCell key={day + '' + employee._id.toString()}>
                  {employee.days.find((d) => d.day === day)?.status || '-'}
                </TableCell>
              ))}
              <TableCell>
                {employee.days.filter((day) => day.status === 'present').length}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const createAttendanceTable = (data) => {
    if (!data) return null; // Handle case where no data is available

    const { days, month } = data;

    // Define an array to hold attendance data for all days (1-31)
    const attendance = Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      status: 'Absent',
    }));
    // Fill in attendance data from the response
    days.forEach((dayObj) => {
      attendance[dayObj.day - 1] = dayObj;
    });

    // Extract day numbers and statuses from the attendance array
    const dayNumbers = attendance.map((dayData) => dayData.day);
    const statuses = attendance.map((dayData) => dayData.status);
    // console.log(statuses);
    // Table headers (including all days)
    const tableHeaders = Array.from({ length: 31 }, (_, i) => i + 1);

    // Create table body with days and statuses

    const handleStatusChange = (dayIndex, newStatus) => {
      // Update attendance array with the new status
      attendance[dayIndex].status = newStatus;
      // console.log(attendance);
      // Update UI (optional, re-render the table)
    };

    const handlePutAttendance = async () => {
      if (!attendance) return;
      if (!employeeData) return;

      // Prepare data for putAttendance function (modify as needed)
      const dataString = JSON.stringify({ arr: attendance });

      try {
        const response = await attendanceAction.PUT.putAttendance(
          dataString,
          employeeData
        );
        // console.log(response);
        if (response?.success) {
          toast.success('Attendance updated successfully');
          // console.log(response.data, "attandance data backend");
        } else {
          toast.error('Error updating attendance');
        }
        // Handle successful update (e.g., display success message)
      } catch (error) {
        console.error(error);
        // Handle errors (e.g., display error message)
      }
    };
    return (
      <div className='mt-6'>
        <Table className='overflow-x-scroll w-screen border-2 border-slate-500'>
          <TableBody>
            <TableRow>
              <TableCell>Days</TableCell>
              {tableHeaders.map((day) => (
                <TableCell key={day}>{day}</TableCell>
              ))}
            </TableRow>
            ,
            <TableRow>
              <TableCell>Status</TableCell>
              {statuses.map((status, index) => (
                <TableCell key={index + 'hum' + index}>
                  {' '}
                  <Select
                    defaultValue={status}
                    onValueChange={(event) => {
                      // console.log(event)
                      handleStatusChange(index, event);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel></SelectLabel>
                        <SelectItem value='Present'>Present</SelectItem>
                        <SelectItem value='Absent'>Absent</SelectItem>
                        <SelectItem value='Leave'>Leave</SelectItem>
                        <SelectItem value='Off'>Off</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
        <Button onClick={handlePutAttendance}>Save Attendance</Button>
      </div>
    );
  };

  return (
    <div>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        CLM
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
        >
          <h2 className=' bg-primary-color-extreme/10 text-center py-1 text-base   relative   '>
            Select Year and Month
          </h2>
          <div className='flex flex-col md:flex-row p-3 gap-4'>
            <FormField
              control={form.control}
              name='year'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Year</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      // console.log(e);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        {field.value ? (
                          <SelectValue placeholder='' />
                        ) : (
                          'Select Year'
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-w-80 max-h-72'>
                      {years?.map((option, index) => (
                        <SelectItem
                          value={option.toString()}
                          key={option + 'tum'}
                        >
                          {option.toString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='month'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Month</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      // setWorkOrderNumber(e)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        {field.value ? (
                          <SelectValue placeholder='' />
                        ) : (
                          'Select Month'
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-w-80 max-h-72'>
                      {months?.map((option, index) => (
                        <SelectItem
                          value={option.toString()}
                          key={option + 'lum' + index}
                        >
                          {monthsName[option - 1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='workOrder'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Work Order</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      setWorkOrderNumber(e);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        {field.value ? (
                          <SelectValue placeholder='' />
                        ) : (
                          'Select Work Order No.'
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-w-80 max-h-72'>
                      <SelectItem value='Default' key='Default'>
                        Default
                      </SelectItem>

                      {allWorkOrderNumbers?.map((option, index) => (
                        <SelectItem
                          value={option._id.toString()}
                          key={option._id.toString()}
                        >
                          {option.workOrderNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='p-4 flex flex-col md:flex-row gap-2 justify-center items-center'>
            <Button
              type='submit'
              className='flex items-center gap-1 border-2 border-black px-4 mb-2 rounded bg-green-500 text-white'
              value='SL'
              // onClick={handleSubmit(onSubmit)}
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Show List</>
            </Button>
            <Button
              type='submit'
              className='flex items-center gap-1 border-2 border-black px-4 mb-2 rounded bg-green-500 text-white'
              value='AS'
              // onClick={handleSubmit(onSubmit)}
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Allowances Slip</>
            </Button>
            <Button
              type='submit'
              className='flex items-center gap-1 border-2 border-black px-4 mb-2 rounded bg-green-500 text-white'
              value='GWR'
              // onClick={handleSubmit(onSubmit)}
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Generate Wages Register</>
            </Button>
          </div>
        </form>
      </Form>

      {/* {attendanceData && createAttendanceTable(attendanceData)} */}
      <div className='mt-8 flex flex-col '>
        {' '}
        {((attendance && attendance.length > 0) ||
          (wagesData && wagesData.length > 0)) && (
          //   <Link

          // className='bg-black text-white mt-6 w-48 rounded-md'
          //               href={{
          //                 pathname: '/hr/formXVI',
          //                 query: {

          //                   year: year,
          //                   month:month
          //                 }
          //               }}

          //             >
          //            <Button className='w-48'>Generate FORMXVI</Button>
          //             </Link>
          <Form {...secForm}>
            <form
              onSubmit={secForm.handleSubmit(onSecSubmit)}
              className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
            >
              <div className='flex flex-col md:flex-row p-3 gap-4'>
                <FormField
                  control={secForm.control}
                  name='location'
                  render={({ field }) => (
                    <FormItem className=' flex-col flex gap-1 flex-1'>
                      <FormLabel>Name and Location</FormLabel>
                      <FormControl>
                        {field.value ? (
                          <Input
                            placeholder=''
                            {...field}
                            className=' bg-white '
                          />
                        ) : (
                          <Input
                            placeholder='Enter Location of work'
                            {...field}
                            className=' bg-white '
                          />
                        )}
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={secForm.control}
                  name='employer'
                  render={({ field }) => (
                    <FormItem className=' flex-col flex gap-1 flex-1'>
                      <FormLabel>Employer</FormLabel>
                      <FormControl>
                        {field.value ? (
                          <Input
                            placeholder=''
                            {...field}
                            className=' bg-white '
                          />
                        ) : (
                          <Input
                            placeholder='Name and Address of Principal Employer'
                            {...field}
                            className=' bg-white '
                          />
                        )}
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={secForm.control}
                  name='workOrder'
                  render={({ field }) => (
                    <FormItem className=' flex-col flex gap-1 flex-1'>
                      <FormLabel>Work Order</FormLabel>
                      <Select
                        onValueChange={(e) => {
                          field.onChange(e);
                          //setWorkOrderNumber(e)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {field.value ? (
                              <SelectValue placeholder='' />
                            ) : (
                              'Select Work Order No.'
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
                          <SelectItem value='Default' key='Default'>
                            Default
                          </SelectItem>

                          {allWorkOrderNumbers?.map((option, index) => (
                            <SelectItem
                              value={option._id.toString()}
                              key={option._id.toString()}
                            >
                              {option.workOrderNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='p-4 flex flex-col md:flex-row gap-2 justify-center items-center'>
                <Button
                  type='submit'
                  value='FORMXVI'
                  disabled={!attendance || attendance.length === 0}
                  className='flex items-center gap-1 border-2 px-4 mb-2 rounded'
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  )}
                  <>Generate FORMXVI</>
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
      {attendanceData && (
        <button
          className='bg-blue-500 mt-2 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-300'
          onClick={async () => {
            console.log('LELLA', page);
            // isko kar sakte h
            // await fetchAttendanceAndWages(1);
            setEmployees([]);
            await fetchAttendanceAndWages(1, page * 15);
          }}
        >
          Refresh Attendance & Wages
        </button>
      )}
      {attendanceData && !loading && (
        <DataTable
          data={attendanceData}
          columns={wagesColumns}
          filterValue='name'
          pageCount={15}
          page={page} // Pass the page state here
        />
      )}

      {/* {attendanceData && MyTable(dataforPDF)} */}
    </div>
  );
};

export default Client;

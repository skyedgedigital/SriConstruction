'use client';
import { useState, useEffect } from 'react';
import { fetchAllAttendance } from '@/lib/actions/attendance/fetch';
import WorkOrderHr from '@/lib/models/HR/workOrderHr.model';
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
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import departmentHrAction from '@/lib/actions/HR/DepartmentHr/departmentHrAction';
import EsiLocationAction from '@/lib/actions/HR/EsiLocation/EsiLocationAction';
import StateActionHr from '@/lib/actions/HR/State/StateAction';
import { months, years } from '@/constants';

const schema = z.object({
  year: z.string().trim().min(1, 'Required'),
  month: z.string().trim().min(1, 'Required'),
  department: z.string().trim().min(1, 'Required'),
});

const secSchema = z.object({
  year: z.string().trim().min(1, 'Required'),
  month: z.string().trim().min(1, 'Required'),
  esistate: z.string().trim().min(1, 'Required'),
});

const thirdSchema = z.object({
  year: z.string().trim().min(1, 'Required'),
  month: z.string().trim().min(1, 'Required'),
  workOrder: z.string().trim().min(1, 'Required'),
  department: z.string().trim().min(1, 'Required'),
});

const fourthSchema = z.object({
  year: z.string().trim().min(1, 'Required'),
  //    month:z.string().trim().min(1,"Required"),

  workOrder: z.string().trim().min(1, 'Required'),
  department: z.string().trim().min(1, 'Required'),
  bonusPercentage: z.string().trim().min(1, 'Required'),
});

type SecondFormFields = z.infer<typeof secSchema>;
type ThirdFormFields = z.infer<typeof thirdSchema>;
type FourthFormFields = z.infer<typeof fourthSchema>;

type FormFields = z.infer<typeof schema>;
const Page = () => {
  const router = useRouter();
  const form = useForm<FormFields>({
    defaultValues: {
      year: '',
      month: '',
      department: 'All Departments',
    },
    resolver: zodResolver(schema),
  });
  const fourthForm = useForm<FourthFormFields>({
    defaultValues: {
      year: '',
      workOrder: 'Default',
      department: 'All Departments',
      bonusPercentage: '8.33',
    },
    resolver: zodResolver(fourthSchema),
  });

  const thirdform = useForm<ThirdFormFields>({
    defaultValues: {
      year: '',
      month: '',
      department: 'All Departments',
      workOrder: 'Default',
    },
    resolver: zodResolver(thirdSchema),
  });

  const [workOrderNumber, setWorkOrderNumber] = useState<any>(null);

  const [departments, setDepartments] = useState([]);
  const [esis, setEsis] = useState([]);
  const [states, setStates] = useState([]);

  useEffect(() => {
    const fn = async () => {
      try {
        console.log('wowoowowow');
        const response = await EsiLocationAction.FETCH.fetchEsiLocation();

        console.log(response);
        if (response.success) {
          const responseData = await JSON.parse(response.data);
          console.log('sahi response', responseData);
          setEsis(responseData);
        } else {
          console.log(response.message);
        }
      } catch (err) {
        toast.error('Internal Serveeer Error');
        console.log('Internal Serveeer Error:', err);
      }
    };
    fn();
  }, []);

  useEffect(() => {
    const fn = async () => {
      try {
        console.log('wowoowowow');
        const response = await departmentHrAction.FETCH.fetchDepartmentHr();

        console.log(response);
        if (response.success) {
          const responseData = await JSON.parse(response.data);
          console.log('sahi response', responseData);
          setDepartments(responseData);
        } else {
          console.log(response.message);
        }
      } catch (err) {
        toast.error('Internal Serveeer Error');
        console.log('Internal Serveeer Error:', err);
      }
    };
    fn();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await StateActionHr.FETCH.fetchState();
        if (response.success) {
          setStates(JSON.parse(response.data));
          console.log(states);
        } else {
          console.error('Failed to fetch states');
        }
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    console.log('States data changes: ', states);
  }, [states]);

  const secForm = useForm<SecondFormFields>({
    defaultValues: {
      year: '',
      month: '',
      esistate: '',
    },
    resolver: zodResolver(secSchema),
  });

  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [sattendanceData, setSAttendanceData] = useState(null);

  const [attendance, setAttendance] = useState(null);

  const [employeeData, setEmployeeData] = useState(null);

  const [wagesData, setWagesData] = useState(null);

  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);

  const onEmployeeSubmit: SubmitHandler<SecondFormFields> = async (
    data: SecondFormFields
  ) => {
    try {
      // console.log("yeich hai second form data", event)
      const query = {
        year: data.year,
        month: data.month,
        esistate: data.esistate,
      };
      const queryString = new URLSearchParams(query).toString();
      // @ts-ignore
      //
      window.open(`/hr/esic?${queryString}`, '_blank');
    } catch (error) {
      toast.error('Internalll Server Error');
      console.error('Internal Server Error:', error);
    }
  };

  const onYearSubmit: SubmitHandler<FormFields> = async (
    data: FormFields,
    event
  ) => {
    try {
      // console.log("yeich hai second form data", event)
      const query = {
        year: data.year,
        month: data.month,
        dept: data.department,
      };
      const queryString = new URLSearchParams(query).toString();
      // @ts-ignore
      //
      window.open(`/hr/pf?${queryString}`, '_blank');
    } catch (error) {
      toast.error('Internalll Server Error');
      console.error('Internal Server Error:', error);
    }
  };

  // const onBankSubmit: SubmitHandler<ThirdFormFields> = async (
  //   data: ThirdFormFields,
  //   event
  // ) => {
  //   try {
  //     // console.log("yeich hai second form data", event)
  //     const query = {
  //       year: data.year,
  //       month: data.month,
  //       dept: data.department,
  //       wo: data.workOrder,
  //     };
  //     const queryString = new URLSearchParams(query).toString();
  //     // @ts-ignore
  //     //
  //     window.open(`/hr/bank-statement?${queryString}`, '_blank');
  //   } catch (error) {
  //     toast.error('Internalll Server Error');
  //     console.error('Internal Server Error:', error);
  //   }
  // };

  useEffect(() => {
    const fn = async () => {
      try {
        console.log('wowoowowow');
        const response = await EmployeeDataAction.FETCH.fetchAllEmployeeData();

        console.log(response);
        if (response.success) {
          const responseData = await JSON.parse(response.data);
          console.log('sahi response', responseData);
          setEmployees(responseData);
        } else {
          console.log(response.message);
        }
      } catch (err) {
        toast.error('Internal Serveeer Error');
        console.log('Internal Serveeer Error:', err);
      }
    };
    fn();
  }, []);

  const [allWorkOrderNumbers, setAllWorkOrderNumbers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      // const { data, success, error } =
      //   await workOrderAction.FETCH.fetchAllWorkOrder();

      const workOrderResp = await WorkOrderHrAction.FETCH.fetchAllWorkOrderHr();
      const success = workOrderResp.success;
      // const error = workOrderResp.error
      // const data = JSON.parse(workOrderResp.data)

      if (success) {
        const workOrderNumbers = JSON.parse(workOrderResp.data);
        setAllWorkOrderNumbers(workOrderNumbers);
        console.log('yeraaaa wowowowwoncjd', workOrderNumbers);
      } else {
        toast.error('Can not fetch work order numbers!');
      }
    };
    fetch();
  }, []);

  const monthsName = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // const onBonusSubmit: SubmitHandler<FourthFormFields> = async (
  //   data: FourthFormFields,
  //   event
  // ) => {
  //   try {
  //     console.log(workOrderNumber);
  //     // console.log("yeich hai second form data", event)

  //     const query = {
  //       year: data.year,
  //       wo: data.workOrder,
  //       dep: data.department,
  //     };
  //     const queryString = new URLSearchParams(query).toString();
  //     // @ts-ignore
  //     const action = event.nativeEvent.submitter.value;
  //     console.log('llllllllll');
  //     if (action == 'BS')
  //       window.open(`/hr/bonus-statement?${queryString}`, '_blank');
  //     else window.open(`/hr/leave-statement?${queryString}`, '_blank');
  //   } catch (error) {
  //     toast.error('Internalll Server Error');
  //     console.error('Internal Server Error:', error);
  //   }
  // };

  return (
    <div className='pr-2'>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        PF ESIC
      </h1>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onYearSubmit)}
            className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
          >
            <h2 className='bg-blue-50 font-semibold p-1 text-base text-center py-2'>
              PF Form
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
                        // setWorkOrderNumber(e)
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
                          <SelectItem value={option.toString()} key={option}>
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
                          <SelectItem value={option.toString()} key={option}>
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
                name='department'
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e);
                        //setWorkOrderNumber(e)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Department' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-w-80 max-h-72'>
                        <SelectItem value='All Departments'>
                          All Departments
                        </SelectItem>

                        {departments?.map((option, index) => (
                          <SelectItem
                            value={option._id.toString()}
                            key={option._id.toString()}
                          >
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='py-4 flex justify-center items-center'>
              <Button
                type='submit'
                className='flex items-center gap-1 border-2 px-4 rounded'
              >
                {form.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                <>Generate PF</>
              </Button>
            </div>
          </form>
        </Form>

        <Form {...secForm}>
          <form
            onSubmit={secForm.handleSubmit(onEmployeeSubmit)}
            className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
          >
            <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
              ESIC Form
            </h2>
            <div className='flex flex-col md:flex-row p-3 gap-4'>
              <FormField
                control={secForm.control}
                name='year'
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Year</FormLabel>
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
                            'Select Year'
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-w-80 max-h-72'>
                        {years?.map((option, index) => (
                          <SelectItem value={option.toString()} key={option}>
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
                control={secForm.control}
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
                          <SelectItem value={option.toString()} key={option}>
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
                control={secForm.control}
                name='esistate'
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>ESI State</FormLabel>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e);
                        //setWorkOrderNumber(e)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select ESI State' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-w-80 max-h-72'>
                        <SelectItem value='All'>All States</SelectItem>

                        {Array.from(
                          new Set(
                            states?.map((option) => option.states.stateName)
                          )
                        ).map((uniqueStateName, index) => (
                          <SelectItem value={uniqueStateName} key={index}>
                            {uniqueStateName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='p-4 flex justify-center items-center'>
              <Button
                type='submit'
                className='flex items-center gap-1 border-2 px-4 rounded'
              >
                {form.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                <>Generate ESIC</>
              </Button>
            </div>
          </form>
        </Form>
        {/* <Form {...thirdform}>
          <form
            onSubmit={thirdform.handleSubmit(onBankSubmit)}
            className=' border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
          >
            <h2 className='bg-blue-50 font-semibold p-1 text-base text-center py-2'>
              Bank Statement Form
            </h2>
            <div className='flex flex-col md:flex-row p-3 gap-4'>
              <FormField
                control={thirdform.control}
                name='year'
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Year</FormLabel>
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
                            'Select Year'
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-w-80 max-h-72'>
                        {years?.map((option, index) => (
                          <SelectItem value={option.toString()} key={option}>
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
                control={thirdform.control}
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
                          <SelectItem value={option.toString()} key={option}>
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
                control={thirdform.control}
                name='department'
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e);
                        //setWorkOrderNumber(e)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Department' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-w-80 max-h-72'>
                        <SelectItem value='All Departments'>
                          All Departments
                        </SelectItem>

                        {departments?.map((option, index) => (
                          <SelectItem
                            value={option._id.toString()}
                            key={option._id.toString()}
                          >
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={thirdform.control}
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
                        <SelectItem value='Default'>Default</SelectItem>

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
            <div className='py-4 flex justify-center items-center'>
              <Button
                type='submit'
                className='flex items-center gap-1 border-2 px-4 rounded'
              >
                {thirdform.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                <>Generate Bank Statement</>
              </Button>
            </div>
          </form>
        </Form> */}
        {/* <Form {...fourthForm}>
          <form
            onSubmit={fourthForm.handleSubmit(onBonusSubmit)}
            className=' border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
          >
            <h2 className='bg-blue-50 font-semibold p-1 text-base text-center py-2'>
              Bonus and Leave Statement
            </h2>
            <div className='flex flex-col md:flex-row p-3 gap-4'>
              <FormField
                control={fourthForm.control}
                name='year'
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Year</FormLabel>
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
                            'Select Year'
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-w-80 max-h-72'>
                        {years?.map((option, index) => (
                          <SelectItem value={option.toString()} key={option}>
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
                control={fourthForm.control}
                name='department'
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e);
                        //setWorkOrderNumber(e)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Department' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-w-80 max-h-72'>
                        <SelectItem value='All Departments'>
                          All Departments
                        </SelectItem>

                        {departments?.map((option, index) => (
                          <SelectItem
                            value={option._id.toString()}
                            key={option._id.toString()}
                          >
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={fourthForm.control}
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
                        <SelectItem value='Default'>Default</SelectItem>

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

            <div className='py-4 gap-2 flex justify-center items-center'>
              <Button
                type='submit'
                value='BS'
                className='flex items-center gap-1 border-2 px-4 mb-2 rounded'
              >
                {fourthForm.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                <>Generate BONUS STATEMENT</>
              </Button>
              <Button
                type='submit'
                className='flex items-center gap-1 border-2 px-4 mb-2 rounded'
                value='LS'
              >
                {fourthForm.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                <>Generate LEAVE STATEMENT</>
              </Button>
            </div>
          </form>
        </Form> */}
      </div>
    </div>
  );
};

export default Page;

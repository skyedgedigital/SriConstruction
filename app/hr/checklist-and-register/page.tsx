'use client';
import { useState, useEffect } from 'react';
import { fetchAllAttendance } from '@/lib/actions/attendance/fetch';
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
import { years } from '@/constants';

const schema = z.object({
  year: z.string().trim().min(1, 'Required'),
  //    month:z.string().trim().min(1,"Required"),

  workOrder: z.string().trim().min(1, 'Required'),

  //new added field's
  bonusPercentage: z.string().trim().min(1, 'Required'),
});

const secSchema = z.object({
  employee: z.string().trim().min(1, 'Required'),
});

type SecondFormFields = z.infer<typeof secSchema>;
type FormFields = z.infer<typeof schema>;
const Page = () => {
  const router = useRouter();
  const form = useForm<FormFields>({
    defaultValues: {
      year: '',
      workOrder: '',
      bonusPercentage: '8.33',
    },
    resolver: zodResolver(schema),
  });
  const [workOrderNumber, setWorkOrderNumber] = useState<any>(null);

  const secForm = useForm<SecondFormFields>({
    defaultValues: {
      employee: '',
    },
    resolver: zodResolver(secSchema),
  });

  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendance, setAttendance] = useState(null);

  const [employeeData, setEmployeeData] = useState(null);

  const [wagesData, setWagesData] = useState(null);

  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);

  const [checkboxStatus, setCheckboxStatus] = useState(false);

  const handleToggle = (e) => {
    const status = e.target.checked;
    setCheckboxStatus(status);
  };

  const onEmployeeSubmit: SubmitHandler<SecondFormFields> = async (
    data: SecondFormFields,
    event
  ) => {
    try {
      const query = {
        employee: data.employee,
        ...(checkboxStatus && { Retrenchment_benefit: '15' }),
      };

      const queryString = new URLSearchParams(query).toString();
      // @ts-ignore
      const action = event.nativeEvent.submitter.value; // get the button value

      if (action === 'normal_order') {
        window.open(
          `/hr/final-settlement/normal-finalsettlement?${queryString}`,
          '_blank'
        );
      } else {
        window.open(
          `/hr/final-settlement/reverse-finalsettlement?${queryString}`,
          '_blank'
        );
      }
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
      console.log(workOrderNumber);
      // console.log("yeich hai second form data", event)
      const filter = JSON.stringify({ _id: data.workOrder });
      const result = await WorkOrderHrAction.FETCH.fetchSingleWorkOrderHr(
        filter
      );
      const dat = JSON.parse(result.data);
      console.log('yera data', dat);
      const query = {
        year: data.year,
        wog: dat.workOrderNumber,
        wo: data.workOrder,
        bp: data.bonusPercentage,
      };
      const queryString = new URLSearchParams(query).toString();
      // @ts-ignore
      const action = event.nativeEvent.submitter.value;
      //
      if (action === 'BCL') {
        window.open(`/hr/bonus-checklist?${queryString}`, '_blank');
      } else if (action === 'BR') {
        window.open(`/hr/bonus-register?${queryString}`, '_blank');
      } else if (action === 'LR') {
        window.open(`/hr/leave-pay-register?${queryString}`, '_blank');
      } else if (action === 'FK') {
        window.open(`/hr/formk?${queryString}`, '_blank');
      } else window.open(`/hr/leave-checklist?${queryString}`, '_blank');
    } catch (error) {
      toast.error('Failed to fetch data, please try later');
      console.error('Internal Server Error:', error);
    }
  };
  useEffect(() => {
    const fn = async () => {
      try {
        console.log('wowoowowow');
        const response = await EmployeeDataAction.FETCH.fetchAllEmployeeData();

        console.log(response);
        if (response?.success) {
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

      const workOrderResp = await WorkOrderHrAction.FETCH.fetchAllValidWorkOrderHr();
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

  return (
    <div>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Checklist and Registers
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onYearSubmit)}
          className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
        >
          <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
            Bonus & Leave register/checklist form
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
              name='workOrder'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Work Order </FormLabel>
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
                      {allWorkOrderNumbers?.map((option, index) => (
                        <SelectItem value={option._id.toString()} key={index}>
                          {option.workOrderNumber}
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
              name='bonusPercentage'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Bonus Percentage</FormLabel>
                  <Input
                    type='number'
                    placeholder='Enter Bonus in %'
                    {...field}
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='p-4 gap-1 flex flex-col md:flex-row justify-center items-center'>
            <Button
              type='submit'
              value='BCL'
              className='flex items-center gap-1 border-2 px-4 rounded'
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Generate Bonus Checklist</>
            </Button>
            <Button
              type='submit'
              value='BR'
              className='flex items-center gap-1 border-2 px-4 rounded'
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Generate Bonus Register</>
            </Button>
            <Button
              type='submit'
              value='LCL'
              className='flex items-center gap-1 border-2 px-4 rounded'
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Generate Leave Checklist</>
            </Button>
            <Button
              type='submit'
              value='LR'
              className='flex items-center gap-1 border-2 px-4 rounded'
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Generate Leave Register</>
            </Button>
            <Button
              type='submit'
              value='FK'
              className='flex items-center gap-1 border-2 px-4 rounded'
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Generate Form K</>
            </Button>
          </div>
        </form>
      </Form>

      <div className='mt-8 flex flex-col '>
        <Form {...secForm}>
          <form
            onSubmit={secForm.handleSubmit(onEmployeeSubmit)}
            className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
          >
            <div className='flex flex-col md:flex-row p-3 gap-4'>
              <FormField
                control={secForm.control}
                name='employee'
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Select Employee</FormLabel>
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
                            'Select Employee'
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-w-80 max-h-72'>
                        {employees?.map((option, index) => (
                          <SelectItem
                            value={option._id.toString()}
                            key={option._id.toString()}
                          >
                            {option.name.toString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='py-4'>
                <label className='inline-flex items-center cursor-pointer gap-2'>
                  <input
                    type='checkbox'
                    className='sr-only peer'
                    checked={checkboxStatus}
                    onChange={handleToggle}
                  />
                  <span className='ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 mr-2'>
                    Retrenchment benefit :
                  </span>
                  <div
                    className={`relative w-11 h-6 bg-gray-200  dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full  after:content-[''] after:absolute after:top-[1px] after:start-[2px]  after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${
                      !checkboxStatus ? 'border-[0.5px] border-gray-600' : ''
                    }`}
                  ></div>
                </label>
              </div>
            </div>

            <div className='p-4 flex flex-col md:flex-row gap-1 justify-start items-center'>
              <Button
                type='submit'
                value='normal_order'
                className='flex items-center gap-1 border-2 px-4 rounded'
              >
                {form.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                <>Generate FINAL SETTLEMENT</>
              </Button>
              <Button
                type='submit'
                value='reverse_order'
                className='flex items-center gap-1 border-2 px-4 rounded'
              >
                {form.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                <>Generate REVERSE FINAL SETTLEMENT</>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Page;

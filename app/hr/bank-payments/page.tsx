'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import departmentHrAction from '@/lib/actions/HR/DepartmentHr/departmentHrAction';
import { monthsName, years, months } from '@/constants';

const thirdSchema = z.object({
  year: z.string().trim().min(1, 'Required'),
  month: z.string().trim().min(1, 'Required'),
  workOrder: z.string().trim().min(1, 'Required'),
  department: z.string().trim().min(1, 'Required'),
});

const fourthSchema = z.object({
  year: z.string().trim().min(1, 'Required'),
  workOrder: z.string().trim().min(1, 'Required'),
  department: z.string().trim().min(1, 'Required'),
  bonusPercentage: z.string().trim().min(1, 'Required'),
});

type ThirdFormFields = z.infer<typeof thirdSchema>;
type FourthFormFields = z.infer<typeof fourthSchema>;

const Page = () => {
  const [departments, setDepartments] = useState([]);
  const [allWorkOrderNumbers, setAllWorkOrderNumbers] = useState([]);
  const [workOrderNumber, setWorkOrderNumber] = useState<any>(null);


  const thirdform = useForm<ThirdFormFields>({
    defaultValues: {
      year: '',
      month: '',
      department: 'All Departments',
      workOrder: 'Default',
    },
    resolver: zodResolver(thirdSchema),
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

  const onBankSubmit = async (data: ThirdFormFields) => {
    try {
      const query = {
        year: data.year,
        month: data.month,
        dept: data.department,
        wo: data.workOrder,
      };
      const queryString = new URLSearchParams(query).toString();
      window.open(`/hr/bank-statement?${queryString}`, '_blank');
    } catch (error) {
      toast.error('Internal Server Error');
      console.error('Internal Server Error:', error);
    }
  };

  const onBonusSubmit = async (data: FourthFormFields, event: any) => {
    try {
      const query = {
        year: data.year,
        wo: data.workOrder,
        dep: data.department,
      };
      const queryString = new URLSearchParams(query).toString();
      const action = event.nativeEvent.submitter.value;
      if (action == 'BS')
        window.open(`/hr/bonus-statement?${queryString}`, '_blank');
      else 
        window.open(`/hr/leave-statement?${queryString}`, '_blank');
    } catch (error) {
      toast.error('Internal Server Error');
      console.error('Internal Server Error:', error);
    }
  };

  useEffect(() => {
    const fn = async () => {
      try {
        const response = await departmentHrAction.FETCH.fetchDepartmentHr();
        if (response.success) {
          setDepartments(JSON.parse(response.data));
        }
      } catch (err) {
        toast.error('Internal Server Error');
        console.error('Internal Server Error:', err);
      }
    };
    fn();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const workOrderResp = await WorkOrderHrAction.FETCH.fetchAllValidWorkOrderHr();
      if (workOrderResp.success) {
        setAllWorkOrderNumbers(JSON.parse(workOrderResp.data));
      } else {
        toast.error('Can not fetch work order numbers!');
      }
    };
    fetch();
  }, []);

  return (
    <div className='pr-2'>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Bank Payments
      </h1>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Form {...thirdform}>
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
        </Form>

        <Form {...fourthForm}>
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
        </Form>
      </div>
    </div>
  );
};

export default Page;

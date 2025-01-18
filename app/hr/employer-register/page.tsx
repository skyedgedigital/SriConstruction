'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import { months, monthsName, years } from '@/constants';

const Page = () => {
  const [workOrderNumber, setWorkOrderNumber] = useState<any>(null);
  const [workOrderName, setWorkOrderName] = useState<any>(null);
  const [allWorkOrderNumbers, setAllWorkOrderNumbers] = useState([]);

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
        console.log('yeraaaa wowowowwoncjd', workOrderNumbers);
      } else {
        toast.error('Can not fetch work order numbers!');
      }
    };
    fetch();
  }, []);

  const schema = z.object({
    year: z.string().trim().min(1, 'Required'),
    month: z.string().trim().min(1, 'Required'),
    workOrder: z.string().trim().min(1, 'Required'),
  });

  type FormFields = z.infer<typeof schema>;

  const form = useForm<FormFields>({
    defaultValues: {
      year: '',
      month: '',
      workOrder: '',
    },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    toast.success('Form submitted successfully!');
    window.open(
      `/hr/employer-register/employer-register?month=${data.month}&year=${data.year}&workOrder=${data.workOrder}&workOrderName=${workOrderName}`,
      '_blank'
    );
  };

  useEffect(() => {
    const name = allWorkOrderNumbers.find(
      (won) => won._id === workOrderNumber
    )?.workOrderNumber;
    if (name) {
      setWorkOrderName(name);
    }
  }, [workOrderNumber, allWorkOrderNumbers]);

  return (
    <div>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Compliance and Register
      </h1>
      <div className=' mt-8 w-full md:w-3/4 lg:w-1/2 mx-auto'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='p-2 mr-2 border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6'
          >
            <h2 className=' bg-primary-color-extreme/10 font-semibold py-1 text-base text-center'>
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
                      onValueChange={(e) => field.onChange(e)}
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
                        {years?.map((option) => (
                          <SelectItem value={option.toString()} key={option}>
                            {option}
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
                      onValueChange={(e) => field.onChange(e)}
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
                        {months?.map((option) => (
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
                name='workOrder'
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 w-1/3'>
                    <FormLabel>Work Order</FormLabel>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e);
                        setWorkOrderNumber(e);
                      }}
                      value={field.value}
                    >
                      <FormControl className='px-2 border border-gray-400'>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder='' />
                          ) : (
                            'Select Work Order No.'
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-w-80 max-h-72 '>
                        {allWorkOrderNumbers?.map((option, index) => (
                          <SelectItem
                            value={option._id.toString()}
                            key={option}
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
            <div className='py-4 flex flex-col md:flex-row justify-center items-center'>
              <Button
                type='submit'
                className='flex items-center gap-1 border-2 border-black px-4 mb-2 rounded bg-green-500 text-white'
              >
                {form.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                Show Compliance Register
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Page;

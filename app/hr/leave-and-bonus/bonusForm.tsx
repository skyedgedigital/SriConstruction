'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
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
import { Loader2 } from 'lucide-react';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import { years } from '@/constants';

const schema = z.object({
  year: z.string().trim().min(1, 'Required'),
  //    month:z.string().trim().min(1,"Required"),

  workOrder: z.string().trim().min(1, 'Required'),

  //new added field's
  bonusPercentage: z.string().trim().min(1, 'Required'),
});

type FormFields = z.infer<typeof schema>;
const BonusForm = ({ allWorkOrderNumbers }) => {
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
      } else {
        window.open(`/hr/bonus-register?${queryString}`, '_blank');
      }
    } catch (error) {
      toast.error('Failed to fetch data, please try later');
      console.error('Internal Server Error:', error);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onYearSubmit)}
          className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
        >
          <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
            Bonus Form
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
           
          </div>
        </form>
      </Form>
    </>
  );
};

export default BonusForm;

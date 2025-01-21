'use client';

import React, { useEffect, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { z, ZodTypeAny } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorkOrder } from '@/lib/actions/workOrder/create';
import { Button } from '../ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CircleX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { defaultErrorMap } from 'zod';
import toast from 'react-hot-toast';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdEdit, MdKeyboardArrowDown } from 'react-icons/md';
import { RxCross2, RxCrossCircled, RxPlusCircled } from 'react-icons/rx';
import workOrderAction from '@/lib/actions/workOrder/workOrderAction';
import itemAction from '@/lib/actions/item/itemAction';
import { IItem } from '@/interfaces/item.interface';
import { MultiSelect } from 'react-multi-select-component';

const unitsMap = new Map([
  ['hours', 'Hours'],
  ['days', 'Days'],
  ['shift', 'Shift'],
  ['months', 'Months'],
  ['ot', 'OverTime'],
]);

const options = [
  { label: 'Months', value: 'months' },
  { label: 'Days', value: 'days' },
  { label: 'Shift', value: 'shift' },
  { label: 'Hours', value: 'hours' },
  { label: 'OverTime', value: 'ot' },
];

const zodInputStringPipe = (zodPipe: ZodTypeAny) =>
  z
    .string()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .refine((value) => value === null || !isNaN(Number(value)), {
      message: 'Required',
    })
    .transform((value) => (value === null ? 0 : Number(value)))
    .pipe(zodPipe);
const positiveNumber = z.number({ required_error: 'required' }).positive();
const workOrderSchema = z.object({
  workOrderNumber: z.string().trim().min(1, 'Required'),
  workDescription: z.string().trim().min(1, 'Required'),
  workOrderValue: zodInputStringPipe(
    z.number().positive('Value must be greater than 0')
  ),
  workOrderValidity: z.coerce.date({
    errorMap: (issue, { defaultError }) => ({
      message: issue.code === 'invalid_date' ? 'Required' : defaultError,
    }),
  }),
  workOrderBalance: zodInputStringPipe(
    z.number().positive('Value must be greater than 0')
  ),
});

type FormFields = z.infer<typeof workOrderSchema>;

const EditWorkOrder = () => {
  const [unitOptions, setUnitOptions] = useState(options);
  const [newUnitInput, setNewUnitInput] = useState<string>('');
  const [addingNewUnitInput, setAddingNewUnitInput] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  const [workOrderNumber, setWorkOrderNumber] = useState('');

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  const [allWorkOrderNumbers, setAllWorkOrderNumbers] = useState<string[]>([]);

  const [updateItems, setUpdateItems] = useState<IItem[] | null>(null);

  const [selected, setSelected] = useState([]);

  const form = useForm<FormFields>({
    defaultValues: {
      workOrderNumber: '',
      workDescription: '',
      workOrderValue: undefined,
      workOrderValidity: undefined,
      workOrderBalance: undefined,
    },
    resolver: zodResolver(workOrderSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      const { workOrderNumber, ...updatedData } = data;

      var arrPassed = [];

      selected.map((ele) => {
        arrPassed.push(ele.value);
      });

      const obj = {
        ...updatedData,
        units: arrPassed,
      };

      const response = await workOrderAction.UPDATE.updateWorkOrder(
        workOrderNumber,
        obj
      );
      console.log(response);

      if (response.success) {
        toast.success(response.message);
        form.reset({
          workOrderNumber: '',
          workDescription: '',
          workOrderValue: '',
          workOrderValidity: undefined,
          workOrderBalance: '',
        });
        console.log('Work Order updated successfully:', response.data);
      } else {
        toast.error(response.message);

        console.error('Error updating work order:', response.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error('Internal Server Error:', error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const workOrderResp = await workOrderAction.FETCH.fetchAllWorkOrder();
      const success = workOrderResp.success;
      const error = workOrderResp.message;
      const data = JSON.parse(workOrderResp.data);

      if (success) {
        const workOrderNumbers = data
          ? data.map((workOrder) => workOrder.workOrderNumber)
          : [];
        console.log(workOrderNumbers);
        setAllWorkOrderNumbers(workOrderNumbers);
      } else {
        toast.error(
          error || 'can not fetch work order numbers!,Please try later'
        );
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetchWorkOrderData = async () => {
      const res = await workOrderAction.FETCH.fetchWorkOrderByNumber(
        workOrderNumber
      );
      if (res.success) {
        const workOrderDetails = await JSON.parse(JSON.stringify(res.data));
        setSelectedWorkOrder(workOrderDetails);

        // Set form values
        form.setValue(
          'workOrderBalance',
          workOrderDetails.workOrderBalance.toString()
        );
        form.setValue(
          'workOrderValue',
          workOrderDetails.workOrderValue.toString()
        );
        form.setValue('workDescription', workOrderDetails.workDescription);
        form.setValue('workOrderValidity', workOrderDetails.workOrderValidity);

        const unitsArray = workOrderDetails.units;
        let tmpArray = [];
        let newOptions = [...options]; // Start with default options

        // Process all units at once
        unitsArray.forEach((unit) => {
          const isExtraUnit = unitsMap.get(unit);
          if (!isExtraUnit) {
            // This is a custom unit
            tmpArray.push({
              label: unit,
              value: unit,
            });
            // Add to options if not already present
            if (!newOptions.some((opt) => opt.value === unit)) {
              newOptions.push({
                label: unit,
                value: unit,
              });
            }
          } else {
            // This is a default unit
            tmpArray.push({
              label: unitsMap.get(unit),
              value: unit,
            });
          }
        });

        // Update states once
        setUnitOptions(newOptions);
        setSelected(tmpArray);
      } else {
        toast.error(res.message || 'Unable to fetch work order details!');
      }
    };

    if (workOrderNumber) {
      fetchWorkOrderData();
    }
  }, [workOrderNumber]);

  console.log('UNIT OPTIONS', unitOptions);
  console.log('selected', selected);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
      >
        <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
          Edit Work Order Form
        </h2>
        <div className='px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          <FormField
            control={form.control}
            name='workOrderNumber'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Work Order</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                    setWorkOrderNumber(e);
                  }}
                  defaultValue={field.value}
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
                  <SelectContent>
                    {allWorkOrderNumbers?.map((option, index) => (
                      <SelectItem value={option} key={option}>
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
            name='workOrderValue'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Work Order Value</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder=''
                    {...field}
                    className=' bg-white '
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='workOrderBalance'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Work Order Balance</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder=''
                    {...field}
                    className=' bg-white '
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='workOrderValidity'
            render={({ field }) => (
              <FormItem className='flex flex-col pt-2 justify-center'>
                <FormLabel>Chalan Validity</FormLabel>
                {/* <FormControl> */}
                <Popover>
                  <PopoverTrigger asChild className=''>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='workDescription'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Work Description</FormLabel>
                <FormControl>
                  <Textarea {...field} className=' bg-white ' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex flex-col gap-1'>
            <div className='mt-2'>
              <h1>Select Unit of Measurements </h1>
              <MultiSelect
                options={unitOptions}
                value={selected}
                onChange={setSelected}
                labelledBy='Select'
              />
            </div>
            <div className='flex flex-col gap-3'>
              <div className='flex justify-end gap-1 items-center text-sm text-gray-500'>
                {!addingNewUnitInput && <p>need more unit?</p>}{' '}
                {addingNewUnitInput ? (
                  <span
                    // just to prevent another use state
                    onClick={() => setAddingNewUnitInput(false)}
                    className='bg-white text-blue-500 underline cursor-pointer'
                  >
                    cancel
                  </span>
                ) : (
                  <span
                    // just to prevent another use state
                    onClick={() => setAddingNewUnitInput(true)}
                    className='bg-white text-blue-500 underline cursor-pointer'
                  >
                    click to add
                  </span>
                )}
              </div>
              {addingNewUnitInput && (
                <div className='flex flex-col gap-1'>
                  <div className='flex justify-start items-center gap-1'>
                    <input
                      className='border-gray-300 border-[1px] p-2 rounded-md flex-grow'
                      type='text'
                      value={newUnitInput}
                      placeholder='new unit'
                      onChange={(e) => setNewUnitInput(e.currentTarget.value)}
                    />
                    <Button
                      onClick={() => {
                        const isUnitAlreadyExist = unitOptions.find(
                          (units) =>
                            units.label === newUnitInput ||
                            units.value === newUnitInput
                        );
                        if (isUnitAlreadyExist) {
                          return toast.error('Unit already in options');
                        }
                        setUnitOptions((prev) => [
                          ...prev,
                          { label: newUnitInput, value: newUnitInput },
                        ]);
                        setNewUnitInput('');
                        toast.success('new unit added');
                      }}
                      type='button'
                      className='h-full'
                    >
                      add unit
                    </Button>
                  </div>
                  <p className='text-xs text-gray-400 italic'>
                    Note: New unit will be added only for this work order
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='px-4 flex flex-col gap-3 sm:flex-row md:justify-end pb-4'>
          <Button type='submit' className=' bg-green-500 w-40 '>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditWorkOrder;

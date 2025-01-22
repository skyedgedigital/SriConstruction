'use client';

// import { WorkOrderItems, workOrderNumberForm } from '@/types';
import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
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
import { MultiSelect } from 'react-multi-select-component';

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
  workOrderNumber: z.string().trim().min(1, 'Required'), // Add validation for length or pattern if needed
  workDescription: z.string().trim().min(1, 'Required'),
  workOrderValue: zodInputStringPipe(
    z.number().positive('Value must be greater than 0')
  ),
  workOrderValidity: z.coerce.date({
    errorMap: (issue, { defaultError }) => ({
      message: issue.code === 'invalid_date' ? 'Required' : defaultError,
    }),
  }), // Add pattern validation for specific format if needed
  workOrderBalance: zodInputStringPipe(
    z.number().positive('Value must be greater than 0')
  ),
  items: z
    .array(
      z.object({
        itemName: z.string().trim().min(1, 'Required'),
        itemPrice: zodInputStringPipe(
          z.number().positive('Value must be greater than 0')
        ),
        hsnNo: z.string().trim().min(1, 'Required'), // Assuming hsnNo is a string
        itemNumber: zodInputStringPipe(
          z.number().positive('Value must be greater than 0')
        ), // Allow zero or positive integers
      })
    )
    .min(1, 'Atleast one item is required'),
  shiftStatus: z.enum(['true', 'false']),
});

type FormFields = z.infer<typeof workOrderSchema>;

const CreateWorkOrder = () => {
  const [unitOptions, setUnitOptions] = useState(options);
  const [newUnitInput, setNewUnitInput] = useState<string>('');
  const [addingNewUnitInput, setAddingNewUnitInput] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const form = useForm<FormFields>({
    defaultValues: {
      workOrderNumber: '', // Add validation for length or pattern if needed
      workDescription: '',
      workOrderValue: undefined,
      workOrderValidity: undefined, // Add pattern validation for specific format if needed
      workOrderBalance: undefined,
      shiftStatus: 'false',
      items: [],
    },
    resolver: zodResolver(workOrderSchema),
  });
  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: form.control,
  });
  const [selected, setSelected] = useState([]);

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      console.log(data.items);
      let selectedValues = [];
      selected.forEach((ele) => {
        selectedValues.push(ele.value);
      });
      const workOrderData = {
        workOrderNumber: data.workOrderNumber,
        workDescription: data.workDescription,
        workOrderValue: data.workOrderValue,
        workOrderValidity: data.workOrderValidity,
        workOrderBalance: data.workOrderBalance,
        units: selectedValues,
      };
      const items = data.items;

      const response = await createWorkOrder(workOrderData, items);
      console.log(response);

      if (response.success) {
        toast.success(response.message);
        form.reset({
          workOrderNumber: '', // Add validation for length or pattern if needed
          workDescription: '',
          workOrderValue: '',
          workOrderValidity: undefined, // Add pattern validation for specific format if needed
          workOrderBalance: '',
          items: [],
        });
        console.log('Work Order created successfully:', response.data);
      } else {
        toast.error(response.message);
        console.error('Error creating work order:', response.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error('Internal Server Error:', error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
      >
        <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
          Add Work Order Form
        </h2>
        <div className='p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          {' '}
          <FormField
            control={form.control}
            name='workOrderNumber'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Work Order Number</FormLabel>
                <FormControl>
                  <Input placeholder='' {...field} className=' bg-white ' />
                </FormControl>
                {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
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
                {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
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
                {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='workOrderValidity'
            render={({ field }) => (
              <FormItem className='flex flex-col pt-2 justify-center'>
                <FormLabel>Work Order Validity</FormLabel>
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
                {/* </FormControl> */}
                {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
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
                {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="shiftStatus"
            render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Is this Work Order Shift based?</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      {field.value ? <SelectValue placeholder="" /> : ""}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-w-80 max-h-72 ">
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}
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

        <h2 className='text-blue-800 font-bold px-4'>Fill Items</h2>
        {form.formState.errors.items && (
          <p className='text-red-500 italic text-xs'>
            {form.formState.errors.items.message}
          </p>
        )}
        {fields.map((field, index) => (
          <div className='px-4 w-full flex flex-col gap-2' key={field.id}>
            <h2 className='text-blue-800 font-semibold'>{`Item - ${
              index + 1
            }`}</h2>
            <div className='w-full  gap-2 flex flex-col md:flex-row '>
              <FormField
                control={form.control}
                name={`items.${index}.itemName`}
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder='' {...field} className=' bg-white ' />
                    </FormControl>
                    {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.hsnNo`}
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>HSN No.</FormLabel>
                    <FormControl>
                      <Input placeholder='' {...field} className=' bg-white ' />
                    </FormControl>
                    {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.itemPrice`}
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Item Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder=''
                        {...field}
                        className=' bg-white '
                      />
                    </FormControl>
                    {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.itemNumber`}
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Item Number</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder=''
                        {...field}
                        className=' bg-white '
                      />
                    </FormControl>
                    {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              {index > 0 && (
                <span className=' flex flex-col justify-between gap-1'>
                  <span></span>
                  <button
                    onClick={() => remove(index)}
                    className='text-xm w-fit bg-red-600 text-white font-semibold p-2 rounded  '
                  >
                    <CircleX />
                  </button>
                </span>
              )}
            </div>
          </div>
        ))}
        <div className=' px-4 flex flex-col gap-3 sm:flex-row md:justify-between py-4'>
          <Button
            className='w-40'
            onClick={(e) => {
              e.preventDefault();
              append({
                itemName: undefined,
                itemPrice: undefined,
                hsnNo: undefined,
                itemNumber: undefined,
              });
            }}
          >
            Add Item
          </Button>
          <Button type='submit' className=' bg-green-500 w-40 '>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateWorkOrder;

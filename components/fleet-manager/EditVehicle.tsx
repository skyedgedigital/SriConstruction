'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon, CircleX, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { SubmitHandler, useForm } from 'react-hook-form';
import { z, ZodTypeAny } from 'zod';
import { createVehicle } from '@/lib/actions/vehicle/create';
import toast from 'react-hot-toast';
import { MdEdit } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const zodInputStringPipe = (zodPipe: ZodTypeAny) =>
  z
    .string()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .refine((value) => value === null || !isNaN(Number(value)), {
      message: 'Not a Number',
    })
    .transform((value) => (value === null ? 0 : Number(value)))
    .pipe(zodPipe);

const schema = z.object({
  vehicleNumber: z.string().trim().min(1, 'Required'), // Make name required with minimum length
  vehicleType: z.string().optional(),
  location: z.string().optional(),
  vendor: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insuranceExpiryDate: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional()
    .nullable(),
  gatePassNumber: z.string().optional(),
  gatePassExpiry: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional()
    .nullable(),
  tax: z.string().optional(),
  taxExpiryDate: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional()
    .nullable(),
  fitness: z.string().optional(),
  fitnessExpiry: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional()
    .nullable(),
  loadTest: z.string().optional(),
  loadTestExpiry: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional()
    .nullable(),
  safety: z.string().optional(),
  safetyExpiryDate: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional()
    .nullable(),
  puc: z.string().optional(),
  pucExpiryDate: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional()
    .nullable(),
  fuelType: z.enum(['Diesel', 'Petrol']),
  // fuelCost: zodInputStringPipe(
  //   z.number().nonnegative('Price must be non-negative')
  // ),
  // In the schema definition
  emi: z.coerce
    .number()
    .nonnegative('EMI cannot be negative.')
    .default(0)
    .optional(),
  emiStatus: z.enum(['Open', 'Close']),
});

type FormFields = z.infer<typeof schema>;

const EditVehicle: React.FC<{}> = () => {
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [fetched, setFetched] = useState<boolean>(false);
  const [allData, setAllData] = useState([]);

  const [allVehicleNumbers, setAllVehicleNumbers] = useState<string[]>([]);
  const [selectedVehicleNumber, setSelectedVehicleNumber] = useState('');

  const [editNotAllowed, setEditNotAllowed] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormFields>({
    defaultValues: {
      vehicleNumber: '',
      vehicleType: '',
      location: '',
      vendor: '',
      insuranceNumber: '',
      insuranceExpiryDate: undefined,
      gatePassNumber: '',
      gatePassExpiry: undefined,
      tax: '',
      taxExpiryDate: undefined,
      fitness: '',
      fitnessExpiry: undefined,
      loadTest: '',
      loadTestExpiry: undefined,
      safety: '',
      safetyExpiryDate: undefined,
      puc: '',
      pucExpiryDate: undefined,
      fuelType: 'Diesel',
      // fuelCost: '',
      emi: 0,
      emiStatus: 'Close',
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetch = async () => {
      const { data, success, message } =
        await vehicleAction.FETCH.fetchAllVehicles();

      const vehicles = await JSON.parse(data);
      if (success) {
        const vehicleNumbers = vehicles.map((vehicle) => vehicle.vehicleNumber);
        console.log(vehicleNumbers);
        setAllVehicleNumbers(vehicleNumbers);
      } else {
        toast.error(
          message || 'can not fetch vehicle numbers!, Please try later'
        );
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetchVehicleData = async () => {
      const res = await vehicleAction.FETCH.fetchVehicleByVehicleNumber(
        selectedVehicleNumber
      );
      if (res.success) {
        const vehicleDetails = await JSON.parse(JSON.stringify(res.data));
        console.log(vehicleDetails);
        //  setSelectedChalan(chalanDetails)
        // form.setValue("gatePassExpiry", vehicleDetails?.gatePassExpiry);
        // form.setValue("safetyExpiryDate", vehicleDetails?.safetyExpiryDate);
        form.setValue('location', vehicleDetails?.location);
        form.setValue('vehicleType', vehicleDetails?.vehicleType);
        form.setValue('vendor', vehicleDetails?.vendor);
        form.setValue('insuranceNumber', vehicleDetails?.insuranceNumber);
        form.setValue(
          'insuranceExpiryDate',
          vehicleDetails?.insuranceExpiryDate
        );
        form.setValue('gatePassNumber', vehicleDetails?.gatePassNumber);
        form.setValue('gatePassExpiry', vehicleDetails?.gatePassExpiry);
        form.setValue('tax', vehicleDetails?.tax);
        form.setValue('taxExpiryDate', vehicleDetails?.taxExpiryDate);
        form.setValue('fitness', vehicleDetails?.fitness);
        form.setValue('fitnessExpiry', vehicleDetails?.fitnessExpiry);
        form.setValue('loadTest', vehicleDetails?.loadTest);
        form.setValue('loadTestExpiry', vehicleDetails?.loadTestExpiry);
        form.setValue('safety', vehicleDetails?.safety);
        form.setValue('safetyExpiryDate', vehicleDetails?.safetyExpiryDate);
        form.setValue('puc', vehicleDetails?.puc);
        form.setValue('pucExpiryDate', vehicleDetails?.pucExpiryDate);
        form.setValue('fuelType', vehicleDetails?.fuelType);
        // form.setValue('fuelCost', (vehicleDetails?.fuelCost).toString());
        form.setValue('emi', vehicleDetails?.emi);
        form.setValue('emiStatus', vehicleDetails?.emiStatus);

        //  form.setValue('commentByFleetManager', chalanDetails.commentByFleetManager)
        //  form.setValue('commentByDriver', chalanDetails.commentByDriver)
        //  form.setValue('workDescription', chalanDetails.workDescription)

        //  form.setValue('workOrder', chalanDetails.workOrder.workOrderNumber)
        //  form.setValue('department', chalanDetails.department.departmentName)
        //  setPrefilledDepartment({
        //   department: chalanDetails.department.departmentName,
        //   isPrefilled: true,
        // });
        // setPrefilledWorkOrder({
        //   workOrder: chalanDetails.workOrder.workOrderNumber,
        //   isPrefilled: true,
        // });

        //  form.setValue('date', chalanDetails.date)
        //  form.setValue('location', chalanDetails.location)
        //  form.setValue('status', chalanDetails.status)

        // console.log(chalanDetails)
      }
      if (!res.success) {
        return toast.error(res.message || 'Unable to fetch Vehicle details!');
      }
    };
    if (selectedVehicleNumber != '') fetchVehicleData();
  }, [selectedVehicleNumber]);

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      console.log('SUBMITTED DATA', data);

      const { vehicleNumber, ...updatedData } = data;

      const response = await vehicleAction.UPDATE.updateVehicleFields(
        vehicleNumber,
        updatedData
      );
      console.log(response);

      if (response.success) {
        toast.success('Vehicle updated successfully');
        form.reset({
          vehicleNumber: '',
          vehicleType: '',
          location: '',
          vendor: '',
          insuranceNumber: '',
          insuranceExpiryDate: undefined,
          gatePassNumber: '',
          gatePassExpiry: undefined,
          tax: '',
          taxExpiryDate: undefined,
          fitness: '',
          fitnessExpiry: undefined,
          loadTest: '',
          loadTestExpiry: undefined,
          safety: '',
          safetyExpiryDate: undefined,
          puc: '',
          pucExpiryDate: undefined,
          fuelType: 'Diesel',
          // fuelCost: '',
          emi: 0,
          emiStatus: 'Close',
        });
        console.log('Vehicle updated successfully:');
        // Handle successful creation (e.g., display success message, redirect)
      } else {
        toast.error(
          response.message || 'Failed to save vehicle data, Please try later'
        );
        console.error('Error updating vehicle:', response.message);
        // Handle errors (e.g., display error message)
      }
    } catch (error) {
      toast.error('Internal Server Error');
      console.error('Internal Server Error:', error);
      // Handle internal server errors (e.g., display generic error message)
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
      >
        <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
          Edit Vehicle Information Form
        </h2>
        <div className='px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
          <FormField
            control={form.control}
            name='vehicleNumber'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Vehicle</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                    setSelectedVehicleNumber(e);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      {field.value ? (
                        <SelectValue placeholder='' />
                      ) : (
                        'Select Vehicle No.'
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allVehicleNumbers?.map((option, index) => (
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
            name='vehicleType'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Vehicle Type</FormLabel>
                <FormControl>
                  {field.value ? (
                    <Input placeholder='' {...field} className=' bg-white ' />
                  ) : (
                    <Input
                      placeholder='Enter Vehicle Type'
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
            control={form.control}
            name='fuelType'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Fuel Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      {field.value ? (
                        <SelectValue placeholder='' />
                      ) : (
                        'Select Fuel Type'
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='Diesel'>Diesel</SelectItem>
                    <SelectItem value='Petrol'>Petrol</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />{' '}
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='vendor'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Vendor</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input placeholder='' {...field} className=' bg-white ' />
                    ) : (
                      <Input
                        placeholder='Enter Vendor'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />{' '}
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('vendor', '');
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input placeholder='' {...field} className=' bg-white ' />
                    ) : (
                      <Input
                        placeholder='Enter Location'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('location', '');
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='insuranceNumber'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Insurance Number</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input placeholder='' {...field} className=' bg-white ' />
                    ) : (
                      <Input
                        placeholder='Enter Insurance Number'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('insuranceNumber', '');
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='insuranceExpiryDate'
              render={({ field }) => (
                <FormItem className='flex flex-col pt-2 justify-center'>
                  <FormLabel>Insurance Expiry</FormLabel>
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
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('insuranceExpiryDate', null);
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='gatePassNumber'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Gate Pass Number</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input placeholder='' {...field} className=' bg-white ' />
                    ) : (
                      <Input
                        placeholder='Enter Gate Pass Number'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('gatePassNumber', '');
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='gatePassExpiry'
              render={({ field }) => (
                <FormItem className='flex flex-col pt-2 justify-center'>
                  <FormLabel>Gate Pass Expiry</FormLabel>
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
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('gatePassExpiry', null);
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='tax'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Tax Number</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input placeholder='' {...field} className=' bg-white ' />
                    ) : (
                      <Input
                        placeholder='Enter Tax Number'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('tax', '');
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='taxExpiryDate'
              render={({ field }) => (
                <FormItem className='flex flex-col pt-2 justify-center'>
                  <FormLabel>Tax Expiry</FormLabel>
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
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('taxExpiryDate', null);
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='fitness'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Fitness Number</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input placeholder='' {...field} className=' bg-white ' />
                    ) : (
                      <Input
                        placeholder='Enter Fitness Number'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('fitness', '');
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='fitnessExpiry'
              render={({ field }) => (
                <FormItem className='flex flex-col pt-2 justify-center'>
                  <FormLabel>Fitness Expiry</FormLabel>
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
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('fitnessExpiry', null);
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='loadTest'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Load Test</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input placeholder='' {...field} className=' bg-white ' />
                    ) : (
                      <Input
                        placeholder='Enter Load Test Number'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('loadTest', '');
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='loadTestExpiry'
              render={({ field }) => (
                <FormItem className='flex flex-col pt-2 justify-center'>
                  <FormLabel>Load Test Expiry</FormLabel>
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
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('loadTestExpiry', null);
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='safety'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel> Safety Number</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input placeholder='' {...field} className=' bg-white ' />
                    ) : (
                      <Input
                        placeholder='Enter Safety Number'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('safety', '');
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='safetyExpiryDate'
              render={({ field }) => (
                <FormItem className='flex flex-col pt-2 justify-center'>
                  <FormLabel>Safety Expiry</FormLabel>
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
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('safetyExpiryDate', null);
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='puc'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>PUC</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input placeholder='' {...field} className=' bg-white ' />
                    ) : (
                      <Input
                        placeholder='Enter PUC'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('puc', '');
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='pucExpiryDate'
              render={({ field }) => (
                <FormItem className='flex flex-col pt-2 justify-center'>
                  <FormLabel>PUC Expiry</FormLabel>
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
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('pucExpiryDate', null);
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
          <FormField
            control={form.control}
            name='emiStatus'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Emi Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      {field.value ? (
                        <SelectValue placeholder='' />
                      ) : (
                        'Select Emi Status'
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='Open'>Open</SelectItem>
                    <SelectItem value='Close'>Close</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-center items-end gap-1'>
            <FormField
              control={form.control}
              name='emi'
              render={({ field }) => (
                <FormItem className='flex-col flex gap-1 flex-1'>
                  <FormLabel>EMI</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Enter EMI'
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className='bg-white'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='border-[1px] border-red-200 bg-white'
              onClick={(e) => {
                e.preventDefault();
                form.setValue('emi', 0);
              }}
            >
              <Trash size={20} className='text-red-500' />
            </Button>
          </div>
        </div>

        <div className='p-4 flex flex-col md:flex-row gap-1 justify-end items-center'>
          {' '}
          <Button type='submit' className=' bg-green-500 w-40 my-4  '>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditVehicle;

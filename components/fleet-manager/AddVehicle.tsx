'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon, CircleX } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';

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
    .optional(),
  gatePassNumber: z.string().optional(),
  gatePassExpiry: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional(),
  tax: z.string().optional(),
  taxExpiryDate: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional(),
  fitness: z.string().optional(),
  fitnessExpiry: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional(),
  loadTest: z.string().optional(),
  loadTestExpiry: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional(),
  safety: z.string().optional(),
  safetyExpiryDate: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional(),
  puc: z.string().optional(),
  pucExpiryDate: z.coerce
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === 'invalid_date' ? 'Required' : defaultError,
      }),
    })
    .optional(),
  fuelType: z.enum(['Diesel', 'Petrol']),
  // fuelCost: zodInputStringPipe(
  //   z.number().nonnegative('Price must be non-negative')
  // ),
});

type FormFields = z.infer<typeof schema>;

const AddVehicle: React.FC<{}> = () => {
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [fetched, setFetched] = useState<boolean>(false);
  //   const [allData, setAllData] = useState<RegisterFormValues[]>([]);
  const [allData, setAllData] = useState([]);

  const [editNotAllowed, setEditNotAllowed] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  //   const {
  //     register,
  //     control,
  //     handleSubmit,
  // setError,
  //     setValue,
  //     reset,
  // formState: { errors, isSubmitting },
  //   } = useForm<FormFields>({
  //     defaultValues: {
  //       vehicleNumber: '',

  //     },
  // resolver: zodResolver(schema),

  //   });

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
    },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      console.log(data);
      // Call your createEmployee function with formData and employeeRole from props

      const response = await vehicleAction.CREATE.createVehicle(data);
      console.log(response);

      if (response.success) {
        toast.success('Vehicle created successfully');
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
        });
        console.log('Vehicle created successfully:');
        // Handle successful creation (e.g., display success message, redirect)
      } else {
        toast.error(response.message);
        console.error('Error creating vehicle:', response.message);
        // Handle errors (e.g., display error message)
      }
    } catch (error) {
      toast.error(error);
      console.error('Internal Server Error:', error);
      // Handle internal server errors (e.g., display generic error message)
    }
  };

  return (
    //     <div className='w-full flex flex-col mb-6'>

    //       <div className='w-full p-1 rounded-t-xl bottom-full right-0  border-l-2 border-l-primary-color bg-primary-color/5 ml-[2px] flex flex-col justify-between gap-4'>
    //           <h2 className='text-blue-800 font-semibold'>Add Vehicle</h2>

    //         <form
    //           noValidate
    //           onSubmit={handleSubmit(onSubmit)}
    //           className='border-white border-2 p-2  bg-slate-300 text-black text-sm font-medium rounded rounded-tr-none relative '
    //         >
    //           <div className='w-full  gap-3 mt-5 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5'>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='vehicleNumber'>
    //                   Vehicle Number:
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 type='text'
    //                 id='vehicleNumber'
    //                 placeholder=''
    //                 {...register('vehicleNumber', {
    //                   required: 'required',
    //                 })}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-black-800 cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded `}
    //               />
    //                <p className=' text-red-500 '>
    //                   {errors.vehicleNumber?.message}
    //                 </p>
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='vehicleType'>
    //                 Vehicle Type
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='text'
    //                 id='vehicleType'
    //                 {...register('vehicleType')}
    //               />
    //                    {errors.vehicleType && (
    //         <p className="text-red-500">{`${errors.vehicleType.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='location'>
    //                 Location
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='text'
    //                 id='location'
    //                 {...register('location')}
    //               />
    //                    {errors.location && (
    //         <p className="text-red-500">{`${errors.location.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='vendor'>
    //                 Vendor
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='text'
    //                 id='vendor'
    //                 {...register('vendor')}
    //               />
    //                    {errors.vendor && (
    //         <p className="text-red-500">{`${errors.vendor.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='insuranceNumber'>
    //                 Insurance Number
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='text'
    //                 id='insuranceNumber'
    //                 {...register('insuranceNumber')}
    //               />
    //                    {errors.insuranceNumber && (
    //         <p className="text-red-500">{`${errors.insuranceNumber.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='insuranceExpiryDate'>
    //                 Insurance Expiry Date
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='date'
    //                 id='insuranceExpiryDate'
    //                 {...register('insuranceExpiryDate')}
    //               />
    //                    {errors.insuranceExpiryDate && (
    //         <p className="text-red-500">{`${errors.insuranceExpiryDate.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='gatePassNumber'>
    //                 gatePassNumber
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='string'
    //                 id='gatePassNumber'
    //                 {...register('gatePassNumber')}
    //               />
    //                    {errors.gatePassNumber && (
    //         <p className="text-red-500">{`${errors.gatePassNumber.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='gatePassExpiry'>
    //                 Gate Pass Expiry
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='date'
    //                 id='gatePassExpiry'
    //                 {...register('gatePassExpiry')}
    //               />
    //                    {errors.gatePassExpiry && (
    //         <p className="text-red-500">{`${errors.gatePassExpiry.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='tax'>
    //                 Tax
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='text'
    //                 id='tax'
    //                 {...register('tax', {
    //                   required: 'required',
    //                 })}
    //               />
    //                    {errors.tax && (
    //         <p className="text-red-500">{`${errors.tax.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='taxExpiryDate'>
    //                 Tax Expiry Date
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='date'
    //                 id='taxExpiryDate'
    //                 {...register('taxExpiryDate')}
    //               />
    //                    {errors.taxExpiryDate && (
    //         <p className="text-red-500">{`${errors.taxExpiryDate.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='fitness'>
    //                 fitness
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='text'
    //                 id='fitness'
    //                 {...register('fitness', {
    //                   required: 'required',
    //                 })}
    //               />
    //                    {errors.fitness && (
    //         <p className="text-red-500">{`${errors.fitness.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='fitnessExpiry'>
    //                 Fitness Expiry Date
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='date'
    //                 id='fitnessExpiry'
    //                 {...register('fitnessExpiry')}
    //               />
    //                    {errors.fitnessExpiry && (
    //         <p className="text-red-500">{`${errors.fitnessExpiry.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='loadTest'>
    //                 loadTest
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='text'
    //                 id='loadTest'
    //                 {...register('loadTest', {
    //                   required: 'required',
    //                 })}
    //               />
    //                    {errors.loadTest && (
    //         <p className="text-red-500">{`${errors.loadTest.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='loadTestExpiry'>
    //                 Load Test Expiry Date
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='date'
    //                 id='loadTestExpiry'
    //                 {...register('loadTestExpiry')}
    //               />
    //                    {errors.loadTestExpiry && (
    //         <p className="text-red-500">{`${errors.loadTestExpiry.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='safety'>
    //                 safety
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='text'
    //                 id='safety'
    //                 {...register('safety', {
    //                   required: 'required',
    //                 })}
    //               />
    //                    {errors.safety && (
    //         <p className="text-red-500">{`${errors.safety.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='safetyExpiryDate'>
    //                 Safety Expiry Date
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='date'
    //                 id='safetyExpiryDate'
    //                 {...register('safetyExpiryDate')}
    //               />
    //                    {errors.safetyExpiryDate && (
    //         <p className="text-red-500">{`${errors.safetyExpiryDate.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='puc'>
    //                 puc
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='text'
    //                 id='puc'
    //                 {...register('puc', {
    //                   required: 'required',
    //                 })}
    //               />
    //                    {errors.puc && (
    //         <p className="text-red-500">{`${errors.puc.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='pucExpiryDate'>
    //                 Puc Expiry Date
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='date'
    //                 id='pucExpiryDate'
    //                 {...register('pucExpiryDate')}
    //               />
    //                    {errors.pucExpiryDate && (
    //         <p className="text-red-500">{`${errors.pucExpiryDate.message}`}</p>
    //       )}
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='fuelType'>
    //                 fuelType
    //                 </label>

    //               </span>
    //               <select
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 id='fuelType'
    //                 {...register('fuelType', {
    //                   required: 'required',
    //                 })}
    //               >
    //                   <option value='diesel'>Diesel</option>
    //                 <option value='petrol'>Petrol</option>
    //                 </select>
    //                    {errors.fuelType && (
    //         <p className="text-red-500">{`${errors.fuelType.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='fuelCost'>
    //                 fuelCost
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-white cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded`}
    //                 type='number'
    //                 id='fuelCost'
    //                 {...register('fuelCost', {
    //                   required: 'required',
    //                 })}
    //               />
    //                    {errors.fuelCost && (
    //         <p className="text-red-500">{`${errors.fuelCost.message}`}</p>
    //       )}
    //             </span>

    //           </div>
    //           <div className='flex mt-4 gap-3'>
    //             {!editNotAllowed && (
    //               <button
    //                 type='submit'
    //                 className='flex items-center gap-1 border-2 px-4 rounded bg-gray-800 text-white'
    //                 // onClick={handleSubmit(onSubmit)}
    //               >
    //                 {saving && <AiOutlineLoading3Quarters />}
    //                 <>Save</>
    //               </button>
    //             )}
    //             {!editNotAllowed ? (
    //               <button
    //                 className='flex items-center justify-around gap-1 border-red-500 border-2 px-2 rounded hover:text-white text-red-500 font-semibold hover:bg-red-500'
    //                 onClick={(e) =>{
    //                   e.preventDefault();
    //                   setEditNotAllowed(true)}}
    //               >
    //                 <RxCrossCircled />
    //                 <p>Cancel</p>
    //               </button>
    //             ) : (
    //               <button
    //                 type='button'
    //                 className='flex items-center justify-around gap-1 bg-gray-800 border-2 px-2 rounded text-white'
    //                 onClick={(e) =>{
    //                   e.preventDefault();
    //                   setEditNotAllowed(false)}}
    //               >
    //                 <MdEdit />
    //                 <p>Edit</p>
    //               </button>
    //             )}
    //           </div>
    //           {errors.root && <div className="text-red-500">{errors.root.message}</div>}

    //         </form>
    //           </div>
    //            {/* </div> */}

    //         <button
    //                 // onClick={fetchFleetManagersData}
    //                 disabled={loadingData}
    //                 className='bg-yellow-400 disabled:bg-blue-500 text-white px-4 py-1 rounded  text-sm font-bold flex items-center justify-center gap-1'
    //               >
    //                 {loadingData && (
    //                   <AiOutlineLoading3Quarters className='text-white animate-spin' />
    //                 )}
    //                 <>View All Vehicles</>
    //               </button>

    //       {fetched && (
    //         <div className='border-2 p-1 ml-[2px] flex flex-col gap-1'>
    //           <h3 className='text-primary-color'>Vehicles</h3>
    //           {allData?.length > 0 && (
    //             <></>
    //           )}

    //           {allData?.length === 0 && (
    // <></>          )}
    //         </div>
    //       )}
    //     </div>

    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
      >
        <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
          Add Vehicle Form
        </h2>
        <div className='px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
          <FormField
            control={form.control}
            name='vehicleNumber'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Vehicle Number</FormLabel>
                <FormControl>
                  {field.value ? (
                    <Input
                      placeholder='Ente'
                      {...field}
                      className=' bg-white '
                    />
                  ) : (
                    <Input
                      placeholder='Enter vehicle no.'
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
          />

          {/* <FormField
            control={form.control}
            name='fuelCost'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Fuel Consumption Per Hour</FormLabel>
                <FormControl>
                  {field.value ? (
                    <Input
                      type='number'
                      placeholder=''
                      {...field}
                      className=' bg-white '
                    />
                  ) : (
                    <Input
                      placeholder='Enter Fuel Consumption'
                      {...field}
                      className=' bg-white '
                    />
                  )}
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          /> */}

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
          />
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
          <FormField
            control={form.control}
            name='insuranceExpiryDate'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
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
          <FormField
            control={form.control}
            name='gatePassExpiry'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
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
          <FormField
            control={form.control}
            name='taxExpiryDate'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
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
          <FormField
            control={form.control}
            name='fitnessExpiry'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
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
          <FormField
            control={form.control}
            name='loadTestExpiry'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
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

          <FormField
            control={form.control}
            name='safety'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Safety Number</FormLabel>
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
          <FormField
            control={form.control}
            name='safetyExpiryDate'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
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
          <FormField
            control={form.control}
            name='pucExpiryDate'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
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
        </div>

        <div className='p-4 flex flex-col md:flex-row gap-1 justify-end items-center'>
          <Button type='submit' className=' bg-green-500 w-40 my-4  '>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddVehicle;

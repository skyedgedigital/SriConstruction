'use client';

import React from 'react';
import { useState, useEffect } from 'react';
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
import { Button } from './ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { createEmployee } from '@/lib/actions/employee/create';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
type FormProps = {
  heading: string;
  role: string;
};

const schema = z.object({
  name: z.string().trim().min(1, 'Required'),
  phoneNo: z
    .string()
    .regex(/^\d+$/, { message: 'Invalid Phone Number' })
    .length(10, { message: 'Invalid Phone Number' })
    .refine((value) => /[6789]/.test(value[0]), {
      message: 'Invalid Phone Number',
    }),
  drivingLicenseNo: z.string().trim().min(1, 'Required'),
  gatePassNo: z.string().trim().min(1, 'Required'),
  safetyPassNo: z.string().trim().min(1, 'Required'),
  UAN: z
    .string()
    .regex(/^\d+$/, { message: 'Invalid UAN' })
    .length(12, { message: 'Invalid UAN' }),
  aadharNo: z
    .string()
    .regex(/^\d+$/, { message: 'Invalid Aadhar Number' })
    .length(12, { message: 'Invalid Aadhar Number' }),
  accountNo: z
    .string()
    // Only digits (0-9) allowed
    .regex(/^\d+$/, { message: 'Invalid Account Number' })
    // Length between 9 and 18 digits
    .min(9, 'Invalid Account Number')
    .max(18, 'Invalid Account Number'),
  IFSC: z
    .string()
    // Regular expression for IFSC format
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid IFSC code format' }),
});

type FormFields = z.infer<typeof schema>;

const EmployeeManagement: React.FC<FormProps> = ({ heading, role }) => {
  const form = useForm<FormFields>({
    defaultValues: {
      name: '',
      phoneNo: '',
      drivingLicenseNo: '',
      gatePassNo: '',
      safetyPassNo: '',
      UAN: '',
      aadharNo: '',
      accountNo: '',
      IFSC: '',
    },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      const bankDetails = {
        accountNo: Number(data.accountNo),
        IFSC: data.IFSC.toUpperCase(),
      };
      const employeeData = {
        name: data.name,
        phoneNo: Number(data.phoneNo),
        drivingLicenseNo: data.drivingLicenseNo,
        gatePassNo: data.gatePassNo,
        safetyPassNo: data.safetyPassNo,
        UAN: Number(data.UAN),
        aadharNo: Number(data.aadharNo),
        employeeRole: role, // Assuming employee role comes from the form
        bankDetails: bankDetails,
      };

      const response = await createEmployee(employeeData);
      console.log(response);

      if (response.success) {
        toast.success('Employee created successfully');
        console.log('Employee created successfully:', response.data);
        form.reset({
          name: '',
          phoneNo: '',
          drivingLicenseNo: '',
          gatePassNo: '',
          safetyPassNo: '',
          UAN: '',
          aadharNo: '',
          accountNo: '',
          IFSC: '',
        });
      } else {
        toast.error(response.message);
        console.error('Error creating employee:', response.message);
      }
    } catch (error) {
      console.error('Internal Server Error:', error);
    }
  };

  return (
    //     <div className='w-full flex flex-col mb-6 mt-14 '>
    //       {/* <h2 className='text-primary-color text-lg capitalize relative'>
    //         {heading}
    //       </h2> */}

    //       {/* <div className='w-full flex flex-col gap-1 '> */}
    //       <div className='w-full p-1 rounded-t-xl bottom-full right-0  border-l-2 border-l-primary-color bg-primary-color/5 ml-[2px] flex flex-col justify-between gap-4'>
    //           <h2 className='text-blue-800 font-semibold'>{`Add ${heading}:`}</h2>

    //         <form
    //           noValidate
    //           onSubmit={handleSubmit(onSubmit)}
    //           className='border-white border-2 p-2  bg-slate-300 text-black text-sm font-medium rounded rounded-tr-none relative '
    //         >
    //           {/* <h2 className='text-lg '>Account Information:</h2> */}
    //           <div className='w-full  gap-3 mt-5 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5'>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='name'>
    //                   Name:
    //                 </label>

    //               </span>
    //               <input
    //                 disabled={editNotAllowed}
    //                 type='text'
    //                 id='name'
    //                 placeholder='hello'
    //                 {...register('name', {
    //                   required:'Required',
    //                 })}
    //                 className={`${
    //                   editNotAllowed
    //                     ? 'text-black-800 cursor-not-allowed'
    //                     : 'text-black'
    //                 } p-1 rounded `}
    //               />
    //                <p className=' text-red-500 '>
    //                   {errors.name?.message}
    //                 </p>
    //             </span>

    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='phoneNo'>
    //                   Phone number
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
    //                 id='phoneNo'
    //                 {...register('phoneNo', {
    //                   required:'Required',
    //                 })}
    //               />
    //                    {errors.phoneNo && (
    //         <p className="text-red-500">{`${errors.phoneNo.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='drivingLicenseNo'>
    //                   Driving License Number
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
    //                 id='drivingLicenseNo'
    //                 {...register('drivingLicenseNo', {
    //                   required:'Required',
    //                 })}
    //               />
    //                    {errors.drivingLicenseNo && (
    //         <p className="text-red-500">{`${errors.drivingLicenseNo.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='gatePassNo'>
    //                 gatePassNo
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
    //                 id='gatePassNo'
    //                 {...register('gatePassNo', {
    //                   required:'Required',
    //                 })}
    //               />
    //                    {errors.gatePassNo && (
    //         <p className="text-red-500">{`${errors.gatePassNo.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='safetyPassNo'>
    //                 safetyPassNo
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
    //                 id='safetyPassNo'
    //                 {...register('safetyPassNo', {
    //                   required:'Required',
    //                 })}
    //               />
    //                    {errors.safetyPassNo && (
    //         <p className="text-red-500">{`${errors.safetyPassNo.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='UAN'>
    //                 UAN
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
    //                 id='UAN'
    //                 {...register('UAN', {
    //                   required:'Required',
    //                 })}
    //               />
    //                    {errors.UAN && (
    //         <p className="text-red-500">{`${errors.UAN.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='aadharNo'>
    //                 aadharNo
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
    //                 id='aadharNo'
    //                 {...register('aadharNo', {
    //                   required:'Required',
    //                 })}
    //               />
    //                    {errors.aadharNo && (
    //         <p className="text-red-500">{`${errors.aadharNo.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='accountNo'>
    //                 accountNo
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
    //                 id='accountNo'
    //                 {...register('accountNo', {
    //                   required:'Required',
    //                 })}
    //               />
    //                    {errors.accountNo && (
    //         <p className="text-red-500">{`${errors.accountNo.message}`}</p>
    //       )}
    //             </span>
    //             <span className='basis-1/2 flex flex-col'>
    //               <span className='flex justify-between items-baseline'>
    //                 <label className='' htmlFor='IFSC'>
    //                 IFSC
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
    //                 id='IFSC'
    //                 {...register('IFSC', {
    //                   required:'Required',
    //                 })}
    //               />
    //                    {errors.IFSC && (
    //         <p className="text-red-500">{`${errors.IFSC.message}`}</p>
    //       )}
    //             </span>
    //           </div>
    //           <div className='flex mt-4 gap-3'>
    //             {!editNotAllowed && (
    //               <button
    //                 type='submit'
    //                 disabled={isSubmitting}
    //                 className='flex items-center gap-1 border-2 px-4 rounded bg-gray-800 text-white'
    //                 // onClick={handleSubmit(onSubmit)}
    //               >
    //  {/* {isSubmitting && <span className="spinner-border spinner-border-sm mr-1 "></span>} */}
    //                 {isSubmitting &&  <Loader2 className="h-4 w-4 animate-spin" />}
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

    //         <button

    //                 disabled={loadingData}
    //                 className='bg-yellow-400 disabled:bg-blue-500 text-white top-0 py-1 rounded  text-sm font-bold flex items-center justify-center gap-1 w-[150px]  '
    //               >
    //                 {loadingData && (
    //                   <AiOutlineLoading3Quarters className='text-white animate-spin' />
    //                 )}
    //                 <>{viewButtonText}</>
    //               </button>

    //       {fetched && (
    //         <div className='border-2 p-1 ml-[2px] flex flex-col gap-1'>
    //           <h3 className='text-primary-color'>{`${heading}s`}</h3>
    //           {allData?.length > 0 && (
    //             <></>
    //           )}

    //           {allData?.length === 0 && (
    // <></>          )}
    //         </div>
    //       )}
    //     </div>
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
        >
          <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
            {heading}
          </h2>
          <div className='px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        placeholder='Ente'
                        {...field}
                        className=' bg-white '
                      />
                    ) : (
                      <Input
                        placeholder='Enter your name'
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
              name='phoneNo'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        placeholder=''
                        {...field}
                        className=' bg-white '
                        type='number'
                      />
                    ) : (
                      <Input
                        placeholder='Enter phone no.'
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
              name='drivingLicenseNo'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>D.L. Number</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        placeholder='Ente'
                        {...field}
                        className=' bg-white '
                      />
                    ) : (
                      <Input
                        placeholder='Enter driving license no.'
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
              name='gatePassNo'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Gate Pass</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        placeholder='Ente'
                        {...field}
                        className=' bg-white '
                      />
                    ) : (
                      <Input
                        placeholder='Enter gate pass no.'
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
              name='safetyPassNo'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Safety Pass</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        placeholder='Ente'
                        {...field}
                        className=' bg-white '
                      />
                    ) : (
                      <Input
                        placeholder='Enter Safety Pass Number'
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
              name='UAN'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>UAN</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        placeholder=''
                        {...field}
                        className=' bg-white '
                        type='number'
                      />
                    ) : (
                      <Input
                        placeholder='Enter UAN'
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
              name='aadharNo'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Aadhar</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        placeholder=''
                        {...field}
                        className=' bg-white '
                        type='number'
                      />
                    ) : (
                      <Input
                        placeholder='Enter Aadhar no.'
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
              name='accountNo'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        placeholder=''
                        {...field}
                        className=' bg-white '
                        type='number'
                      />
                    ) : (
                      <Input
                        placeholder='Enter Account No.'
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
              name='IFSC'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>IFSC</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input placeholder='' {...field} className=' bg-white ' />
                    ) : (
                      <Input
                        placeholder='Enter IFSC'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='p-4 flex flex-col md:flex-row gap-1 justify-center items-center'>
            <Button type='submit' className=' bg-green-500 w-40 '>
              {' '}
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Submit</>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EmployeeManagement;

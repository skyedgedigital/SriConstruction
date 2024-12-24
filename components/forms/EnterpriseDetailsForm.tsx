'use client';
// import {
//   getEnterpriseDetails,
//   saveEnterpriseDetails,
// } from '@/app/_utils/server_actions/enterpriseDetails';
// import { EnterpriseFormData } from '@/types';
import { Loader2 } from 'lucide-react';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { saveEnterpriseInfo } from '@/lib/actions/enterprise';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdEdit } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import { Textarea } from '../ui/textarea';
const schema = z.object({
  name: z.string().trim().min(1, 'Required'), // Make name required with minimum length
  pan: z.string().trim().min(1, 'Required'),
  gstin: z.string().trim().min(1, 'Required'),
  vendorCode: z.string().trim().min(1, 'Required'),
  address: z.string().trim().optional(),
  email: z.string().email('Invalid email address').optional(),
});

type FormFields = z.infer<typeof schema>;
const EnterpriseDetailsForm: React.FC<{}> = () => {
  const [editNotAllowed, setEditNotAllowed] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [ent, setEnt] = useState(null);

  const form = useForm<FormFields>({
    defaultValues: {
      name: ent?.name || '',
      gstin: ent?.gstin || '',
      pan: ent?.pan || '',
      vendorCode: ent?.vendorCode || '',
      address: ent?.address || '',
      email: ent?.email || '',
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fn = async () => {
      const resp = await fetchEnterpriseInfo();
      console.log('response we got ', resp);
      if (resp.data) {
        const inf = await JSON.parse(resp.data);
        setEnt(inf);
        console.log(ent);
      }
    };
    fn();
  }, []);
  useEffect(() => {
    const fn = async () => {
      form.setValue('gstin', ent.gstin);
      form.setValue('pan', ent.pan);
      form.setValue('name', ent.name);
      form.setValue('vendorCode', ent.vendorCode);
      form.setValue('address', ent.address);
      form.setValue('email', ent.email);
    };
    if (ent != null) fn();
  }, [ent]);

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      console.log(data);
      const filter = await JSON.stringify(data);
      const res = await saveEnterpriseInfo(filter);
      console.log(res);
      // const response = await departmentAction.CREATE.createDepartment(data.departmentName)
      // console.log(response)

      if (res.success) {
        toast.success(res.message);
        form.reset({
          name: data.name,
          pan: data.pan,
          gstin: data.gstin,
          vendorCode: data.vendorCode,
        });
      } else {
        toast.error(res.message || 'Unable to save details');
        console.log('Error saving details:', res.message);
      }
    } catch (error) {
      toast.error('Internal Server Error');
      console.error('Internal Server Error:', error);
    }
  };

  // const fetchEnterpriseData = async () => {
  //   try {
  //     const { enterpriseDetails, success, error } =
  //       await getEnterpriseDetails();
  //     if (!success) {
  //       toast.error(error || 'Cannot fetch enterprise details!');
  //       return;
  //     }

  //     const data = JSON.parse(enterpriseDetails!);
  //     setValue('companyName', data.companyName);
  //     setValue('gstin', data.gstin);
  //     setValue('pan', data.pan);
  //     setValue('vendorCode', data.vendorCode);
  //   } catch (error: any) {
  //     console.error('Error:', error);
  //     toast.error('Unable to load enterprise details.');
  //   }
  // };

  // useEffect(() => {
  //   const fetch = async () => {
  //     await fetchEnterpriseData();
  //   };
  //   fetch();
  // }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
      >
        <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
          Enterprise Details
        </h2>
        <div className='flex flex-col gap-5 p-3'>
          <div className='flex flex-col md:flex-row gap-2 '>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className=' flex-col flex flex-1 gap-1 '>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        disabled={editNotAllowed}
                        placeholder=''
                        {...field}
                        className=' bg-white w-80'
                      />
                    ) : (
                      <Input
                        disabled={editNotAllowed}
                        placeholder='Enter Company Name'
                        {...field}
                        className=' bg-white w-80'
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='pan'
              render={({ field }) => (
                <FormItem className=' flex-col flex flex-1 gap-1 '>
                  <FormLabel>PAN</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        disabled={editNotAllowed}
                        placeholder=''
                        {...field}
                        className=' bg-white w-80'
                      />
                    ) : (
                      <Input
                        disabled={editNotAllowed}
                        placeholder='Enter PAN'
                        {...field}
                        className=' bg-white w-80'
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='gstin'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1 '>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        disabled={editNotAllowed}
                        placeholder=''
                        {...field}
                        className=' bg-white w-80'
                      />
                    ) : (
                      <Input
                        disabled={editNotAllowed}
                        placeholder='Enter GSTIN'
                        {...field}
                        className=' bg-white w-80'
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='vendorCode'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Vendor Code</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        disabled={editNotAllowed}
                        placeholder=''
                        {...field}
                        className=' bg-white w-80'
                      />
                    ) : (
                      <Input
                        disabled={editNotAllowed}
                        placeholder='Enter Vendor Code'
                        {...field}
                        className=' bg-white w-80'
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />{' '}
          </div>
          <div className='flex flex-col md:flex-row gap-2 justify-start items-start'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 '>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        disabled={editNotAllowed}
                        placeholder=''
                        {...field}
                        className=' bg-white w-80'
                      />
                    ) : (
                      <Input
                        disabled={editNotAllowed}
                        placeholder='email'
                        {...field}
                        className=' bg-white w-80'
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />{' '}
            <div className=' flex-col flex gap-1 flex-1'>
              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl className=' min-w-[100%]'>
                      {field.value ? (
                        <Textarea
                          disabled={editNotAllowed}
                          placeholder=''
                          {...field}
                          className=' bg-white w-80'
                        />
                      ) : (
                        <Textarea
                          disabled={editNotAllowed}
                          placeholder='Enterprise Address'
                          {...field}
                          className=' bg-white w-80'
                        />
                      )}
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <p className='text-gray-500 text-sm'>
            Note: These details will be shown in invoices & other tables.
          </p>
        </div>
        <div className='p-4 gap-1 flex flex-col md:flex-row justify-center items-center'>
          {!editNotAllowed && (
            <Button
              type='submit'
              className='flex items-center gap-1 border-2 px-4 rounded bg-gray-800 text-white'
              // onClick={handleSubmit(onSubmit)}
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Submit</>
            </Button>
          )}
          {!editNotAllowed ? (
            <Button
              className='flex items-center justify-around gap-1 border-red-500 border-2 px-2 rounded hover:text-white text-red-500 font-semibold hover:bg-red-500'
              onClick={(e) => {
                e.preventDefault();
                setEditNotAllowed(true);
              }}
            >
              <RxCrossCircled />
              <p>Cancel</p>
            </Button>
          ) : (
            <Button
              type='button'
              className='flex items-center justify-around gap-1 bg-gray-800 border-2 px-2 rounded text-white'
              onClick={(e) => {
                e.preventDefault();
                setEditNotAllowed(false);
              }}
            >
              <MdEdit />
              <p>Edit</p>
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default EnterpriseDetailsForm;

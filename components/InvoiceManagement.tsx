'use client';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdEdit } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import toast from 'react-hot-toast';
import { SubmitHandler } from 'react-hook-form';
import { updateInvoice } from '@/lib/actions/chalan/invoice';

// Define your Zod schema for the invoice management form
const invoiceManagementFormSchema = z.object({
  invoiceNumber: z.string().min(1, 'Required'),
  SESNo: z.string().min(1, 'Required'),
  DONo: z.string().min(1, 'Required'),
});

type FormFields = z.infer<typeof invoiceManagementFormSchema>;

const InvoiceManagement: React.FC<{}> = () => {
  // Initialize the form with Zod resolver and default values

  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);
  const [didFetchedInvoices, setDidFetchedInvoices] = useState<boolean>(false);
  const [allInvoices, setAllInvoices] = useState([]);
  const [editNotAllowed, setEditNotAllowed] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const form = useForm({
    resolver: zodResolver(invoiceManagementFormSchema),
    defaultValues: {
      invoiceNumber: '',
      SESNo: '',
      DONo: '',
    },
  });

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      console.log(data);
      const res = await updateInvoice(JSON.stringify(data));
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <main className='flex min-h-screen flex-col w-full'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='p-4 border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
        >
          <h2 className='text-lg font-semibold '>Invoice Information:</h2>

          {/* <span className='basis-1/2 flex flex-col'>
              <label className='text-white' htmlFor='invoiceNumber'>
                Invoice Number:
              </label>

              <input
                disabled={editNotAllowed}
                type='text'
                placeholder='required'
                id='invoiceNumber'
                // {...register('invoiceNumber', {
                //   required: 'required',
                // })}
                className={`${
                  editNotAllowed
                    ? 'text-white cursor-not-allowed'
                    : 'text-black'
                } p-1 rounded`}
              />
            </span> */}
          <div className='flex flex-col md:flex-row p-3 gap-4'>
            <FormField
              control={form.control}
              name='invoiceNumber'
              render={({ field }) => {
                return (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Invoice Number: </FormLabel>
                    <FormControl>
                      <Input type='text' disabled={editNotAllowed} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name='SESNo'
              render={({ field }) => {
                return (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>SES Number: </FormLabel>
                    <FormControl>
                      <Input type='text' disabled={editNotAllowed} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name='DONo'
              render={({ field }) => {
                return (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>D.O. Number: </FormLabel>
                    <FormControl>
                      <Input type='text' disabled={editNotAllowed} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <div className='w-full  flex justify-center items-center gap-4'>
            <Button
              type='submit'
              // className='bg-green-700 border-2  text-sm px-4 rounded  text-white font-semibold  flex items-center gap-1'
              // onClick={handleSubmit(onSubmit)}
            >
              save
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
};

export default InvoiceManagement;

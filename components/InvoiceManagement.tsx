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
import { Loader } from 'lucide-react';
import chalanAction from '@/lib/actions/chalan/chalanAction';
import { getYearForInvoiceNaming } from '@/utils/getYearForInvoiceNaming';

// Define your Zod schema for the invoice management form
const invoiceManagementFormSchema = z.object({
  invoiceNumber: z.string().min(1, 'Required'),
  SESNo: z.string().min(1, 'Required'),
  DONo: z.string().min(1, 'Required'),
  TaxNumber: z.string().min(1, 'Required'),
});

type FormFields = z.infer<typeof invoiceManagementFormSchema>;

const InvoiceManagement: React.FC<{}> = () => {
  // Initialize the form with Zod resolver and default values
  // const [taxInvoiceNumber, setTaxInvoiceNumber] = useState<string>('');
  const [loadingStates, setLoadingStates] = useState({
    autoTaxInvoiceNumberGenerateLoader: false,
  });
  const [editNotAllowed, setEditNotAllowed] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const form = useForm({
    resolver: zodResolver(invoiceManagementFormSchema),
    defaultValues: {
      invoiceNumber: '',
      SESNo: '',
      DONo: '',
      TaxNumber: '',
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

  const handleAutoGenerateTaxInvoiceNumber = async () => {
    try {
      setLoadingStates((allStates) => ({
        ...allStates,
        autoTaxInvoiceNumberGenerateLoader: true,
      }));
      const resp = await chalanAction.FETCH.getLatestTaxInvoiceNumber();
      if (resp.success) {
        // setTaxInvoiceNumber(await JSON.parse(resp.data));
        form.setValue(
          'TaxNumber',
          `SE/${getYearForInvoiceNaming()}/${await JSON.parse(resp.data)}`
        );
      }
      if (!resp.success) {
        console.error('An Error Occurred');
        return toast.error(resp.message);
      }
    } catch (err) {
      // toast.error('An Error Occurred');
      console.log(err);
      toast.error(
        JSON.stringify(err) || 'Unexpected error occurred, Please try later'
      );
    } finally {
      setLoadingStates((allStates) => ({
        ...allStates,
        autoTaxInvoiceNumberGenerateLoader: false,
      }));
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
            <FormField
              control={form.control}
              name='TaxNumber'
              render={({ field }) => {
                return (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Tax Number: </FormLabel>
                    <FormControl>
                      <Input type='text' disabled={editNotAllowed} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <div className='flex flex-col'>
              <p className='text-xs text-gray-400'>(Recommended)</p>
              <button
                onClick={(event) => {
                  event.preventDefault();
                  handleAutoGenerateTaxInvoiceNumber();
                }}
                className='bg-blue-100 text-blue-500 px-2 py-1 rounded-sm flex justify-center items-center gap-1'
              >
                {loadingStates.autoTaxInvoiceNumberGenerateLoader && <Loader />}
                <>Auto generate Tax invoice number</>
              </button>
            </div>
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

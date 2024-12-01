'use client';

import IndividualChalanContainer from '@/components/fleet-manager/IndividualChalan';
import chalanAction from '@/lib/actions/chalan/chalanAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import clsx from 'clsx';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler } from 'react-hook-form';
import { z, ZodTypeAny } from 'zod';
import workOrderAction from '@/lib/actions/workOrder/workOrderAction';
import engineerAction from '@/lib/actions/engineer/engineerAction';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { updateInvoiceNumber } from '@/lib/actions/chalan/invoice';

const schema = z.object({
  invoiceNumber: z.string().optional(), // Allow optional workOrder
});

type FormFields = z.infer<typeof schema>;

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const form = useForm<FormFields>({
    defaultValues: {
      invoiceNumber: '', // Allow optional workOrder
    },
    resolver: zodResolver(schema),
  });

  const generateInvoiceNumber = async () => {
    // Fixed function name typo
    try {
      const resp = await chalanAction.FETCH.getLatestInvoiceNumber();
      if (resp.success) {
        return JSON.parse(resp.data);
      } else {
        console.error('An Error Occurred');
        toast.error(resp.message);
        return null;
      }
    } catch (err) {
      toast.error('An Error Occurred');
      return null;
    }
  };

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      let invoiceNumber = data.invoiceNumber;

      // If the invoice number is empty, generate one
      // if (!invoiceNumber) {
      if (!invoiceNumber) {
        toast.error('No Invoice Number Selected');
        return;
      }
      // }

      const filter = { invoiceId: searchParams.invoiceId, invoiceNumber };
      const res = await updateInvoiceNumber(JSON.stringify(filter));
      const query = { ...searchParams, invoiceNumber };
      const queryString = new URLSearchParams(query).toString();
      const params = new URLSearchParams(queryString);
      const mergedItems = params.get('mergedItems');

      console.warn(JSON.parse(mergedItems));
      const mergedItemsObj = JSON.parse(mergedItems);

      window.open(`/create-invoice?${queryString}`);
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  // Function to handle auto-generation of invoice number and updating the form
  const handleAutoGenerateInvoice = async () => {
    const generatedInvoiceNumberApi = await generateInvoiceNumber();
    let generatedInvoiceNumber = generatedInvoiceNumberApi.slice(1, -1);
    if (generatedInvoiceNumber) {
      console.log(generatedInvoiceNumber.length);
      form.setValue('invoiceNumber', generatedInvoiceNumber); // Update form with generated invoice number
      toast.success('Invoice number generated successfully');
    } else {
      toast.error('Failed to generate invoice number');
    }
  };

  return (
    <section className='ml-[80px] mr-2'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-2 px-2 mr-2 border-2 border-black rounded-md bg-slate-200 w-full'
        >
          <FormField
            control={form.control}
            name='invoiceNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter Invoice Number'
                    {...field}
                    className='bg-white'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='py-4'>
            <Button type='submit' className='bg-green-500 w-40'>
              Submit
            </Button>
          </div>
        </form>

        {/* Button to auto-generate invoice number */}
        <button
          className='mt-3 p-3 border-2 border-blue-500 rounded-sm hover:text-white hover:bg-blue-500 hover:transition-all'
          onClick={handleAutoGenerateInvoice} // Updated to use the new handler
        >
          Auto Generate Invoice Number
        </button>
      </Form>
      <Separator className='my-4' />
    </section>
  );
};

export default Page;

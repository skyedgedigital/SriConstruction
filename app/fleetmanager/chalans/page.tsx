'use client';

import IndividualChalanContainer from '@/components/fleet-manager/IndividualChalan';
import chalanAction from '@/lib/actions/chalan/chalanAction';
import Skeleton from './skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useTransition } from 'react';
import { wait } from '@/lib/actions/test';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import React, { useEffect, useState } from 'react';

const schema = z.object({
  chalanNumber: z.string().trim().min(1, 'Required'),
});

type FormFields = z.infer<typeof schema>;

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  console.log('sahi h bhai');

  const [verifiedChalans, setVerfiedChalans] = useState([]);
  const [invoiceCreatedChalans, setInvoiceCreatedChalans] = useState([]);

  const [nonVerifiedChalans, setNonVerfiedChalans] = useState([]);
  const [searchedChalan, setSearchedChalan] = useState<any>(null);
  const [isVLoading, setIsVLoading] = useState(true);
  const [isILoading, setIsILoading] = useState(true);

  const [isNVLoading, setIsNVLoading] = useState(true);

  const [page, setPage] = useState(
    typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
  );
  console.log('wowow', page);
  const [limit, setLimit] = useState(
    typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 10
  );
  const [search, setSearch] = useState(
    typeof searchParams.search === 'string' ? searchParams.search : undefined
  );

  useEffect(() => {
    const fetchVerifiedChalans = async () => {
      try {
        console.log(page);
        console.log(limit);
        setIsVLoading(true);
        const res = await chalanAction.FETCH.getAllVerifiedChalans(page, limit);
        if (res?.success) {
          const verified = await JSON.parse(res.data);
          setVerfiedChalans(verified);
          //   toast.success(res.message)

          console.log('yeich toh verified hai', verifiedChalans);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error('Internal Server Error');
      } finally {
        setIsVLoading(false);
      }
    };

    fetchVerifiedChalans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    const fetchNonVerifiedChalans = async () => {
      try {
        console.log(page);
        console.log(limit);
        // Wrap data fetching logic with startTransition
        setIsNVLoading(true); // Set loading state to true
        // Set loading state to false after data is fetched

        const res = await chalanAction.FETCH.getAllNonVerifiedChalans(
          page,
          limit
        );
        if (res?.success) {
          const nonVerified = await JSON.parse(res.data);
          setNonVerfiedChalans(nonVerified);
          console.log('yeich toh nonverified hai', nonVerified);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error('Internal Server Error');
      } finally {
        setIsNVLoading(false);
      }
    };

    fetchNonVerifiedChalans();
  }, [page, limit]);

  // useEffect(()=>{
  // if(verifiedChalans.length>0)
  // {
  //   console.log("wiiedj",verifiedChalans)
  //   setIsVLoading(false)
  // }
  // },[verifiedChalans.length])

  useEffect(() => {
    const fetchInvoiceCreatedChalans = async () => {
      try {
        console.log(page);
        console.log(limit);
        setIsILoading(true);
        const res = await chalanAction.FETCH.getAllInvoiceCreatedChalans(
          page,
          limit
        );
        if (res?.success) {
          const invoiceCreated = await JSON.parse(res.data);
          //toast.success(res.message)
          setInvoiceCreatedChalans(invoiceCreated);

          console.log('yeich toh inv hai', invoiceCreated);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error('Internal Server Error');
      } finally {
        setIsILoading(false);
      }
    };

    fetchInvoiceCreatedChalans();
  }, [page, limit]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const form = useForm<FormFields>({
    defaultValues: {
      chalanNumber: '',
    },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      console.log(data);

      const response = await chalanAction.FETCH.getChalanByChalanNumber(
        data.chalanNumber
      );

      if (response?.success) {
        const chalan = await JSON.parse(response.data);
        console.log(chalan);
        setSearchedChalan(chalan);
        toast.success(`Chalan ${data.chalanNumber} fetched successfully`);

        console.log(`Chalan ${data.chalanNumber} fetched successfully`, chalan);
      } else {
        toast.error(response.message || 'Unable to fetch chalan!');
        console.error('Error fetching chalan:', response.message);
      }
    } catch (error) {
      toast.error('Internal Server Error');
      console.error('Internal Server Error:', error);
    }
  };

  return (
    <Tabs defaultValue='verifiedChalans' className='relative'>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Chalans
      </h1>
      <TabsList className='grid w-full grid-cols-3  justify-content-center bg-white '>
        <TabsTrigger value='nonVerifiedChalans'>Unverified Chalans</TabsTrigger>

        <TabsTrigger value='verifiedChalans'>Verified Chalans</TabsTrigger>
        <TabsTrigger value='invChalans'>Invoice Created Chalans</TabsTrigger>
      </TabsList>
      <TabsContent value='verifiedChalans'>
        <section>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4 w-full md:w-3/4 lg:w-1/2 mx-auto'
            >
              <h2 className='bg-blue-50 font-semibold p-1 px-4 text-base py-2 text-center'>
                Get Chalan By Chalan Number
              </h2>
              <div className='flex flex-col md:flex-row justify-center items-center p-3 gap-4 '>
                <FormField
                  control={form.control}
                  name='chalanNumber'
                  render={({ field }) => (
                    <FormItem className=' flex-col flex gap-1 flex-1'>
                      <FormLabel>Chalan Number</FormLabel>
                      <FormControl>
                        {field.value ? (
                          <Input
                            placeholder=''
                            {...field}
                            className=' bg-white '
                          />
                        ) : (
                          <Input
                            placeholder='Enter Chalan Number'
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
              <div className='p-4 gap-1 flex flex-col md:flex-row justify-center items-center'>
                <Button
                  type='submit'
                  className='flex items-center gap-1 border-2 border-black px-4 rounded bg-green-500 text-white'
                  // onClick={handleSubmit(onSubmit)}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  )}
                  <>Submit</>
                </Button>
                <Button
                  type='button'
                  className='flex items-center gap-1 border-2 px-4 rounded bg-white text-black'
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchedChalan(null);
                    form.reset({
                      chalanNumber: '',
                    });
                    return;
                  }}
                >
                  <>Clear Filter</>
                </Button>
              </div>
            </form>
          </Form>
          <Separator className='my-4' />
          <div className='mb-4 flex items-center justify-end px-2 mt-4'>
            <div className='flex space-x-4'>
              <Link
                href={{
                  pathname: '/fleetmanager/chalans',
                  query: {
                    ...(search ? { search } : {}),
                    page: page > 1 ? page - 1 : 1,
                  },
                }}
                className={clsx(
                  'rounded border bg-black px-3 py-1 text-sm text-white',
                  (page <= 1 || searchedChalan !== null) &&
                    'pointer-events-none opacity-50'
                )}
                onClick={() => handlePageChange(page > 1 ? page - 1 : 1)}
              >
                Previous
              </Link>
              <Link
                href={{
                  pathname: '/fleetmanager/chalans',
                  query: {
                    ...(search ? { search } : {}),
                    page: page + 1,
                  },
                }}
                className={clsx(
                  'rounded border bg-black px-3 py-1 text-sm text-white',
                  searchedChalan !== null && 'pointer-events-none opacity-50'
                )}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Link>
            </div>
          </div>
          <div className='flex flex-col gap-10 w-full'>
            {searchedChalan ? (
              <IndividualChalanContainer chalan={searchedChalan} />
            ) : verifiedChalans?.length > 0 ? (
              verifiedChalans.map((chalan) => (
                <div key={chalan._id} className='flex items-center gap-1'>
                  <IndividualChalanContainer chalan={chalan} />
                </div>
              ))
            ) : (
              <div>No data for this page!! (Try checking previous pages)</div>
            )}
          </div>
        </section>
      </TabsContent>
      <TabsContent value='nonVerifiedChalans'>
        <section>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4 w-full md:w-3/4 lg:w-1/2 mx-auto'
            >
              <h2 className='bg-blue-50 font-semibold p-1 px-4 text-base py-2 text-center'>
                Get Chalan By Chalan Number
              </h2>
              <div className='flex flex-col md:flex-row justify-center items-center p-3 gap-4 '>
                <FormField
                  control={form.control}
                  name='chalanNumber'
                  render={({ field }) => (
                    <FormItem className=' flex-col flex gap-1 flex-1'>
                      <FormLabel>Chalan Number</FormLabel>
                      <FormControl>
                        {field.value ? (
                          <Input
                            placeholder=''
                            {...field}
                            className=' bg-white '
                          />
                        ) : (
                          <Input
                            placeholder='Enter Chalan Number'
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
              <div className='p-4 gap-1 flex flex-col md:flex-row justify-center items-center'>
                <Button
                  type='submit'
                  className='flex items-center gap-1 border-2 border-black px-4 rounded bg-green-500 text-white'
                  // onClick={handleSubmit(onSubmit)}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  )}
                  <>Submit</>
                </Button>
                <Button
                  type='button'
                  className='flex items-center gap-1 border-2 px-4 rounded bg-white text-black'
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchedChalan(null);
                    form.reset({
                      chalanNumber: '',
                    });
                    return;
                  }}
                >
                  <>Clear Filter</>
                </Button>
              </div>
            </form>
          </Form>
          <Separator className='my-4' />
          <div className='mb-4 flex items-center justify-end px-2 mt-4'>
            <div className='flex space-x-4'>
              <Link
                href={{
                  pathname: '/fleetmanager/chalans',
                  query: {
                    ...(search ? { search } : {}),
                    page: page > 1 ? page - 1 : 1,
                  },
                }}
                className={clsx(
                  'rounded border bg-black px-3 py-1 text-sm text-white',
                  (page <= 1 || searchedChalan !== null) &&
                    'pointer-events-none opacity-50'
                )}
                onClick={() => handlePageChange(page > 1 ? page - 1 : 1)}
              >
                Previous
              </Link>
              <Link
                href={{
                  pathname: '/fleetmanager/chalans',
                  query: {
                    ...(search ? { search } : {}),
                    page: page + 1,
                  },
                }}
                className={clsx(
                  'rounded border bg-black px-3 py-1 text-sm text-white',
                  searchedChalan !== null && 'pointer-events-none opacity-50'
                )}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Link>
            </div>
          </div>
          <div className='flex flex-col gap-10'>
            {searchedChalan ? (
              <IndividualChalanContainer chalan={searchedChalan} />
            ) : nonVerifiedChalans?.length > 0 ? (
              nonVerifiedChalans.map((chalan) => (
                <div key={chalan._id} className='flex items-center gap-1'>
                  <IndividualChalanContainer chalan={chalan} />
                </div>
              ))
            ) : (
              <div>No data for this page!! (Try checking previous pages)</div>
            )}
          </div>
        </section>
      </TabsContent>

      <TabsContent value='invChalans'>
        <section>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4 w-full md:w-3/4 lg:w-1/2 mx-auto'
            >
              <h2 className='bg-blue-50 font-semibold p-1 px-4 text-base py-2 text-center'>
                Get Chalan By Chalan Number
              </h2>
              <div className='flex flex-col md:flex-row justify-center items-center p-3 gap-4 '>
                <FormField
                  control={form.control}
                  name='chalanNumber'
                  render={({ field }) => (
                    <FormItem className=' flex-col flex gap-1 flex-1'>
                      <FormLabel>Chalan Number</FormLabel>
                      <FormControl>
                        {field.value ? (
                          <Input
                            placeholder=''
                            {...field}
                            className=' bg-white '
                          />
                        ) : (
                          <Input
                            placeholder='Enter Chalan Number'
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
              <div className='p-4 gap-1 flex flex-col md:flex-row justify-center items-center'>
                <Button
                  type='submit'
                  className='flex items-center gap-1 border-2 border-black px-4 rounded bg-green-500 text-white'
                  // onClick={handleSubmit(onSubmit)}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  )}
                  <>Submit</>
                </Button>
                <Button
                  type='button'
                  className='flex items-center gap-1 border-2 px-4 rounded bg-white text-black'
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchedChalan(null);
                    form.reset({
                      chalanNumber: '',
                    });
                    return;
                  }}
                >
                  <>Clear Filter</>
                </Button>
              </div>
            </form>
          </Form>
          <Separator className='my-4' />
          <div className='mb-4 flex items-center justify-end px-2 mt-4'>
            <div className='flex space-x-4'>
              <Link
                href={{
                  pathname: '/fleetmanager/chalans',
                  query: {
                    ...(search ? { search } : {}),
                    page: page > 1 ? page - 1 : 1,
                  },
                }}
                className={clsx(
                  'rounded border bg-black px-3 py-1 text-sm text-white',
                  (page <= 1 || searchedChalan !== null) &&
                    'pointer-events-none opacity-50'
                )}
                onClick={() => handlePageChange(page > 1 ? page - 1 : 1)}
              >
                Previous
              </Link>
              <Link
                href={{
                  pathname: '/fleetmanager/chalans',
                  query: {
                    ...(search ? { search } : {}),
                    page: page + 1,
                  },
                }}
                className={clsx(
                  'rounded border bg-black px-3 py-1 text-sm text-white',
                  searchedChalan !== null && 'pointer-events-none opacity-50'
                )}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Link>
            </div>
          </div>
          <div className='flex flex-col gap-10'>
            {searchedChalan ? (
              <IndividualChalanContainer chalan={searchedChalan} />
            ) : invoiceCreatedChalans?.length > 0 ? (
              invoiceCreatedChalans.map((chalan) => (
                <div key={chalan._id} className='flex items-center gap-1'>
                  <IndividualChalanContainer chalan={chalan} />
                </div>
              ))
            ) : (
              <div>No data for this page!! (Try checking previous pages)</div>
            )}
          </div>
        </section>
      </TabsContent>
    </Tabs>
  );
};

export default Page;

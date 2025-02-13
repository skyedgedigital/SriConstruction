'use client';

import IndividualChalanContainer from '@/components/fleet-manager/IndividualChalan';
import chalanAction from '@/lib/actions/chalan/chalanAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { getObjectURL } from '@/utils/aws';
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

const schema = z.object({
  workOrder: z.string().trim().min(1, 'Required'), // Allow optional workOrder
  engineer: z.string().trim().min(1, 'Required'),
});

type FormFields = z.infer<typeof schema>;

const Page = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const form = useForm<FormFields>({
    defaultValues: {
      workOrder: '', // Allow optional workOrder
      engineer: '',
    },
    resolver: zodResolver(schema),
  });
  const [presignedUrl, setPresignedUrl] = useState<string>('');
  const [apresignedUrl, setAPresignedUrl] = useState<string>('');

  const [allWorkOrderNumbers, setAllWorkOrderNumbers] = useState([]);
  const [allEngineers, setAllEngineers] = useState([]);
  const [workOrderNumber, setWorkOrderNumber] = useState<any>(null);
  const [engineerobj, setEngineerobj] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      // const { data, success, error } =
      //   await workOrderAction.FETCH.fetchAllWorkOrder();

      const workOrderResp =
        await workOrderAction.FETCH.fetchAllWorkOrder();
      const success = workOrderResp.success;
      const error = workOrderResp.error;
      const data = JSON.parse(workOrderResp.data);

      if (success) {
        const workOrderNumbers = JSON.parse(JSON.stringify(data));
        setAllWorkOrderNumbers(workOrderNumbers);
      } else {
        toast.error(error || 'can not fetch work order numbers!');
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const { data, success, error, message } =
        await engineerAction.FETCH.fetchAllEngineers();

      if (success) {
        const engineers = JSON.parse(data);
        setAllEngineers(engineers);
      } else {
        toast.error(message || 'can not fetch engineers!');
      }
    };
    fetch();
  }, []);
  const router = useRouter();
  const [filteredChalans, setFilteredChalans] = useState([]); // State to store filtered chalans

  const [page, setPage] = useState(
    typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
  );

  const [limit, setLimit] = useState(
    typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 10
  );
  const [search, setSearch] = useState(
    typeof searchParams.search === 'string' ? searchParams.search : undefined
  );
  const [checkedChalans, setCheckedChalans] = useState([]);
  const [checkedIChalans, setCheckedIChalans] = useState([]);

  const [chalanss, setChalanss] = useState([]);
  useEffect(() => {
    const fetchChalans = async () => {
      console.log(page);
      console.log(limit);
      setChalanss([]);
      console.log('filetered', filteredChalans);

      if (filteredChalans.length > 0) {
        // THIS COMMENTED CODE WERE USED TO IMPLEMENT PAGING
        // const currentChalans = filteredChalans;
        // const startIndex = (page - 1) * limit;
        // const endIndex = Math.min(startIndex + limit, currentChalans.length);
        // const finalChalans = currentChalans.slice(startIndex, endIndex);
        setChalanss(filteredChalans);
      }
    };

    fetchChalans();
  }, [page, limit, filteredChalans]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      console.log(data);

      const res = await chalanAction.FETCH.getChalanByEngineerAndWorkOrder(
        data.engineer,
        data.workOrder
      );
      if (res.success) {
        const response = await JSON.parse(res.data);
        console.log(response);
        setFilteredChalans(response);

        setCheckedChalans([]);
        setCheckedIChalans([]);
        console.log('wowoowjwjdiojoed', response);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const mergeSelectedChalans = async () => {
    // Implement your logic to handle the selected chalans (checkedChalans state)
    // You can send the array of chalan numbers (checkedChalans) to your function here
    try {
      console.log('Selected chalan numbers:', checkedChalans); // Example usage
      // const res = await chalanAction.CREATE.createMergeChalan(checkedChalans);
      // console.log(res);
      // if (res?.success) {
      // } else {
      //   toast.error(res.message);
      //   console.log(res.error);
      // }
      // console.log(res.message);
      // const response = await JSON.parse(res.data);
      // console.log('wow nice invoice bhai', response);
      // const dataToSend = {
      //   workOrderNumber: workOrderNumber?.workOrderNumber,
      // };
      const timestamps = checkedIChalans.map((chalan) =>
        new Date(chalan.date).getTime()
      );
      // Find the minimum and maximum timestamps
      const minTimestamp = Math.min(...timestamps);
      const maxTimestamp = Math.max(...timestamps);

      // Convert timestamps back to Date objects
      const minDate = new Date(minTimestamp);
      const maxDate = new Date(maxTimestamp);

      // Format the dates as "x to y"
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Format the dates
      let formattedString = '';

      checkedChalans.length > 1
        ? (formattedString = `${formatDate(minDate)} to ${formatDate(maxDate)}`)
        : (formattedString = `${formatDate(minDate)}`);
      // this find step is extra we had to do in merge chalan than individualChalanContainer because of how here <Select/> is working
      const selectWO = allWorkOrderNumbers?.find(
        (wo) => wo?._id?.toString() === workOrderNumber
      );
      const query = {
        wo: selectWO?._id,
        location: checkedIChalans[0]?.location,
        service: formattedString,
        department: checkedIChalans[0].department?.departmentName,
        // invoiceId: response?.invoiceId,
        selectedChalanNumbers: JSON.stringify(checkedChalans),
      };
      const queryString = new URLSearchParams(query).toString();
      console.log('query string', queryString);
      window.open(`/create-invoice?${queryString}`);
      // window.open(`/fleetmanager/enter-invoice-number?${queryString}`);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChalanCheck = (chalan) => {
    setCheckedChalans((prevChecked) => {
      const newChecked = prevChecked.includes(chalan?.chalanNumber)
        ? prevChecked.filter((id) => id !== chalan.chalanNumber) // Remove if already checked
        : [...prevChecked, chalan.chalanNumber]; // Add if not checked
      return newChecked;
    });
    setCheckedIChalans((prevChecked) => {
      const chalanExists = prevChecked.some(
        (chalanObj) => chalanObj.chalanNumber === chalan.chalanNumber
      );

      if (chalanExists) {
        // Remove the chalan object from the array if it exists
        return prevChecked.filter(
          (chalanObj) => chalanObj.chalanNumber !== chalan.chalanNumber
        );
      } else {
        // Add the chalan object to the array if it doesn't exist
        return [...prevChecked, chalan];
      }
    });
  };

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      // FUNCTION TO CREATE PRE-SIGNED URL FOR AWS ACCESSIBILITY
      // const key: sTableRowing = `chalans/${new Date().getFullYear()}/${returnThreeLetterMonth(
      //   new Date().getMonth()
      // )}/${chalanState?.chalanNo}.jpg`;
      const key: string = `invoices/1234567890111,ok,work89-summary.pdf`;
      const data = await getObjectURL(key);
      console.log('yich hai url', data);
      setPresignedUrl(data);
    };
    fetchPresignedUrl();
  }, []);

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      // FUNCTION TO CREATE PRE-SIGNED URL FOR AWS ACCESSIBILITY
      // const key: sTableRowing = `chalans/${new Date().getFullYear()}/${returnThreeLetterMonth(
      //   new Date().getMonth()
      // )}/${chalanState?.chalanNo}.jpg`;
      const key: string = `invoices/1234567890111,ok,work89.pdf`;
      const data = await getObjectURL(key);
      console.log('yich hai url', data);
      setAPresignedUrl(data);
    };
    fetchPresignedUrl();
  }, []);

  return (
    <section>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Merge Invoice{' '}
      </h1>
      {/* <Link 
              href={presignedUrl}
              target="_blank"
              // className=" z-10 bg-black hover:bg-white  h-full  text-xs flex items-center justify-center text-white hover:text-black px-2  "
            >
              <Button size="sm" >              View Summary
</Button>
            </Link>
            <Link 
              href={apresignedUrl}
              target="_blank"
              // className=" z-10 bg-black hover:bg-white  h-full  text-xs flex items-center justify-center text-white hover:text-black px-2  "
            >
              <Button size="sm" >              View pdf
</Button>
            </Link> */}
      <div className='flex justify-center items-center md:justify-end '>
        <Button onClick={mergeSelectedChalans} className='mb-4'>
          Merge Invoice
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='border-[1px] border-gray-300 rounded-md shadow-md flex flex-col gap-6 mt-4'
        >
          <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
            Invoice Merge Form
          </h2>
          <div className='flex flex-col md:flex-row p-3 gap-4'>
            <FormField
              control={form.control}
              name='workOrder'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Work Order</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      // console.log('YYYY', field);
                      console.log('XXXX', e);
                      setWorkOrderNumber(e);
                    }}
                    value={field.value}
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
                    <SelectContent className='max-w-80 max-h-72'>
                      {allWorkOrderNumbers?.map((option, index) => (
                        <SelectItem
                          value={option._id.toString()}
                          key={option._id.toString()}
                        >
                          {option.workOrderNumber}
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
              name='engineer'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Engineer</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      // setChalanNumber(e)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        {field.value ? (
                          <SelectValue placeholder='' />
                        ) : (
                          'Select an Engineer'
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-w-'>
                      {allEngineers?.map((option, index) => (
                        <SelectItem
                          value={option._id.toString()}
                          key={option._id.toString()}
                          // className="capitalize"
                        >
                          {option?.name
                            ?.toLowerCase()
                            .split(' ')
                            .map(
                              (word: string) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='p-4 gap-1 flex flex-col md:flex-row justify-center items-center'>
            <Button type='submit' className=' bg-green-500 w-40 '>
              Submit
            </Button>
          </div>
        </form>
      </Form>
      <Separator className='my-4' />

      <div className=' flex items-center justify-end my-4 px-2'>
        {/* <div className='flex space-x-4'>
          <Link
            href={{
              pathname: '/fleetmanager/merge-invoices',
              query: {
                ...(search ? { search } : {}),
                page: page > 1 ? page - 1 : 1,
              },
            }}
            className={clsx(
              'rounded border bg-black px-3 py-1 text-sm text-white',
              page <= 1 && 'pointer-events-none opacity-50'
            )}
            onClick={() => handlePageChange(page > 1 ? page - 1 : 1)}
          >
            Previous
          </Link>
          <Link
            href={{
              pathname: '/fleetmanager/merge-invoices',
              query: {
                ...(search ? { search } : {}),
                page: page + 1,
              },
            }}
            className='rounded border bg-black px-3 py-1 text-sm text-white'
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Link>
        </div> */}
      </div>
      <div className='flex flex-col gap-10 pr-4 '>
        {chalanss?.length > 0 ? (
          chalanss.map((chalan) => (
            <div key={chalan._id} className='flex items-center gap-1 pr-4'>
              <Input
                type='checkbox'
                className='h-8 w-8'
                checked={checkedChalans.includes(chalan?.chalanNumber)}
                onChange={() => handleChalanCheck(chalan)}
              />{' '}
              <div className='flex-1 '>
                <IndividualChalanContainer chalan={chalan} />
              </div>
            </div>
          ))
        ) : (
          <div>No data for this page!! (Try checking previous pages)</div>
        )}
      </div>
    </section>
  );
};

export default Page;

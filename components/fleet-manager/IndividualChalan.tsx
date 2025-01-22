'use client';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getObjectURL } from '@/utils/aws';
import Link from 'next/link';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Button } from '../ui/button';
import { Document } from 'mongoose';
import { IChalan } from '@/interfaces/chalan.interface';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
// import {
//   changeChalanEngineer,
//   signChalan,
//   verifyChalan,
// } from "@/app/_utils/server_actions/chalans";
// import { DriverOrderChalanFormValues, EngineerFormData } from "@/types";
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { FaSignature } from 'react-icons/fa6';
import chalanAction from '@/lib/actions/chalan/chalanAction';
import { fetchWorkOrderByWorkOrderId } from '@/lib/actions/workOrder/fetch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler } from 'react-hook-form';
import { z, ZodTypeAny } from 'zod';
import engineerAction from '@/lib/actions/engineer/engineerAction';
import { Blocks, Cross, Edit } from 'lucide-react';
import { MdClose } from 'react-icons/md';
// import { calcItemPrice } from "@/app/_utils/calculatePrices";
// import { getObjectURL } from "@/app/_utils/aws";
// import { returnThreeLetterMonth } from "@/app/_utils/dates/date";
// import { MdEdit } from "react-icons/md";
// import { deleteChalanById } from "@/app/_utils/server_actions/chalans";
const engSchema = z.object({
  engineer: z.string(),
  location: z.string().optional(),
});

type FormFields = z.infer<typeof engSchema>;

const IndividualChalanContainer = ({ chalan }: { chalan: any }) => {
  const [total, setTotal] = useState(0);
  //   const date = new Date(chalan.date);
  //   const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  // const formattedDate = date.toLocaleDateString('en-GB', options);
  const date = new Date(chalan.date);

  // Get the day, month, and year
  const day = String(date.getDate()).padStart(2, '0'); // Get day and pad it with leading zero
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  const [isVerified, setIsVerified] = useState(chalan.verified);
  const [edit, setEdit] = useState(false);
  // console.log('hdjdjdj', chalan);
  const [isSigned, setIsSigned] = useState(chalan.signed);
  const [fetchedEngineerNames, setFetchedEngineerNames] = useState([]);
  useEffect(() => {
    const fetchEngineersData = async () => {
      const res = await engineerAction.FETCH.fetchEngineerByDepartmentName(
        chalan?.department?.departmentName
      );

      if (res.success) {
        const engineers = res.data
          ? JSON.parse(res.data).map((engineer) => engineer.name)
          : [];
        setFetchedEngineerNames(engineers);
      }
      if (!res.success) {
        return;
      }
    };
    if (chalan.department?.departmentName != '') fetchEngineersData();
  }, []);

  const form = useForm<FormFields>({
    defaultValues: {
      engineer: chalan?.engineer?.name,
      location: chalan?.location,
    },
    resolver: zodResolver(engSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (
    receivedeng: FormFields
  ) => {
    try {
      console.log('form submitted', receivedeng);
      const filter = await JSON.stringify(receivedeng);
      const res = await chalanAction.UPDATE.updateChalan(chalan._id, filter);

      //     console.log("yeich toh file hai",receivedChalan.file[0])
      //     const formData=new FormData();
      //     formData.append('file',receivedChalan.file[0]);
      //     console.log(formData)
      //     console.log(typeof(formData))
      //     const nonFileData={
      //       workOrder: receivedChalan.workOrder,
      // department: receivedChalan.department,
      // engineer: receivedChalan.engineer,
      // date : receivedChalan.date,
      // chalanNumber: receivedChalan.chalanNumber,
      // location: receivedChalan.location,
      // workDescription: receivedChalan.workDescription,

      // status: receivedChalan.status,
      // items: receivedChalan.items,
      // commentByDriver: receivedChalan.commentByDriver,
      // commentByFleetManager: receivedChalan.commentByFleetManager,
      //     }

      //     formData.append('chalanDetails',JSON.stringify(nonFileData));

      //     const res=await chalanAction.CREATE.createChalan(formData);

      //     console.log(formData);

      if (res.success) {
        toast.success('Chalan updated successfully');
      } else {
        toast.error(res.message || 'Failed to update chalan, Please try later');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const [approving, setApproving] = useState<boolean>(false);
  const [signing, setSigning] = useState<boolean>(false);
  const [presignedUrl, setPresignedUrl] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      // FUNCTION TO CREATE PRE-SIGNED URL FOR AWS ACCESSIBILITY
      // const key: sTableRowing = `chalans/${new Date().getFullYear()}/${returnThreeLetterMonth(
      //   new Date().getMonth()
      // )}/${chalanState?.chalanNo}.jpg`;
      const key: string = `chalans/${chalan?.chalanNumber}.jpg`;
      const data = await getObjectURL(key);
      setPresignedUrl(data);
    };
    fetchPresignedUrl();
  });

  //     if (!updatedEngineer) {
  //       return toast.error("Invalid Engineer name");
  //     }
  //     TableRowy {
  //       setSpinStates((prev) => ({ ...prev, updatingEngineer: TableRowue }));
  //       const { success, error, updatedChalanEngineer, message } =
  //         await changeChalanEngineer(updatedEngineer, chalanState?.chalanNo);

  //       if (success) {
  //         setChalanState((prev: DriverOrderChalanFormValues) => ({
  //           ...prev,
  //           engineerName: updatedChalanEngineer,
  //         }));
  //         toast.success(message || "Engineer changed successfully!");
  //       }
  //       if (!success) [toast.error(error || "Engineer change failed!")];
  //     } catch (error: any) {
  //       console.log(error);
  //       toast.error("Engineer change failed!");
  //     } finally {
  //       setSpinStates((prev) => ({ ...prev, updatingEngineer: false }));
  //     }
  //   };

  const handleVerification = async (chalanNumber: string) => {
    try {
      setApproving(true);
      const res = await chalanAction.UPDATE.markAsVerified(chalanNumber);

      if (res.success) {
        setIsVerified(true);
        toast.success(`Chalan ${chalanNumber} marked as verified`);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Internal server error');
    } finally {
      setApproving(false);
    }
  };

  const mergeSelectedChalans = async (chalan: any) => {
    // Implement your logic to handle the selected chalans (checkedChalans state)
    // You can send the array of chalan numbers (checkedChalans) to your function here
    const checkedChalans = [chalan?.chalanNumber];

    try {
      console.log('Selected chalan numbers:', checkedChalans); // Example usage
      // const res = await chalanAction.CREATE.createMergeChalan(checkedChalans);
      // console.log('yehi hai res', res);
      // console.log(res.message);
      // const response = await JSON.parse(res.data);
      // console.log('wow nice invoice bhai', response);
      // const dataToSend = {
      //   workOrderNumber: chalan?.workOrder?.workOrderNumber,
      // };
      // console.log(res);
      // Find the minimum and maximum timestamps
      const minTimestamp = new Date(chalan.date).getTime();
      const maxTimestamp = new Date(chalan.date).getTime();

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
      const formattedString = `${formatDate(minDate)}`;
      const query = {
        wo: chalan?.workOrder?._id,
        location: chalan.location,
        service: formattedString,
        department: chalan.department?.departmentName,
        // invoiceId: response?.invoiceId,
        // mergedItems: response?.mergedItems,
        selectedChalanNumbers: JSON.stringify(checkedChalans),
      };
      const queryString = new URLSearchParams(query).toString();
      console.log('query string', queryString);
       window.open(`/create-invoice?${queryString}`);
      // window.open(`/fleetmanager/enter-invoice-number?${queryString}`);
      // if (res.success) {
      // } else {
      //   toast.error(res.message);
      //   console.log(res.error);
      // }
    } catch (error) {
      console.log(error);
    }
  };

  const signHandler = async (chalanId: string) => {
    try {
      setSigning(true);
      // @ts-ignore
      const update = {
        ...chalan,
        signed: true,
        workOrder: chalan.workOrder.workOrderNumber,
        department: chalan.department.departmentName,
        engineer: chalan.engineer.name,
      };
      const updates = await JSON.stringify(update);
      const res = await chalanAction.UPDATE.updateChalan(chalanId, updates);

      if (res.success) {
        setIsSigned(true);
        toast.success(`Chalan marked as signed`);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Internal server error');
    } finally {
      setSigning(false);
    }
  };

  const calculateTotalCost = () => {
    let total = 0;
    chalan?.items?.map((item) => {
      total += item?.itemCosting;
    });
    // setTotal(total)
    return <span className='font-bold text-lg'>{total.toFixed(2)}</span>;
  };

  const handleDeleteChalan = async () => {
    try {
      const res = await chalanAction.DELETE.deleteChalan(chalan?.chalanNumber);
      console.log('JUST DELETED CHALAN', res);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message || 'Filed to delete chalan,Please try later');
      }
    } catch (error: any) {
      toast.error(error as string);
    }
  };

  return (
    <div className='relative shadow-md flex flex-col bg-gr border-[1px] border-black text-xs rounded-lg overflow-hidden w-full'>
      <div className='w-full flex items-stretch justify-between '>
        <h2 className='text-white font-semibold p-2 text-sm text-center w-full bg-blue-400'>{`Chalan Number: ${chalan.chalanNumber}`}</h2>
      </div>
      <div>
        {' '}
        <div className='p-3 flex flex-col gap-2'>
          <div className='flex flex-col md:flex-row gap-1 flex-1'>
            <div className='w-[90%] flex flex-col gap-2 text-[.8rem]'>
              <span className='w-full flex  gap-3'>
                <p className='font-bold capitalize text-primary-color items-start '>
                  date:
                </p>
                <p>{formattedDate}</p>
              </span>
              <span className='w-full flex  gap-5'>
                <p className='font-bold capitalize text-primary-color items-start '>
                  Work Order no:
                </p>
                {chalan.workOrder ? (
                  <p className=' text-gray-500 '>
                    {chalan.workOrder?.workOrderNumber}
                  </p>
                ) : (
                  <p className='text-red-500'>
                    {JSON.stringify(chalan.workOrder)}
                  </p>
                )}
              </span>
              <span className=' flex gap-5 pt-1'>
                <p
                  className='
                font-semibold capitalize text-primary-color  '
                >
                  location:
                </p>
                {chalan?.location ? (
                  <p className=' text-gray-500 '>{chalan.location}</p>
                ) : (
                  <p className='text-red-500'>
                    {JSON.stringify(chalan?.location) ||
                      'No Location found for this chalan'}
                  </p>
                )}
              </span>
              <span className=' flex gap-5 pt-1 '>
                <p
                  className='
                font-semibold capitalize text-primary-color  '
                >
                  Work Description:
                </p>
                {chalan?.workDescription ? (
                  <p className=' text-gray-500 '>{chalan?.workDescription}</p>
                ) : (
                  <p className='text-red-500'>No work description</p>
                )}
              </span>
              <span className=' flex gap-5 pt-1'>
                <p
                  className='
                font-semibold capitalize text-primary-color  '
                >
                  department:
                </p>
                {chalan?.department ? (
                  <p className=' text-gray-500 '>
                    {chalan.department?.departmentName}
                  </p>
                ) : (
                  <p className='text-red-500'>
                    {JSON.stringify(chalan?.department)}
                  </p>
                )}
              </span>
            </div>
            <div className='flex flex-col items-end w-fit justify-center gap-4'>
              <button
                className='text-base items-center justify-center bg-white border-2 border-black text-black px-4 py-1 rounded'
                onClick={() => {
                  setEdit((prev) => !prev);
                }}
              >
                {!edit ? (
                  <p className='text-blue-600'>Edit</p>
                ) : (
                  <p className='text-red-600'>Cancel</p>
                )}
              </button>
              {fetchedEngineerNames.length === 0 ? (
                <p className='text-red-500'>
                  No engineers found with this department in chalan
                </p>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='w-full rounded-md'
                  >
                    <div className='flex flex-col md:flex-row gap-2 justify-center items-end'>
                      <FormField
                        control={form.control}
                        name='location'
                        render={({ field }) => {
                          return (
                            <FormItem className='flex-col flex gap-1 flex-1'>
                              <FormLabel>Location:</FormLabel>
                              <FormControl>
                                <Input
                                  type='text'
                                  disabled={!edit}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        disabled={!edit}
                        control={form.control}
                        name='engineer'
                        render={({ field }) => (
                          <FormItem className=' flex-col flex gap-1 flex-1'>
                            <FormLabel>Engineer</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className='bg-white'
                                  disabled={!edit}
                                >
                                  {field.value ? (
                                    <SelectValue placeholder='' />
                                  ) : (
                                    'Select an Engineer'
                                  )}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fetchedEngineerNames.map((option, index) => (
                                  <SelectItem
                                    key={option.toString()}
                                    value={option.toString()}
                                  >
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type='submit'
                        className=' bg-green-500'
                        disabled={!edit}
                      >
                        Submit
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <h2 className='font-bold text-primary-color text-sm'>Items:</h2>
            {/* {tableContent} */}
            <Table className='w-full border-2  border-gray-400 text-center text-xs font-semibold overflow-auto'>
              <TableHeader className=' bg-slate-800 '>
                <TableRow>
                  <TableHead className='bg-slate-800 text-white border-2 border-gray-400 py-1 text-center'>
                    Item Type
                  </TableHead>
                  <TableHead className='bg-slate-800 text-white border-2 border-gray-400 py-1 text-center'>
                    Started At
                  </TableHead>
                  <TableHead className='bg-slate-800 text-white border-2 border-gray-400 py-1 text-center'>
                    Ended At
                  </TableHead>
                  <TableHead className='bg-slate-800 text-white border-2 border-gray-400 py-1 text-center'>
                    Item Price
                  </TableHead>

                  <TableHead className='bg-slate-800 text-white border-2 border-gray-400 py-1 text-center'>
                    Unit
                  </TableHead>
                  <TableHead className='bg-slate-800 text-white border-2 border-gray-400 py-1 text-center'>
                    Quantity
                  </TableHead>
                  <TableHead className='bg-slate-800 text-white border-2 border-gray-400 py-1 text-center'>
                    Price (INR)
                  </TableHead>
                </TableRow>
              </TableHeader>
              {chalan?.items.length > 0 && (
                <TableBody>
                  {chalan?.items?.map((item: any) => (
                    <TableRow key={item?._id}>
                      <TableCell className='border-2 border-gray-400 py-1 text-center'>
                        {item?.item?.itemName}
                      </TableCell>

                      <TableCell className='border-2 border-gray-400 py-1 text-center'>
                        {item?.startTime}
                      </TableCell>

                      <TableCell className='border-2 border-gray-400 py-1 text-center'>
                        {item?.endTime}
                      </TableCell>
                      <TableCell className='border-2 border-gray-400 py-1 text-center'>
                        {/* {formatIndianCurrency(item?.itemPrice)} */}
                        {item?.item?.itemPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className='border-2 border-gray-400 py-1 text-center'>
                        {item?.unit}
                      </TableCell>
                      <TableCell className='border-2 border-gray-400 py-1 text-center'>
                        {item?.unit === 'fixed'
                          ? '-'
                          : `${item?.hours.toFixed(2)}`}
                      </TableCell>
                      <TableCell className='border-2 border-gray-400 py-1 text-center'>
                        {/* Rs. {formatIndianCurrency(calcItemPrice(item))} */}
                        {item?.itemCosting?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
              <TableFooter>
                <TableRow>
                  <TableCell className='border-t-2 border-t-gray-300 py-1 text-center'></TableCell>
                  <TableCell className='border-t-2 border-t-gray-300 py-1 text-center'></TableCell>
                  <TableCell className='border-t-2 border-t-gray-300 py-1 text-center'></TableCell>
                  <TableCell className='border-t-2 border-t-gray-300 py-1 text-center'></TableCell>
                  <TableCell className='border-t-2 border-t-gray-300 py-1 text-center'></TableCell>

                  <TableCell className='border-t-2 border-t-gray-300 py-1 text-center text-lg'>
                    Total:
                  </TableCell>
                  <TableCell className='border-t-2 border-t-gray-300 py-1 text-center'>
                    {calculateTotalCost()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
        <div className='flex flex-col sm:flex-row gap-1 p-2 w-3/4'>
          <Link
            href={chalan.file}
            target='_blank'
            // className=" z-10 bg-black hover:bg-white  h-full  text-xs flex items-center justify-center text-white hover:text-black px-2  "
          >
            <Button size='sm'> View Physical Chalan</Button>
          </Link>
          {/* {canApprove && !chalanState?.verified && ( */}
          <Button
            size='sm'
            disabled={isVerified}
            onClick={() => handleVerification(chalan.chalanNumber)}
            // className=" flex items-center gap-1 shadow bg-green-600 text-white py-1 px-2"
          >
            {approving ? (
              <AiOutlineLoading3Quarters className='animate-spin' />
            ) : (
              <RiVerifiedBadgeFill />
            )}
            {isVerified ? (
              <p className='capitalize'>Already verified</p>
            ) : (
              <p className='capitalize'>mark as verified</p>
            )}
          </Button>
          {/* )} */}
          {/* {canApprove && !chalanState?.signed && ( */}
          <Button
            size='sm'
            disabled={isSigned}
            onClick={() => signHandler(chalan._id)}
            // className=" flex items-center gap-1 shadow bg-green-600 text-white py-1 px-2"
          >
            {signing ? (
              <AiOutlineLoading3Quarters className='animate-spin' />
            ) : (
              <FaSignature />
            )}
            {isSigned ? (
              <p className='capitalize'>Already signed</p>
            ) : (
              <p className='capitalize'>mark as signed</p>
            )}
          </Button>
          {/* )} */}
          {/* {chalanState?.verified && chalanState?.signed ? ( */}
          {/* "" */}
          {/* ) : ( */}
          {/* <p className="bg-red-600  text-center capitalize text-white px-2 py-1">
                pending
              </p> */}
          {/* )} */}
        </div>
        <div className='w-full flex justify-between p-2'>
          <p className='text-red-600 italic'>
            Total price does not includes items with &#34;fixed&#34; quantity
          </p>
          {/* {chalanState?.relatedToInvoice ? ( */}
          {/* <button
            disabled
            className="bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded"
          >
            Invoice already created
          </button> */}
          {/* ) : ( */}
          <div className='flex flex-col gap-2'>
            <div className='flex justify-end'>
              <button
                onClick={handleDeleteChalan}
                className='bg-red-700 text-white px-4 py-2 mx-2 rounded'
              >
                Delete Chalan
              </button>
              <Button
                disabled={!chalan?.verified}
                className='bg-green-700 text-white px-4 py-2 rounded'
                onClick={() => mergeSelectedChalans(chalan)}
              >
                Create invoice
              </Button>
            </div>
            {!chalan?.verified && (
              <p className='text-gray-500'>
                Please mark chalan verified to create invoice
              </p>
            )}
          </div>
        </div>{' '}
      </div>
    </div>
  );
};

export default IndividualChalanContainer;

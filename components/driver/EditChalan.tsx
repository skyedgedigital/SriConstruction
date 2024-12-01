'use client';

import { Button } from '../ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CircleX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import itemAction from '@/lib/actions/item/itemAction';
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
import toast from 'react-hot-toast';
import departmentAction from '@/lib/actions/department/departmentAction';
import workOrderAction from '@/lib/actions/workOrder/workOrderAction';
import engineerAction from '@/lib/actions/engineer/engineerAction';
import chalanAction from '@/lib/actions/chalan/chalanAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import { IChalan } from '@/interfaces/chalan.interface';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const zodInputStringPipe = (zodPipe: ZodTypeAny) =>
  z
    .string()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .refine((value) => value === null || !isNaN(Number(value)), {
      message: 'Number Invalid',
    })
    .transform((value) => (value === null ? 0 : Number(value)))
    .pipe(zodPipe);

const chalanSchema = z.object({
  workOrder: z.string().trim().min(1, 'Required'), // Allow optional workOrder
  department: z.string().trim().min(1, 'Required'), // Allow optional department
  engineer: z.string().trim().min(1, 'Required'),
  // date: z.string().transform((str) => (str ? new Date(str) : undefined)).optional(),
  date: z.coerce.date({
    errorMap: (issue, { defaultError }) => ({
      message: issue.code === 'invalid_date' ? 'Required' : defaultError,
    }),
  }),
  chalanNumber: z.string().trim().min(1, 'Required'),
  location: z.string().optional(),
  workDescription: z.string().optional(),
  file: z
    .any()
    .refine((file) => file?.length >= 1, 'File is required.')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type),
      'Only .jpg, .jpeg and .png formats are supported.'
    )
    .optional(),
  status: z.enum(['approved', 'pending', 'unsigned', 'generated']),
  items: z
    .array(
      z.object({
        item: z.string(),
        vehicleNumber: z.string().optional(),
        unit: z.string().optional(),
        hours: zodInputStringPipe(
          z.number().positive('Value must be greater than 0')
        ), // Allow optional hours
        startTime: z
          .string()
          .regex(
            /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            'Invalid time format (HH:MM)'
          ),
        endTime: z
          .string()
          .regex(
            /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            'Invalid time format (HH:MM)'
          ),
      })
    )
    .min(1, 'Atleast one item is required!!'),
  commentByDriver: z.string().optional(),
  commentByFleetManager: z.string().optional(),
});

type FormFields = z.infer<typeof chalanSchema>;

const EditChalan = () => {
  const [prefilledDepartment, setPrefilledDepartment] = useState({
    department: '',
    isPrefilled: false,
  });
  const [prefilledWorkOrder, setPrefilledWorkOrder] = useState({
    workOrder: '',
    isPrefilled: false,
  });
  const [selectedChalan, setSelectedChalan] = useState<any>(null);

  const [allVehicleNumbers, setAllVehicleNumbers] = useState<string[]>([]);
  const [allChalanNumbers, setAllChalanNumbers] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [allDepartments, setAllDepartments] = useState<string[]>([]);
  const [file, setFile] = useState();
  const [department, setDepartment] = useState('');
  const [chalanNumber, setChalanNumber] = useState('');

  const [workOrder, setWorkOrder] = useState('');

  const [
    selectedWorkOrderObjectItemOptionsArray,
    setSelectedWorkOrderObjectItemsOptionsArray,
  ] = useState<any>([]);

  const [fetchedWorkOrderOptions, setFetchedWorkOrderOptions] = useState([]);
  const [fetchedEngineerNames, setFetchedEngineerNames] = useState([]);

  const form = useForm<FormFields>({
    defaultValues: {
      workOrder: '', // Allow optional workOrder
      department: '', // Allow optional department
      engineer: '',
      date: undefined,
      chalanNumber: '',
      location: '',
      workDescription: '',
      status: 'unsigned',
      items: [],
      commentByDriver: '',
      commentByFleetManager: '',
    },
    resolver: zodResolver(chalanSchema),
  });

  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: form.control,
  });

  const onSubmit: SubmitHandler<FormFields> = async (
    receivedChalan: FormFields
  ) => {
    try {
      console.log('chalan submitted', receivedChalan);
      receivedChalan.file = 'wowokk';
      console.log(selectedChalan._id);
      const { chalanNumber, ...update } = receivedChalan;
      const updatedData = await JSON.stringify(update);

      const res = await chalanAction.UPDATE.updateChalan(
        selectedChalan._id,
        updatedData
      );

      if (res.success) {
        toast.success(res.message);
        form.reset({
          workOrder: '', // Allow optional workOrder
          department: '', // Allow optional department
          engineer: '',
          date: undefined,
          chalanNumber: '',
          location: '',
          workDescription: '',
          file: undefined,
          status: 'unsigned',
          items: [],
          commentByDriver: '',
          commentByFleetManager: '',
        });
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const { data, success, message } =
        await vehicleAction.FETCH.fetchAllVehicles();

      if (success) {
        const vehicleNumbers = data.map((vehicle) => vehicle.vehicleNumber);
        setAllVehicleNumbers(vehicleNumbers);
      } else {
        toast.error(message || 'can not fetch vehicle numbers!');
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const { data, success, message } =
        await chalanAction.FETCH.getAllChalans();
      const chalans = await JSON.parse(data);
      if (success) {
        const chalanNumbers = chalans.map((chalan) => chalan.chalanNumber);
        setAllChalanNumbers(chalanNumbers);
        console.log(chalanNumbers);
      } else {
        toast.error(message || 'can not fetch chalan numbers!');
      }
    };
    fetch();
  }, []);
  useEffect(() => {
    const fetch = async () => {
      const res = await departmentAction.FETCH.fetchAllDepartments();
      if (res.success) {
        const departments = res.data.map(
          (department) => department.departmentName
        );
        const realdepartments = JSON.parse(JSON.stringify(departments));
        setAllDepartments(realdepartments);
      }
      if (!res.success) {
        toast.error(
          res.message || 'Department options did not fetched.Please try again.'
        );
      }
    };
    fetch();
  }, []);
  useEffect(() => {
    const fetchEngineersData = async () => {
      const res = await engineerAction.FETCH.fetchEngineerByDepartmentName(
        prefilledDepartment.department
      );

      if (res.success) {
        const engineers = res.data
          ? res.data.map((engineer) => engineer.name)
          : [];
        setFetchedEngineerNames(engineers);
      }
      if (!res.success) {
        return toast.error(
          res.message || 'Unable to fetch department details!'
        );
      }
    };
    if (prefilledDepartment.department != '') fetchEngineersData();
  }, [prefilledDepartment]);

  useEffect(() => {
    const setEngineerValue = () => {
      if (prefilledDepartment.isPrefilled) {
        console.log(prefilledDepartment.isPrefilled);
        form.setValue('engineer', selectedChalan?.engineer?.name);
      }
    };

    setEngineerValue();
  }, [fetchedEngineerNames]);

  useEffect(() => {
    const setItemsValue = () => {
      console.log('kya horaaa ayeeeeee');
      if (prefilledWorkOrder.isPrefilled) {
        if (selectedChalan?.items?.length > 0) {
          const chalanItems = selectedChalan?.items?.map((item) => {
            return {
              ...item,
              item: item.item._id,
              hours: item.hours.toString(),
            };
          });
          form.setValue('items', chalanItems);
        }
      }
    };

    setItemsValue();
  }, [selectedWorkOrderObjectItemOptionsArray]);

  useEffect(() => {
    const fetchChalanData = async () => {
      const res = await chalanAction.FETCH.getChalanByChalanNumber(
        chalanNumber
      );
      if (res.success) {
        const chalanDetails = await JSON.parse(res.data);
        console.log(chalanDetails);
        setSelectedChalan(chalanDetails);
        form.setValue(
          'commentByFleetManager',
          chalanDetails.commentByFleetManager
        );
        form.setValue('commentByDriver', chalanDetails.commentByDriver);
        form.setValue('workDescription', chalanDetails.workDescription);

        form.setValue('workOrder', chalanDetails.workOrder.workOrderNumber);
        form.setValue('department', chalanDetails.department.departmentName);
        setPrefilledDepartment({
          department: chalanDetails.department.departmentName,
          isPrefilled: true,
        });
        setPrefilledWorkOrder({
          workOrder: chalanDetails.workOrder.workOrderNumber,
          isPrefilled: true,
        });

        form.setValue('date', chalanDetails.date);
        form.setValue('location', chalanDetails.location);
        form.setValue('status', chalanDetails.status);

        // console.log(chalanDetails)
      }
      if (!res.success) {
        return toast.error(res.message || 'Unable to fetch chalan details!');
      }
    };
    if (chalanNumber != '') fetchChalanData();
  }, [chalanNumber]);

  useEffect(() => {
    const fetchItemsData = async () => {
      const res = await itemAction.FETCH.fetchAllItemOfWorkOrder(
        prefilledWorkOrder.workOrder
      );

      if (res.success) {
        const items = res.data ? res.data : [];
        setSelectedWorkOrderObjectItemsOptionsArray(items);
      }
      if (!res.success) {
        return toast.error(res.message || 'Unable to fetch items!');
      }
    };
    if (prefilledWorkOrder.workOrder != '') fetchItemsData();
  }, [prefilledWorkOrder]);

  useEffect(() => {
    const fetch = async () => {
      // const { success, error, data, message } =
      //   await workOrderAction.FETCH.fetchAllWorkOrder();
      const workOrderResp = await workOrderAction.FETCH.fetchAllWorkOrder();
      const success = workOrderResp.success;
      const error = workOrderResp.message;
      const data = JSON.parse(workOrderResp.data);

      if (!success) {
        return toast.error(
          error || 'Work order options did not fetched.Please try again.'
        );
      }
      if (success) {
        const res = data
          ? data
          : [
              {
                workOrderNumber: '',
                workDescription: '',
                items: {
                  itemName: '',
                  itemPrice: '',
                  han: 'null',
                },
              },
            ];
        setFetchedWorkOrderOptions(data);
      }
    };
    fetch();
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-2 px-2 mr-2 border-2 border-black rounded-md bg-slate-200'
      >
        <h1 className=' bg-primary-color-extreme/10 text-center py-1 text-base   relative  font-semibold '>
          Edit Chalan
        </h1>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          <FormField
            control={form.control}
            name='chalanNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chalan</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                    setChalanNumber(e);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      {field.value ? (
                        <SelectValue placeholder='' />
                      ) : (
                        'Select Chalan No.'
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allChalanNumbers?.map((option, index) => (
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
            name='department'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                    setPrefilledDepartment({
                      department: e,
                      isPrefilled: false,
                    });
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      {field.value ? (
                        <SelectValue placeholder='' />
                      ) : (
                        'Select a Department'
                      )}
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {allDepartments.map((option, index) => (
                      <SelectItem value={option.toString()} key={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
    control={form.control}
    name="workOrder"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Work Order</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
        <SelectTrigger>
                    <SelectValue placeholder="Select work order number" />
                  </SelectTrigger>        </FormControl>
     
                        <SelectContent>
                  <SelectItem value="m@example.com">m@example.com</SelectItem>
                  <SelectItem value="m@google.com">m@google.com</SelectItem>
                  <SelectItem value="m@support.com">m@support.com</SelectItem>
                </SelectContent>
              </Select>

        <FormMessage />
      </FormItem>
    )}
  /> */}

          <FormField
            control={form.control}
            name='workOrder'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Order</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                    setPrefilledWorkOrder({
                      workOrder: e,
                      isPrefilled: false,
                    });
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      {field.value ? (
                        <SelectValue placeholder='' />
                      ) : (
                        'Select Work Order Number'
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fetchedWorkOrderOptions?.map((option, index) => (
                      <SelectItem
                        key={option.workOrderNumber}
                        value={option.workOrderNumber.toLowerCase()}
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
              <FormItem>
                <FormLabel>Engineer</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
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

          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter location'
                    {...field}
                    className=' bg-white '
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='date'
            render={({ field }) => (
              <FormItem className='flex flex-col pt-2 justify-center'>
                <FormLabel>Chalan Validity</FormLabel>
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
            name='workDescription'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Description</FormLabel>
                <FormControl>
                  <Textarea {...field} className=' bg-white ' />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='file'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Work Description</FormLabel>
                <FormControl>
                  <Input
                    type='file'
                    {...fieldProps}
                    className=' bg-white '
                    onChange={(event) =>
                      onChange(event.target.files && event.target.files[0])
                    }
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
    control={form.control}
    name="file"
    render={({ field : { value, onChange, ...fieldProps }}) => (
      <FormItem >
        <FormLabel>Location</FormLabel>
        <FormControl>
        <Input
          {...fieldProps}
          type="file"
          accept="image/*"
           onChange={(event) =>
            onChange(event.target.files && event.target.files[0])
          }
        
        />        </FormControl>
  
        <FormMessage />
      </FormItem>
    )}
  /> */}

          {/* <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { value, onChange, ...fieldProps } }) =>(
                        <FormItem>
                            <FormLabel>images</FormLabel>
                            <FormControl>
                            <Input
          {...fieldProps}
          placeholder="Picture"
          type="file"
          accept="image/*, application/pdf"
          onChange={(event) =>
            onChange(event.target.files && event.target.files[0])
          }
        />                            </FormControl>
                         
                            <FormMessage />
                        </FormItem>
                    )}
                /> */}
          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      {field.value ? (
                        <SelectValue placeholder='' />
                      ) : (
                        'Select Status'
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='approved'>Approved</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='unsigned'>Unsigned</SelectItem>
                    <SelectItem value='generated'>Generated</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='commentByDriver'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment By Driver</FormLabel>
                <FormControl>
                  <Textarea {...field} className=' bg-white ' />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='commentByFleetManager'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment By Fleet Manager</FormLabel>
                <FormControl>
                  <Textarea {...field} className=' bg-white ' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h2 className='text-blue-800 font-bold'>Fill Items</h2>
        {form.formState.errors.items && (
          <p className='text-red-500 italic text-xs'>
            {form.formState.errors.items.message}
          </p>
        )}
        {fields.map((field, index) => (
          <div className='w-full flex flex-col gap-2' key={field.id}>
            <div className='flex flex-row  items-center gap-2'>
              {' '}
              <h2 className='text-blue-800 font-semibold'>{`Item - ${
                index + 1
              }`}</h2>
              {index >= 0 && (
                <span className=' flex flex-col justify-between gap-1'>
                  <span></span>
                  <button
                    onClick={() => remove(index)}
                    className='text-xm w-fit bg-red-600 text-white font-semibold p-2 rounded  '
                  >
                    <CircleX />
                  </button>
                </span>
              )}
            </div>
            <div className='w-full  gap-2 flex flex-col md:flex-row '>
              <FormField
                control={form.control}
                name={`items.${index}.item`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <FormControl>
                          <SelectValue placeholder='Select Item' />
                        </FormControl>
                      </SelectTrigger>
                      <SelectContent>
                        {selectedWorkOrderObjectItemOptionsArray.map(
                          (option, index) => (
                            <SelectItem
                              value={option._id.toString()}
                              key={option._id.toString()}
                            >
                              {option.itemName.toString()}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.vehicleNumber`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name={`items.${index}.unit`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <FormControl>
                          <SelectValue placeholder='Select a unit' />
                        </FormControl>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='minutes'>Minutes</SelectItem>
                        <SelectItem value='hours'>Hours</SelectItem>
                        <SelectItem value='days'>Days</SelectItem>
                        <SelectItem value='months'>Months</SelectItem>
                        <SelectItem value='fixed'>Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.hours`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input type='number' {...field} className=' bg-white ' />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.startTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start TIme</FormLabel>
                    <FormControl>
                      <Input type='time' {...field} className=' bg-white ' />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.endTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type='time' {...field} className=' bg-white ' />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
        <div className=' flex flex-col gap-3 sm:flex-row md:justify-between py-4'>
          <Button
            className='w-40'
            onClick={(e) => {
              e.preventDefault();
              append({
                item: '',
                vehicleNumber: '',
                unit: 'hours',
                hours: '',
                startTime: '',
                endTime: '',
              });
            }}
          >
            Add Item
          </Button>
          <Button type='submit' className=' bg-green-500 w-40 '>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditChalan;

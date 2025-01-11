'use client';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from '@/components/ui/select';
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
import employeeAction from '@/lib/actions/employee/employeeAction';
import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import attendanceAction from '@/lib/actions/attendance/attendanceAction';
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
import { z, ZodTypeAny } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import wagesAction from '@/lib/actions/HR/wages/wagesAction';
import ComplianceRegisterAction from '@/lib/actions/HR/compliance-and-register/complianceRegisterAction';

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
  employee: z.string().optional(),
  year: z.string().optional(),
  month: z.string().optional(),
  basic: z.string().optional(),
  vda: z.string().optional(),
  des: z.string().optional(),

  hra: zodInputStringPipe(z.number().nonnegative('Value must be non-negative')),
  mob: zodInputStringPipe(z.number().nonnegative('Value must be non-negative')),
  incumb: zodInputStringPipe(
    z.number().nonnegative('Value must be non-negative')
  ),
  eoc: zodInputStringPipe(z.number().nonnegative('Value must be non-negative')),
  pb: zodInputStringPipe(z.number().nonnegative('Value must be non-negative')),
  wa: zodInputStringPipe(z.number().nonnegative('Value must be non-negative')),
  ca: zodInputStringPipe(z.number().nonnegative('Value must be non-negative')),
  ma: zodInputStringPipe(z.number().nonnegative('Value must be non-negative')),
  ssa: zodInputStringPipe(z.number().nonnegative('Value must be non-negative')),
  oa: zodInputStringPipe(z.number().nonnegative('Value must be non-negative')),
  fine: zodInputStringPipe(
    z.number().nonnegative('Value must be non-negative')
  ),
  ad: z.string().optional(),
  da: z.string().optional(),
  dppe: zodInputStringPipe(
    z.number().nonnegative('Value must be non-negative')
  ),
  od: zodInputStringPipe(z.number().nonnegative('Value must be non-negative')),
});

type FormFields = z.infer<typeof schema>;
const AddWage = ({ employeee }) => {
  console.log('mast employee bhai', employeee);
  let parsed_otherCashDescription = undefined;
  let parsed_otherDeductionDescription = undefined;
  if (employeee?.existingWage) {
    // return;
    parsed_otherCashDescription = JSON.parse(
      employeee.existingWage?.otherCashDescription
    );
    parsed_otherDeductionDescription = JSON.parse(
      employeee.existingWage?.otherDeductionDescription
    );
  }
  const form = useForm<FormFields>({
    defaultValues: {
      employee: employeee.name,
      year: employeee.year,
      month: employeee.month,
      basic: employeee.existingWage?.basic
        ? employeee.existingWage?.basic
        : employeee?.designation?.basic,
      vda: employeee.existingWage?.DA
        ? employeee.existingWage?.DA
        : employeee?.designation?.DA,
      des: employeee?.designation?.designation,

      hra: parsed_otherCashDescription?.hra?.toFixed(2) || '',
      mob: parsed_otherCashDescription?.mob?.toFixed(2) || '',
      incumb: parsed_otherCashDescription?.incumb?.toFixed(2) || '',
      eoc: employeee?.existingWage?.otherCash?.toFixed(2) || '',
      pb: parsed_otherCashDescription?.pb?.toFixed(2) || '',
      wa: parsed_otherCashDescription?.wa?.toFixed(2) || '',
      ca: parsed_otherCashDescription?.ca?.toFixed(2) || '',
      ma: parsed_otherCashDescription?.ma?.toFixed(2) || '',
      ssa: parsed_otherCashDescription?.ssa?.toFixed(2) || '',
      fine: parsed_otherDeductionDescription?.fine?.toFixed(2) || '',
      ad: employeee?.existingWage?.advanceDeduction?.toFixed(2) || '', //this
      da: employeee.existingWage?.damageDeduction?.toFixed(2) || '', //this
      oa: parsed_otherCashDescription?.oa?.toFixed(2) || '',
      dppe: parsed_otherDeductionDescription?.dppe?.toFixed(2) || '',
      od: parsed_otherDeductionDescription?.od?.toFixed(2) || '',
    },
    resolver: zodResolver(schema),
  });

  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  const [incentiveCheckboxStatus, setIncentiveCheckboxStatus] = useState(
    employeee?.existingWage?.incentiveApplicable
  );

  const [isDamageDeduction, setIsDamageDeduction] = useState(false);
  const [alreadyDamageDeduction, setAlreadyDamageDeduction] = useState(
    employeee?.existingWage?.isDamageDeduction
  );
  const [isAdvanceDeduction, setIsAdvanceDeduction] = useState(false);
  const [alreadyAdvanceDeduction, setAlreadyAdvanceDeduction] = useState(
    employeee?.existingWage?.isAdvanceDeduction
  );

  // advance and damage deduction calulaitnos

  const [pendingAdvanceDeduction, setPendingAdvanceDeduction] = useState(null);
  const [pendingDamageDeduction, setPendingDamageDeduction] = useState(null);

  const [selectedAdvanceId, setSelectedAdvanceId] = useState<string | null>(
    null
  );
  const [advanceDeductionAmount, setAdvanceDeductionAmount] = useState(
    employeee?.existingWage?.advanceDeduction || 0
  );

  const [selectedDamageId, setSelectedDamageId] = useState<string | null>(null);
  const [damageDeductionAmount, setDamageDeductionAmount] = useState(
    employeee?.existingWage?.damageDeduction || 0
  );

  const handleAdvanceSelection = (advanceId: string) => {
    const selectedAdvance = employeee.employee.advanceRegister?.find(
      (adv: any) => adv?._id === advanceId
    );

    if (
      selectedAdvance &&
      selectedAdvance.installmentsLeft > 0 &&
      !employeee.existingWage?.isAdvanceDeduction
    ) {
      const deductionAmount =
        selectedAdvance.amountOfAdvanceGiven /
        selectedAdvance.numberOfInstallments;
      setAdvanceDeductionAmount(deductionAmount);
      setSelectedAdvanceId(advanceId);
      setPendingAdvanceDeduction(advanceId); // Store selection as pending
      setIsAdvanceDeduction(true);
      console.log('setIsAdvanceDeduction', isAdvanceDeduction);
    } else {
      toast.error('Advance deduction already applied or invalid selection.');
      setAdvanceDeductionAmount(0);
    }
  };

  const handleDamageSelection = (damageId: string) => {
    const selectedDamage = employeee.employee.damageRegister?.find(
      (dam: any) => dam._id === damageId
    );

    if (
      selectedDamage &&
      selectedDamage.installmentsLeft > 0 &&
      !employeee.existingWage?.isDamageDeduction
    ) {
      const deductionAmount =
        selectedDamage.amountOfDeductionImposed /
        selectedDamage.numberOfInstallments;
      setDamageDeductionAmount(deductionAmount);
      setSelectedDamageId(damageId);
      setPendingDamageDeduction(damageId); // Store selection as pending
      setIsDamageDeduction(true);
      console.log('setIsDamageDeduction', isDamageDeduction);
    } else {
      toast.error('Damage deduction already applied or invalid selection.');
      setDamageDeductionAmount(0);
    }
  };

  const handleToggle = (e) => {
    const status = e.target.checked;
    setIncentiveCheckboxStatus(status);
  };

  useEffect(() => {
    const fn = async () => {
      form.setValue('employee', employeee.name);
      form.setValue('year', employeee.year);
      form.setValue('month', employeee.month);
      form.setValue('basic', employeee?.existingWage?.designation?.basic);
      form.setValue('vda', employeee?.existingWage?.designation?.DA);
      const resp = await EmployeeDataAction.FETCH.fetchAllEmployeeData();
      console.log(resp);
      if (resp.data) {
        const data = await JSON.parse(resp.data);
        setEmployees(data);
        console.log('data **', data);
      }
    };
    fn();
  }, []);

  useEffect(() => {
    console.log('USER ID: ', employeee.employee.advanceRegister);
    console.log(
      'IS APPLICABLE gfd: ',
      employeee?.existingWage?.isAdvanceDeduction,
      employeee?.existingWage?.isDamageDeduction
    );
    console.log(
      'AMOUNT *****',
      employeee?.existingWage?.advanceDeduction,
      employeee?.existingWage?.damageDeduction
    );
  }, []);

  useEffect(() => {
    console.log('IS APPLICABLE NEW: ', isAdvanceDeduction, isDamageDeduction);
  }, [isAdvanceDeduction, isDamageDeduction]);

  const years = Array.from({ length: 2024 - 2010 + 1 }, (_, i) => 2010 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const onSubmit: SubmitHandler<FormFields> = async (formData: FormFields) => {
    try {
      console.log(formData);
      setAttendanceData(null);
      console.log('employeee aato ra ha', employeee);
      const newData = {
        wo: employeee.wo,
        basic: parseFloat(formData.basic),
        DA: parseFloat(formData.vda),
        employee: employeee.id,
        month: parseFloat(employeee.month),
        year: parseFloat(employeee.year), // No explicit radix
        incentiveApplicable: incentiveCheckboxStatus,
        damageDeduction: damageDeductionAmount,
        advanceDeduction: advanceDeductionAmount,
        isAdvanceDeduction: isAdvanceDeduction,
        isDamageDeduction: isDamageDeduction,
        otherCash: {
          // basic: parseFloat(formData.basic),
          // vda: parseFloat(formData.vda),
          hra: parseFloat(formData.hra),
          mob: parseFloat(formData.mob),
          incumb: parseFloat(formData.incumb),
          eoc: parseFloat(formData.eoc),
          pb: parseFloat(formData.pb),
          wa: parseFloat(formData.wa),
          ca: parseFloat(formData.ca),
          ma: parseFloat(formData.ma),
          ssa: parseFloat(formData.ssa),
          oa: parseFloat(formData.oa),
        },
        otherDeduction: {
          fine: parseFloat(formData.fine),
          od: parseFloat(formData.od),
          dppe: parseFloat(formData.dppe),
        },
      };

      console.log('NOTICE: ', isDamageDeduction, isDamageDeduction);

      const filter = await JSON.stringify(newData);
      setEmployeeData(filter);

      // Update installments for advance if selected
      try {
        if (
          pendingAdvanceDeduction &&
          !employeee?.existingWage?.isAdvaceDeduction
        ) {
          console.warn(employeee?.id, pendingAdvanceDeduction);
          const resp =
            await ComplianceRegisterAction.UPDATE.updateAdvanceInstallment(
              employeee.id,
              pendingAdvanceDeduction
            );
          if (resp.success) {
            toast.success(resp.message);
            console.log('updated register', resp.data);
          } else {
            toast.error('Advance Installment Deduction Failed!!');
            console.log('ERROR of INSTALLMENT', resp.message);
          }
          setPendingAdvanceDeduction(null); // Reset state after update
        }
      } catch (error) {
        console.error('Error updating advance installment:', error);
      }

      // Update installments for damage if selected
      try {
        if (
          pendingDamageDeduction &&
          !employeee?.existingWage?.isDamageDeduction
        ) {
          console.warn(employeee?.id, pendingDamageDeduction);
          const resp =
            await ComplianceRegisterAction.UPDATE.updateDamageInstallment(
              employeee.id,
              pendingDamageDeduction
            );
          if (resp.success) {
            toast.success(resp.message);
            console.log('updated register', resp.data);
          } else {
            toast.error(resp.message);
            console.log('ERROR of INSTALLMENT', resp.message);
          }
          setPendingDamageDeduction(null); // Reset state after update
        }
      } catch (error) {
        console.error('Error updating damage installment:', error);
      }

      const response = await wagesAction.CREATE.createWage(filter);

      if (response.success) {
        const responseData = JSON.parse(response.data);
        toast.success(response.message);
        setAttendanceData(responseData);
        console.log('aagya response', responseData);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Internal Server Error!!!: ', error);
      console.error('Internal Server Error ***:', error);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-2 px-2 mr-2 border-2 border-black rounded-md bg-slate-200 flex flex-col gap-3'
        >
          <div className='mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
            <FormField
              control={form.control}
              name='employee'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder=''
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
              name='des'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder=''
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
              name='year'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder=''
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
              name='month'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder=''
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
              name='basic'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BASIC</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      disabled
                      placeholder=''
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
              name='vda'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VDA</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      disabled
                      placeholder=''
                      {...field}
                      className=' bg-white '
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='w-full'>
            <h2 className='font-bold text-black my-1'>Additions:</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 '>
              {/* ALLOWANCES */}
              <FormField
                control={form.control}
                name='hra'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HRA for Workmen</FormLabel>
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
                          placeholder='Enter HRA'
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
                name='mob'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Mobile Allowance</FormLabel>
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
                          placeholder='Enter Monthly Mobile Allowance'
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
                name='incumb'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Incumbent Allowance</FormLabel>
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
                          placeholder='Enter Monthly Incumbent Allowance'
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
                name='eoc'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Earned Other Cash</FormLabel>
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
                          placeholder='Enter EOC'
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
                name='pb'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Performance Bonus</FormLabel>
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
                          placeholder='Enter Performance Bonus'
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
                name='wa'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Washing Allowance</FormLabel>
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
                          placeholder='Enter Washing Allowance'
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
                name='ca'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conveyance Allowance</FormLabel>
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
                          placeholder='Enter Conveyance Allowance'
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
                name='ma'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Allowance</FormLabel>
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
                          placeholder='Enter Medical Allowance'
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
                name='ssa'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Specific Allowance</FormLabel>
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
                          placeholder='Enter Site Specific Allowance'
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
                name='oa'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Allowance</FormLabel>
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
                          placeholder='Enter Other Allowances'
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
          </div>
          <div className='w-full'>
            <h2 className='font-bold text-black my-1'>Deductions:</h2>
            {/* DEDUCTIONS */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 '>
              <FormField
                control={form.control}
                name='fine'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fine</FormLabel>
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
                          placeholder='Enter Fine'
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
                name='ad'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advance Deduction</FormLabel>
                    <FormControl>
                      {!employeee?.existingWage?.isAdvaceDeduction && (
                        <Select
                          value={selectedAdvanceId || ''}
                          disabled={
                            employeee?.existingWage?.isAdvanceDeduction ||
                            alreadyAdvanceDeduction
                          }
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleAdvanceSelection(value);
                          }}
                        >
                          <SelectTrigger className='w-full bg-white'>
                            <SelectValue
                              placeholder={
                                employeee?.existingWage?.isAdvanceDeduction
                                  ? 'Already Deducted'
                                  : 'Select the amount given'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {employeee.employee.advanceRegister
                              ?.filter(
                                (adv: any) =>
                                  adv != null && adv.installmentsLeft > 0
                              )
                              .map((adv: any) => (
                                <SelectItem key={adv._id} value={adv._id}>
                                  {adv.amountOfAdvanceGiven +
                                    ' - ' +
                                    adv.purposeOfAdvanceGiven}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormLabel className='text-red-700'>
                      {advanceDeductionAmount > 0
                        ? `Installment: -${advanceDeductionAmount}`
                        : ''}
                    </FormLabel>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='ad'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Damage Deduction</FormLabel>
                    <FormControl>
                      <Select
                        value={selectedDamageId || ''}
                        disabled={
                          employeee?.existingWage?.isDamageDeduction ||
                          alreadyDamageDeduction
                        }
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleDamageSelection(value);
                        }}
                      >
                        <SelectTrigger className='w-full bg-white'>
                          <SelectValue
                            placeholder={
                              employeee?.existingWage?.isDamageDeduction
                                ? 'Already Deducted'
                                : 'Select the amount given'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {employeee.employee.damageRegister
                            ?.filter(
                              (adv: any) =>
                                adv != null && adv.installmentsLeft > 0
                            )
                            .map((adv: any) => (
                              <SelectItem key={adv._id} value={adv._id}>
                                {adv.amountOfDeductionImposed +
                                  ' - ' +
                                  adv.particularsOfDamageOrLoss}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormLabel className='text-red-700'>
                      {damageDeductionAmount > 0
                        ? `Installment: -${damageDeductionAmount}`
                        : ''}
                    </FormLabel>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='dppe'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deduction for PPE</FormLabel>
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
                          placeholder='Enter Deduction for PPE'
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
                name='od'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Deduction</FormLabel>
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
                          placeholder='Enter Other Deductions'
                          {...field}
                          className=' bg-white '
                        />
                      )}
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='py-0 flex items-center justify-center'>
                <label className='inline-flex items-center cursor-pointer gap-2'>
                  <input
                    type='checkbox'
                    className='sr-only peer'
                    checked={incentiveCheckboxStatus}
                    onChange={handleToggle}
                  />
                  <span className='ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 mr-2'>
                    Incentive Applicable:
                  </span>
                  <div
                    className={`relative w-11 h-6 bg-gray-200  dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full  after:content-[''] after:absolute after:top-[1px] after:start-[2px]  after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${
                      !incentiveCheckboxStatus
                        ? 'border-[0.5px] border-gray-600'
                        : ''
                    }`}
                  ></div>
                </label>
              </div>
            </div>
          </div>

          <div className='py-4 '>
            <Button
              type='submit'
              className='flex items-center gap-1 border-2 border-black px-4 mb-2 rounded bg-green-500 text-white'
              // onClick={handleSubmit(onSubmit)}
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Save Wage</>
            </Button>
          </div>
        </form>
      </Form>

      {/* {attendanceData && createAttendanceTable(attendanceData)} */}
    </div>
  );
};

export default AddWage;

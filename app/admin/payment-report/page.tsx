'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { Button } from '@/components/ui/button';

import {
  Form,
  FormControl,
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
import { Loader2 } from 'lucide-react';
import AdminAnalytics from '@/lib/actions/adminAnalytics/adminAnalyticsAction';
import { formatCurrency } from '../../../utils/formatCurrency';
import { months, monthsName, years } from '@/constants';

const schema = z.object({
  year: z.string().trim().min(1, 'Required'),
  month: z.string().trim().min(1, 'Required'),
});

type FormFields = z.infer<typeof schema>;
const Client = () => {
  const router = useRouter();
  const form = useForm<FormFields>({
    defaultValues: {
      year: '',
      month: '',
    },
    resolver: zodResolver(schema),
  });
  const [workOrderNumber, setWorkOrderNumber] = useState<any>(null);

  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);

  const [reportData, setReportData] = useState<any[]>([]);

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      const {
        data: receivedPaymentReportData,
        message,
        warnings,
        status,
        success,
      } = await AdminAnalytics.fetchPaymentReport(JSON.stringify(data));

      if (success) {
        const parsedData = JSON.parse(receivedPaymentReportData);
        console.log(parsedData);
        setReportData(parsedData);
        toast.success(message);
      } else {
        toast.error(message);
      }
      if (warnings) {
        //WARNING FUNCTIONALITY NOT COMPLETED
        warnings.forEach((warning) => {
          toast.error(warning, {
            duration: 5000,
          });
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form');
    }
  };

  const totalEmployeeCount =
    Math.round(
      reportData.reduce((sum, row) => sum + row.employeeCount, 0)
    ).toFixed(0) || 0;
  const totalAttendance =
    reportData.reduce((sum, row) => sum + row.totalAttendance, 0).toFixed(0) ||
    0;
  const totalAllowances =
    Math.round(
      reportData.reduce((sum, row) => sum + row.totalAllowancesAmount, 0)
    ) || 0;
  const totalIncentives =
    Math.round(
      reportData.reduce((sum, row) => sum + row.totalIncentiveAmount, 0)
    ) || 0;
  const totalGrossAmount =
    Math.round(reportData.reduce((sum, row) => sum + row.totalAmount, 0)) || 0;
  const totalPF =
    Math.round(reportData.reduce((sum, row) => sum + row.totalPF, 0)) || 0;
  const totalESIC =
    Math.round(reportData.reduce((sum, row) => sum + row.totalESIC, 0)) || 0;
  const totalEmployerPF =
    Math.round(reportData.reduce((sum, row) => sum + row.totalEmployerPF, 0)) ||
    0;
  const totalEmployerESIC =
    Math.round(
      reportData.reduce((sum, row) => sum + row.totalEmployerESIC, 0)
    ) || 0;
  const totalNetAmount =
    Math.round(reportData.reduce((sum, row) => sum + row.totalNetAmount, 0)) ||
    0;

  return (
    <div>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Payment Report
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
        >
          <h2 className=' bg-primary-color-extreme/10 text-center py-1 text-base   relative   '>
            Select Year and Month
          </h2>
          <div className='flex flex-col md:flex-row p-3 gap-4'>
            <FormField
              control={form.control}
              name='year'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Year</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      // console.log(e);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        {field.value ? (
                          <SelectValue placeholder='' />
                        ) : (
                          'Select Year'
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-w-80 max-h-72'>
                      {years?.map((option, index) => (
                        <SelectItem
                          value={option.toString()}
                          key={option + 'tum'}
                        >
                          {option.toString()}
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
              name='month'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Month</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      // setWorkOrderNumber(e)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        {field.value ? (
                          <SelectValue placeholder='' />
                        ) : (
                          'Select Month'
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-w-80 max-h-72'>
                      {months?.map((option, index) => (
                        <SelectItem
                          value={option.toString()}
                          key={option + 'lum' + index}
                        >
                          {monthsName[option - 1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='p-4 flex flex-col md:flex-row gap-2 justify-center items-center'>
            <Button
              type='submit'
              className='flex items-center gap-1 border-2 border-black px-4 mb-2 rounded bg-green-500 text-white'
              value='SL'
              // onClick={handleSubmit(onSubmit)}
            >
              {form.formState.isSubmitting && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              <>Show List</>
            </Button>
          </div>
        </form>
      </Form>

      {reportData.length > 0 && (
        <div className='mt-6'>
          <Table className='border-[1px] border-gray-200'>
            <TableHeader className='bg-gray-600'>
              <TableRow>
                <TableHead className='text-white'>Sl No</TableHead>
                <TableHead className='text-white'>Work Order Number</TableHead>
                <TableHead className='text-white'>Location</TableHead>
                <TableHead className='text-white'>Number of Worker</TableHead>
                <TableHead className='text-white'>Man Days</TableHead>
                <TableHead className='text-white'>Total Allowances</TableHead>
                <TableHead className='text-white'>Total Incentive</TableHead>
                <TableHead className='text-white'>Gross Amount</TableHead>
                <TableHead className='text-white'>Total PF</TableHead>
                <TableHead className='text-white'>Total ESIC</TableHead>
                <TableHead className='text-white'>Total Employer PF</TableHead>
                <TableHead className='text-white'>
                  Total Employer ESIC
                </TableHead>
                <TableHead className='text-white'>Net Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((row, index) => (
                <TableRow
                  key={row.workOrderNumber || index}
                  className='border-b-[1px] border-gray-200'
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.workOrderNumber}</TableCell>
                  <TableCell>{row.workOrderDetails.location}</TableCell>
                  <TableCell>{row.employeeCount.toFixed(0)}</TableCell>
                  <TableCell>{row.totalAttendance.toFixed(0)}</TableCell>
                  <TableCell>
                    {formatCurrency(Math.round(row.totalAllowancesAmount))}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Math.round(row.totalIncentiveAmount))}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Math.round(row.totalAmount))}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Math.round(row.totalPF))}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Math.round(row.totalESIC))}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Math.round(row.totalEmployerPF))}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Math.round(row.totalEmployerESIC))}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Math.round(row.totalNetAmount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className='bg-gray-600 text-white'>
              <TableRow>
                <TableCell>-</TableCell>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell>{totalEmployeeCount}</TableCell>
                <TableCell>{totalAttendance}</TableCell>
                <TableCell>{formatCurrency(totalAllowances)}</TableCell>
                <TableCell>{formatCurrency(totalIncentives)}</TableCell>
                <TableCell>{formatCurrency(totalGrossAmount)}</TableCell>
                <TableCell>{formatCurrency(totalPF)}</TableCell>
                <TableCell>{formatCurrency(totalESIC)}</TableCell>
                <TableCell>{formatCurrency(totalEmployerPF)}</TableCell>
                <TableCell>{formatCurrency(totalEmployerESIC)}</TableCell>
                <TableCell>{formatCurrency(totalNetAmount)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Client;

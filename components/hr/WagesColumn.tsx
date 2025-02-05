'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import AddAttendance from './addAttendance';
import toast from 'react-hot-toast';
import AddWage from './addwage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  LargeDialogContent,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import workOrderAction from '@/lib/actions/workOrder/workOrderAction';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import itemAction from '@/lib/actions/item/itemAction';
import ViewEmployeeDetails from './ViewEmployeeDetails';
import { IEmployeeData } from '@/interfaces/HR/EmployeeData.interface';

export type EmployeeData = {
  serial: number;

  name: String;

  code: String;

  attendance: Number;
  employee: IEmployeeData;
  wages: String;
};

export const wagesColumns: ColumnDef<EmployeeData>[] = [
  {
    accessorKey: 'serial',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Sl.No.
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },

  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Employee Name
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },
  {
    accessorKey: 'code',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Employee Code
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
    cell: ({ row }) => {
      const value: string = row.original.employee.code;
      console.log('original hai boss code', row.original.employee);
      return (
        // @ts-ignore
        <Dialog>
          <DialogTrigger className='underline font-bold'>{value}</DialogTrigger>
          <LargeDialogContent className=' w-5/6 max-w-full '>
            <DialogHeader>
              <DialogDescription className=' '>
                <ViewEmployeeDetails employeeData={row.original.employee} />
              </DialogDescription>
            </DialogHeader>
          </LargeDialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: 'attendance',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Attendance
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
    cell: ({ row }) => {
      const value: any = row.original.attendance;
      console.log('original hai boss', row.original);
      return (
        // @ts-ignore
        <Dialog>
          <DialogTrigger className='text-green-500 font-bold'>
            {value}
          </DialogTrigger>
          <LargeDialogContent className=' w-5/6 max-w-full '>
            <DialogHeader>
              {/* <DialogTitle>Edit Attendance</DialogTitle> */}
              <DialogDescription className=' '>
                <AddAttendance employeee={row.original} />
              </DialogDescription>
            </DialogHeader>
          </LargeDialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: 'wages',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Wages
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
    cell: ({ row }: any) => {
      const value = row.original.wages;
      console.log('original hai boss', row.original);
      const color =
        value === 'Filled'
          ? 'text-green-600 font-bold'
          : 'text-red-500 font-bold';
      return (
        <Dialog>
          <DialogTrigger className={color}>{value}</DialogTrigger>
          <LargeDialogContent className=' w-5/6 max-w-full '>
            <DialogHeader>
              <DialogTitle>Save/Update Wages</DialogTitle>
              <DialogDescription className=''>
                {row?.original?.isAttendance ? (
                  <AddWage employeee={row.original} />
                ) : (
                  <div>Please fill attendance first</div>
                )}
              </DialogDescription>
            </DialogHeader>
          </LargeDialogContent>
        </Dialog>
      );
    },
  },

  {
    id: 'actions',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Payment
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },

    cell: ({ row }) => {
      const payment: any = row.original;

      const value = row.original.attendance;
      console.log('original hai boss', row.original);
      return (
        <Dialog>
          <DialogTrigger>
            <Button className='bg-blue-500 '>Show</Button>
          </DialogTrigger>
          <LargeDialogContent className=' w-5/6 max-w-full '>
            <DialogHeader>
              <DialogTitle>Payment</DialogTitle>
              <DialogDescription className=' '>
                {payment.existingWage ? (
                  <Table className='border-2 border-black  '>
                    <TableHeader className=' py-8 h-16 overflow-auto '>
                      <TableRow className='text-black'>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          Name
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          No. of days worked
                        </TableHead>
                        {/* Table headers for each day */}

                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          Basic
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          VDA
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          Overtime
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          Other Cash
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          Other Allowances
                        </TableHead>

                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          Total
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          PF
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          ESI
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          Other Deduction
                        </TableHead>
                        <TableHead className='bg-slate-400 text-black border-2 border-black'>
                          NET PAYMENT
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className='h-16'>
                        <TableCell className='border-black border-2 text-black'>
                          {payment.name}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black'>
                          {payment.attendance}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black'>
                          {payment.existingWage?.basic}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black'>
                          {payment.existingWage?.DA}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black'>
                          0
                        </TableCell>
                        <TableCell className='border-black border-2 text-black'>
                          {payment.existingWage.otherCash.toFixed(2)}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black'>
                          {payment.existingWage.allowances}
                        </TableCell>

                        <TableCell className='border-black border-2 text-black'>
                          {Math.round(payment.existingWage.total).toFixed(2)}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black'>
                          {' '}
                          {Math.round(
                            0.12 *
                              (Number(payment?.existingWage.attendance) *
                                Number(payment?.existingWage.payRate))
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black'>
                          {payment?.employee?.ESICApplicable &&
                          payment.existingWage.total < 21000
                            ? Math.round(
                                0.0075 * payment.existingWage.total
                              ).toFixed(2)
                            : 0}
                        </TableCell>
                        <TableCell className='border-black border-2 text-black'>
                          0
                        </TableCell>
                        <TableCell className='border-black border-2 text-black'>
                          {Math.ceil(
                            payment.existingWage.netAmountPaid
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <div>Wages Not Filled Yet</div>
                )}
              </DialogDescription>
            </DialogHeader>
          </LargeDialogContent>
        </Dialog>
      );
    },
  },
  {
    id: 'actions',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Actions
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Button
          disabled={row.original.wages === 'Not Filled'}
          onClick={() => {
            const query = { employee: JSON.stringify(row?.original) };
            const queryString = new URLSearchParams(query).toString();

            window.open(`/hr/wages-pay-slip?${queryString}`, '_blank');
          }}
        >
          Generate Wages Pay Slip
        </Button>
      );
    },
  },
];

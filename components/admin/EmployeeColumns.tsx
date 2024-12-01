'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import employeeAction from '@/lib/actions/employee/employeeAction';

export type Employee = {
  name: string;
  phoneNo: Number;
  aadharNo: Number;
};

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },

  {
    accessorKey: 'phoneNo',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Phone No.
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },
  {
    accessorKey: 'aadharNo',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Aadhar No.
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },
  {
    id: 'actions',

    cell: ({ row }) => {
      const employee = row.original;

      const handleDeleteEmployee = async (aadharNo: Number) => {
        console.log(`Deleting employee!`);
        try {
          const res = await employeeAction.DELETE.deleteEmployee({ aadharNo });

          if (res.success) {
            toast.success(res.message!);
          }
          if (!res.success) {
            toast.error(
             res?.message || 'Unable to delete employee!'
            );
          }
        } catch (error) {
          console.error(`Error deleting employee: ${error}`);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => handleDeleteEmployee(employee.aadharNo)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

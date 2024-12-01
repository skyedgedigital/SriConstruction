'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import engineerAction from '@/lib/actions/engineer/engineerAction';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import employeeAction from '@/lib/actions/employee/employeeAction';

export type Engineer = {
  name: string;
  department: string;
};

export const columns: ColumnDef<Engineer>[] = [
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
    accessorKey: 'department',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Department {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },

  {
    id: 'actions',

    cell: ({ row }) => {
      const engineer = row.original;

      const handleDeleteEngineer = async () => {
        console.log(`Deleting engineer!`, engineer);
        try {
          const res = await engineerAction.DELETE.deleteEngineer(
            engineer.name,
            engineer.department
          );

          if (res.success) {
            toast.success(res.message!);
          }
          if (!res.success) {
            toast.error(res.message || 'Unable to delete engineer!');
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
            <DropdownMenuItem onClick={handleDeleteEngineer}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

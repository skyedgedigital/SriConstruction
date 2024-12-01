'use client';

import { ColumnDef } from '@tanstack/react-table';
import departmentAction from '@/lib/actions/department/departmentAction';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Department = {
  _id: string;
  departmentName: string;
};

export const columns: ColumnDef<Department>[] = [
  {
    accessorKey: 'departmentName',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Department
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },

  {
    id: 'actions',

    cell: ({ row }) => {
      const department = row.original;

      const handleDeleteDepartment = async (departmentName: string) => {
        console.log(`Deleting department: ${departmentName}`);
        try {
          const res = await departmentAction.DELETE.deleteDepartment(
            departmentName
          );

          if (res.success) {
            toast.success(res.message!);
          }
          if (!res.success) {
            toast.error(
               res.message || 'Unable to delete department!'
            );
          }
        } catch (error) {
          console.error(`Error deleting department: ${error}`);
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
              onClick={() => handleDeleteDepartment(department.departmentName)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

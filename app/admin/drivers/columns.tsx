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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

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
        // Implement logic to delete department using the provided departmentName
        // This could involve making an API call to your backend or performing
        // operations on your local data (depending on your application's architecture)
        console.log(`Deleting department: ${departmentName}`); // Placeholder for deletion logic

        // Handle potential errors and provide user feedback (optional)
        try {
          const res = await departmentAction.DELETE.deleteDepartment(
            departmentName
          );

          // const data = updatedDepartment ? await JSON.parse(updatedDepartment) : [''];
          if (res?.success) {
            toast.success(res.message!);
            // setValue('department', '');
            // setAllDepartments(data);
          }
          if (!res?.success) {
            toast.error(res.message || 'Unable to delete department!');
          }
        } catch (error) {
          console.error(`Error deleting department: ${error}`);
          // Display an error message to the user
        }
      };

      return (
        // <Button variant='ghost' className='h-8 w-8 p-0' onClick={() =>  handleDeleteDepartment(department.departmentName)}>
        //   Delete
        // </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
            <DropdownMenuItem
              onClick={() => handleDeleteDepartment(department.departmentName)}
            >
              Delete
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

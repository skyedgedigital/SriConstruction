'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import workOrderAction from '@/lib/actions/workOrder/workOrderAction'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import itemAction from '@/lib/actions/item/itemAction'


export type Item = {
    itemNumber: number,
      
      itemName:  String,
      
      hsnNo: String,
    
      itemPrice:  Number,
     

  
}




export const itemColumns: ColumnDef<Item>[] = [
  {
    accessorKey: 'itemNumber',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Number
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },

  {
    accessorKey: 'itemName',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
        //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      )
    }
  },
  {
    accessorKey: 'hsnNo',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
        //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          HSN
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      )
    }
  },
  {
    accessorKey: 'itemPrice',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
        //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Price
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      )
    }
  },
  
  {
    id: 'actions',
  

    cell: ({ row }) => {

const item=row.original;

      const handleDeleteItem = async (itemNumber: number) => {
       
        console.log(`Deleting employee!`);
        try {
          const res = await itemAction.DELETE.deleteItemByItemNumber(itemNumber)
      
          if (res.success) {
            toast.success(res.message!);
         
          }
          if (!res.success) {
            toast.error(res.message || 'Unable to delete item!');
          }        } catch (error) {
            toast.error('Error deleting item!!')
          console.error(`Error deleting item: ${error}`);
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
            <DropdownMenuContent  >
              <DropdownMenuItem
                onClick={() =>handleDeleteItem(item.itemNumber)}
              >
               Delete
              </DropdownMenuItem>
              
          
            </DropdownMenuContent>
          </DropdownMenu>
        
      )
    }
  }
]
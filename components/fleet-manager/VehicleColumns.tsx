'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  FormatDateOptions,
  format,
  parseISO,
  differenceInDays,
} from 'date-fns';

export type Vehicle = {
  vehicleNumber: string;

  vehicleType: String;

  fuelType: String;

  fuelCost: Number;
  insuranceExpiryDate: Date | string | null;
  gatePassExpiry: Date | string | null;
  taxExpiryDate: Date | string | null;
  fitnessExpiry: Date | string | null;
  loadTestExpiry: Date | string | null;
  safetyExpiryDate: Date | string | null;
  pucExpiryDate: Date | string | null;
  createdAt: Date | string | null;
};

const formatDate = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  if (typeof date === 'string') date = parseISO(date);
  return format(date, 'PPP');
};

const formatDateDDMMYY = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  if (typeof date === 'string') {
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = String(dateObj.getFullYear()).slice(-2);
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
  }
  return format(date, 'PPP');
};

const isDateNearExpiry = (date: Date | string | null): boolean => {
  if (!date) return false;
  if (typeof date === 'string') date = parseISO(date);
  return differenceInDays(date, new Date()) <= 30;
};

export const vehicleColumns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: 'vehicleNumber',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          // onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Number
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Created At
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.createdAt;

      return <span>{formatDateDDMMYY(date)}</span>;
    },
  },

  {
    accessorKey: 'vehicleType',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Type
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },
  {
    accessorKey: 'fuelType',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fuel Type
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },
  {
    accessorKey: 'location',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Location
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },
  {
    accessorKey: 'vendor',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          //   onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Vendor
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },
  {
    accessorKey: 'gatePassExpiry',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Gate Pass Expiry <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.gatePassExpiry;
      const nearExpiry = isDateNearExpiry(date);
      return (
        <span style={{ color: nearExpiry ? 'red' : 'inherit' }}>
          {formatDateDDMMYY(date)}
        </span>
      );
    },
  },
  {
    accessorKey: 'insuranceExpiryDate',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Insurance Expiry Date <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.insuranceExpiryDate;
      const nearExpiry = isDateNearExpiry(date);
      return (
        <span style={{ color: nearExpiry ? 'red' : 'inherit' }}>
          {formatDateDDMMYY(date)}
        </span>
      );
    },
  },
  {
    accessorKey: 'taxExpiryDate',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Tax Expiry Date <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.taxExpiryDate;
      const nearExpiry = isDateNearExpiry(date);
      return (
        <span style={{ color: nearExpiry ? 'red' : 'inherit' }}>
          {formatDateDDMMYY(date)}
        </span>
      );
    },
  },
  {
    accessorKey: 'fitnessExpiry',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Fitness Expiry <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.fitnessExpiry;
      const nearExpiry = isDateNearExpiry(date);
      return (
        <span style={{ color: nearExpiry ? 'red' : 'inherit' }}>
          {formatDateDDMMYY(date)}
        </span>
      );
    },
  },
  {
    accessorKey: 'loadTestExpiry',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Load Test Expiry <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.loadTestExpiry;
      const nearExpiry = isDateNearExpiry(date);
      return (
        <span style={{ color: nearExpiry ? 'red' : 'inherit' }}>
          {formatDateDDMMYY(date)}
        </span>
      );
    },
  },
  {
    accessorKey: 'safetyExpiryDate',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Safety Expiry Date <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.safetyExpiryDate;
      const nearExpiry = isDateNearExpiry(date);
      return (
        <span style={{ color: nearExpiry ? 'red' : 'inherit' }}>
          {formatDateDDMMYY(date)}
        </span>
      );
    },
  },
  {
    accessorKey: 'pucExpiryDate',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        PUC Expiry Date <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.pucExpiryDate;
      const nearExpiry = isDateNearExpiry(date);
      return (
        <span style={{ color: nearExpiry ? 'red' : 'inherit' }}>
          {formatDateDDMMYY(date)}
        </span>
      );
    },
  },

  {
    id: 'actions',

    cell: ({ row }) => {
      const vehicle = row.original;

      const handleDeleteVehicle = async (vehicleNumber: string) => {
        console.log(`Deleting vehicle!`);
        try {
          const res = await vehicleAction.DELETE.deleteVehicleByVehicleNumber(
            vehicleNumber
          );

          if (res.success) {
            toast.success(res.message!);
          }
          if (!res.success) {
            toast.error(res.error! || 'Unable to delete vehicle!');
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
              onClick={() => handleDeleteVehicle(vehicle.vehicleNumber)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

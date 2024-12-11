"use client";

import { useState } from "react";

import {
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterValue?: String;
  pageCount?: number;
  // onNextPage?: () => Promise<void>;
  // onPreviousPage?: () => Promise<void>;
  page?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterValue,
  pageCount = 10,
  // onNextPage,
  // onPreviousPage,
  page,
}: DataTableProps<TData, TValue>) {
  console.log(filterValue);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    // pageCount: pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  console.log(columns);

  return (
    <>
      {/* Filters */}

      <div className="flex items-center justify-between">
        <div className="flex items-center pt-16 pb-4 ">
          <Input
            placeholder="Search..."
            value={
              (table.getColumn(`${filterValue}`)?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn(`${filterValue}`)
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm border-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border-2 border-slate-500 text-black">
        <Table className="overflow-x-auto">
          <TableHeader className="border-slate-500 border-b-2 text-black font-semibold">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id.toString() + "fum"}>
                {headerGroup.headers.map((header, idx) => {
                  return (
                    <TableHead
                      key={header.id.toString() + "rum" + idx}
                      className="border-slate-500 border-r-2"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table?.getRowModel().rows?.length ? (
              table?.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id.toString() + "nbb"}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <TableCell
                      key={cell.id + "SONA" + idx}
                      className="border-slate-500 border-r-2 "
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div> */}
    </>
  );
}

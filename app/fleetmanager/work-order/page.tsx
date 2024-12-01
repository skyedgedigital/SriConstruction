import React from 'react';
import CreateWorkOrder from '@/components/fleet-manager/CreateWorkOrder';
import EditWorkOrder from '@/components/fleet-manager/EditWorkOrder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import workOrderAction from '@/lib/actions/workOrder/workOrderAction';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/fleet-manager/WorkOrderColumns';
import itemAction from '@/lib/actions/item/itemAction';
import AddItem from '@/components/fleet-manager/AddItem';
const Chalans: React.FC<{}> = async () => {
  //   let workOrders;
  //   const res = await workOrderAction.FETCH.fetchAllWorkOrder();
  //   if (res.success) {
  //     workOrders = JSON.parse(res.data);
  //   }
  //   // const workOrders=JSON.parse(JSON.stringify(res.data));

  //   const workOrdersWithItems = [];
  //   for (const workOrder of workOrders) {
  //     const filter=JSON.stringify(workOrder?.workOrderNumber)
  //     const itemsRes = await itemAction.FETCH.fetchAllItemOfWorkOrder(
  //       filter
  //     );
  //     let items;
  //     if (itemsRes?.success) {
  //       items = JSON.parse(itemsRes?.data);
  //     }
  //     const date = new Date(workOrder.workOrderValidity);
  //     const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  // const formattedDate = date.toLocaleDateString('en-GB', options);
  //     workOrdersWithItems.push({
  //       ...workOrder,
  //       items: items,
  //       workOrderValidity: formattedDate

  //     });
  //   }

  // const workOrdersWithItems = workOrders.map((workOrder) => ({
  //   ...workOrder,
  //   items: itemData.find((items) => items.data[0].workOrderNumber === workOrder.workOrderNumber)?.data,
  // }));

  let workOrders = [];
  try {
    const res = await workOrderAction.FETCH.fetchAllWorkOrder();
    if (res?.success) {
      workOrders = JSON.parse(res.data);
    }
  } catch (error) {
    console.error('Error fetching work orders:', error);
  }

  let workOrdersWithItems = [];

  try {
    // Use Promise.all to fetch items in parallel
    workOrdersWithItems = await Promise.all(
      workOrders.map(async (workOrder) => {
        let items = [];
        try {
          const filter = JSON.stringify(workOrder?.workOrderNumber);
          const itemsRes = await itemAction.FETCH.fetchAllItemOfWorkOrder(
            filter
          );
          if (itemsRes?.success) {
            items = JSON.parse(itemsRes?.data);
          }
        } catch (error) {
          console.error(
            `Error fetching items for work order ${workOrder?.workOrderNumber}:`,
            error
          );
        }

        const date = new Date(workOrder.workOrderValidity);
        const options: Intl.DateTimeFormatOptions = {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        };
        const formattedDate = date.toLocaleDateString('en-GB', options);

        return {
          ...workOrder,
          items: items,
          workOrderValidity: formattedDate,
        };
      })
    );
  } catch (error) {
    console.error('Error processing work orders with items:', error);
  }

  return (
    <Tabs defaultValue='addWorkOrder'>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Work Orders
      </h1>
      <TabsList className='grid w-full grid-cols-2 sm:grid-cols-3  justify-content-center gap-2 bg-white mb-3  '>
        <TabsTrigger value='addWorkOrder'>Add Work Order</TabsTrigger>
        <TabsTrigger value='editWorkOrder'>Edit Work Order</TabsTrigger>
        <TabsTrigger value='viewWorkOrders'>View Work Orders</TabsTrigger>
      </TabsList>
      <TabsContent value='addWorkOrder'>
        <CreateWorkOrder />
      </TabsContent>
      <TabsContent value='editWorkOrder'>
        <div className='flex flex-col gap-6'>
          <EditWorkOrder />
          <AddItem />
        </div>
      </TabsContent>
      <TabsContent value='viewWorkOrders'>
        <DataTable
          columns={columns}
          data={workOrdersWithItems}
          filterValue='workOrderNumber'
        />
      </TabsContent>
    </Tabs>
  );
};

export default Chalans;

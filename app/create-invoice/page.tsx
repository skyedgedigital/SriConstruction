import { getInvoiceByInvoiceId } from '@/lib/actions/chalan/invoice';
import React from 'react';
import itemAction from '@/lib/actions/item/itemAction';
import { fetchItemByItemId } from '@/lib/actions/item/fetch';
import { fetchWorkOrderByWorkOrderId } from '@/lib/actions/workOrder/fetch';
import Invoice from '@/components/invoices/Invoice';
import WMDInvoice from '@/components/invoices/wmdInvoice';
import PublicHealthServiceInvoice from '@/components/invoices/publicHealthServiceInvoice';

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const decodedInvoiceId = searchParams.invoiceId;
  console.warn('The Merged Items', searchParams.mergedItems);
  const res = await getInvoiceByInvoiceId(decodedInvoiceId);
  let invoice;
  if (res.success) {
    invoice = await JSON.parse(res.data);
  }
  console.log('fethc to hora vai', invoice);
  const mergedItems = await JSON.parse(invoice.mergedItems);
  console.log(mergedItems);
  const items = [];
  let totalCost = 0;
  for (const itemId in mergedItems) {
    const itemCost = mergedItems[itemId];
    totalCost += itemCost;
    const res = await fetchItemByItemId(itemId);
    const item = await JSON.parse(res.data);

    console.warn('The Items', item);
    const { itemNumber, itemName, itemPrice, workOrder } = item;
    items.push({
      itemId, // Use the key as the itemId property
      itemCost, // Use the value as the itemCost property
      itemNumber,
      itemPrice,
      itemName,
      workOrder,
    });
  }

  const resp = await fetchItemByItemId(items[0].itemId);
  const workOrderItem = await JSON.parse(resp.data);
  const response = await fetchWorkOrderByWorkOrderId(workOrderItem.workOrder);
  const workOrder = response.data;
  // console.log(items);
  console.log(searchParams?.department.toUpperCase());

  let DisplayableInvoice: any;

  if (searchParams?.department.includes('wmd')) {
    DisplayableInvoice = (
      <WMDInvoice
        items={items}
        workOrder={workOrder}
        invoice={invoice}
        itemCost={totalCost}
        location={searchParams?.location}
        service={searchParams?.service}
        department={searchParams?.department}
      />
    );
  } else if (
    searchParams?.department.includes('public health services (phs)')
  ) {
    DisplayableInvoice = (
      <PublicHealthServiceInvoice
        items={items}
        workOrder={workOrder}
        invoice={invoice}
        itemCost={totalCost}
        location={searchParams?.location}
        service={searchParams?.service}
        department={searchParams?.department}
      />
    );
  } else {
    DisplayableInvoice = (
      <Invoice
        items={items}
        workOrder={workOrder}
        invoice={invoice}
        itemCost={totalCost}
        location={searchParams?.location}
        service={searchParams?.service}
        department={searchParams?.department}
      />
    );
  }
  return <>{DisplayableInvoice}</>;
};

export default page;

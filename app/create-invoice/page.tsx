import { getInvoiceByInvoiceId } from '@/lib/actions/chalan/invoice';
import React from 'react';
import itemAction from '@/lib/actions/item/itemAction';
import { fetchItemByItemId } from '@/lib/actions/item/fetch';
import { fetchWorkOrderByWorkOrderId } from '@/lib/actions/workOrder/fetch';
import Invoice from '@/components/invoices/Invoice';
import WMDInvoice from '@/components/invoices/wmdInvoice';
import PublicHealthServiceInvoice from '@/components/invoices/publicHealthServiceInvoice';
import Chalan from '@/lib/models/chalan.model';
import toast from 'react-hot-toast';
import chalanAction from '@/lib/actions/chalan/chalanAction';

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  console.log(
    'received search params in create-invoice from merge invoice',
    searchParams
  );
  const selectedChalanNumbers = await JSON.parse(
    searchParams?.selectedChalanNumbers
  );
  // const decodedInvoiceId = searchParams.invoiceId;
  // console.warn('The Merged Items', searchParams.mergedItems);
  // const res = await getInvoiceByInvoiceId(decodedInvoiceId);
  // let invoice;
  // if (res.success) {
  //   invoice = await JSON.parse(res.data);
  // }
  // console.log('fethc to hora vai', invoice);
  const { data, status, success, message, error } =
    await chalanAction.PREPARE.prepareMergedItems(selectedChalanNumbers);
  const mergedItems = await JSON.parse(data);
  // console.log('mergedItems received in create invoice', mergedItems);
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

  // const resp = await fetchItemByItemId(items[0].itemId);
  // const workOrderItem = await JSON.parse(resp.data);
  const response = await fetchWorkOrderByWorkOrderId(searchParams?.wo);
  console.log('FETCHED WORKORDER', response.data);
  const workOrder = response.data;
  // // console.log(items);
  // console.log(searchParams?.department.toUpperCase());

  let DisplayableInvoice: any;

  if (searchParams?.department.includes('wmd')) {
    DisplayableInvoice = (
      <WMDInvoice
        items={items}
        workOrder={workOrder}
        // invoice={invoice}
        selectedChalanNumbers={selectedChalanNumbers}
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
        // invoice={invoice}
        itemCost={totalCost}
        location={searchParams?.location}
        service={searchParams?.service}
        department={searchParams?.department}
        selectedChalanNumbers={selectedChalanNumbers}
      />
    );
  } else {
    DisplayableInvoice = (
      <Invoice
        items={items}
        workOrder={workOrder}
        // invoice={invoice}
        itemCost={totalCost}
        location={searchParams?.location}
        service={searchParams?.service}
        department={searchParams?.department}
        selectedChalanNumbers={selectedChalanNumbers}
      />
    );
  }
  return <>{DisplayableInvoice}</>;
};

export default page;

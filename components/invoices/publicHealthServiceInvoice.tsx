'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { MdOutlineFileDownload } from 'react-icons/md';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '@/utils/aws';
import {
  uploadInvoiceSummaryPDFToS3,
  uploadInvoicePDFToS3,
  uploadInvoiceToFireBase,
  uploadSummaryToFireBase,
} from '@/lib/actions/chalan/invoice';
import { useParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import { parseISO, format } from 'date-fns';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { storage } from '@/utils/fireBase/config';
import itemAction from '@/lib/actions/item/itemAction';
import chalanAction from '@/lib/actions/chalan/chalanAction';

const todayDate = () => {
  let date = new Date().toLocaleDateString();
  let x = date.split('/');
  return `${x[1]}/${x[0]}/${x[2]}`;
};

const PublicHealthServiceInvoice = ({
  invoice,
  items,
  workOrder,
  itemCost,
  location,
  service,
  department,
}: // mergedItems

{
  items: any;
  workOrder: any;
  invoice: any;
  itemCost: any;
  location: any;
  service: any;
  department: any;
  // mergedItems:any
}) => {
  // conroutersole.warn("The Merged Items",mergedItems)
  const [totalCgst, setTotalCgst] = useState(0);
  const [totalSgst, setTotalSgst] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const [itemsList, setItemsList] = useState([]);
  const [dateMapping, setDateMapping] = useState({});

  useEffect(() => {
    const fn = async () => {
      let cgst = 0;
      let sgst = 0;
      let totalHours = 0;
      // Map over items and fetch hsnNo for each item using async/await
      const updatedItems = await Promise.all(
        items.map(async (element) => {
          cgst += 0.09 * element.itemCost.itemCost;
          sgst += 0.09 * element.itemCost.itemCost;
          totalHours += element.itemCost.hours;
          const itemId = element.itemId;
          const hsnNumber = await itemAction.FETCH.fetchHsnNoByItemId(itemId);
          console.log(hsnNumber.data);

          // Set hsnNo on the item object
          return {
            ...element,
            hsnNo: hsnNumber.data,
          };
        })
      );

      // Update state after all hsnNo are fetched
      setItemsList(updatedItems);
      setTotalCgst(cgst);
      setTotalSgst(sgst);
      setTotalHours(totalHours);
    };

    const summarySheetInfo = async () => {
      let invoiceId = invoice.invoiceId;
      const resp = await chalanAction.FETCH.getSummaryPdfData(invoiceId);
      if (resp.success) {
        // toast.success("Recieved Summary Data")
        console.error(resp.data);
        setDateMapping(resp.data);
      }
    };

    fn();
    summarySheetInfo();
  }, [items, invoice]);

  const displayDate = (itemName: string) => {
    // let date = dateMapping?.get(itemName).from;
    // console.log(date);
    // return '';
  };

  console.warn('The Items Recieved', items);
  const contentArray: any = [];
  Object.keys(dateMapping).forEach((key, i) => {
    let total = 0;
    const itemDetails = dateMapping[key];
    itemDetails?.details?.map((item, index) => {
      contentArray.push(
        <tr>
          <td className='border-[1px] border-black py-2  text-center '>
            {index + 1}
          </td>{' '}
          <td className='border-[1px] border-black py-2  text-center '>
            {item?.itemDescription}
          </td>{' '}
          <td className='border-[1px] border-black py-2  text-center '>
            {item?.chalanNumber}
          </td>{' '}
          <td className='border-[1px] border-black py-2  text-center '>
            {item?.chalanDate.toLocaleDateString('en-GB')}
          </td>{' '}
          <td className='border-[1px] border-black py-2 text-center '>
            {item?.location ? item?.location : 'No locations available'}
          </td>
          <td className='border-[1px] border-black py-2  text-center '>
            {/* {filtered[i]?.unit === 'minute' &&
              (parseFloat(filtered[i]?.used.toString()) / 60).toFixed(2)}
            {filtered[i]?.unit === 'hour' &&
              parseFloat(filtered[i]?.used.toString()).toFixed(2)} */}
            {item.workingHour}
          </td>
        </tr>
      );
      total += Number(item?.workingHour);
    });
    contentArray.push(
      <tr className={`bg-gray-100`}>
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] bg-300 border-black py-2 font-bold  text-center '>
          Item total hours
        </td>
        <td className='border-[1px] border-black py-2  text-center '>
          {/* {totalHourObject[key]} */}
          {total}
        </td>
      </tr>
    );
  });
  contentArray.push(
    <tr className={`bg-gray-300`}>
      <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
      <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
      <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
      <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
      <td className='border-[1px] bg-300 border-black py-2 font-bold  text-center '>
        total
      </td>
      <td className='border-[1px] border-black py-2  text-center '>
        {/* {totalHourObject[key]} */}
        {totalHours}
      </td>
    </tr>
  );

  const generatePDF = async () => {
    const originalElementId = invoice?.invoiceId;

    const pdf = new jsPDF('l', 'pt', 'a4');
    const originalElement = document.getElementById(originalElementId)!;
    const element = originalElement.cloneNode(true) as HTMLElement;

    element.style.width = '1250px';

    pdf.html(element, {
      callback: async () => {
        // Generate the PDF as a data URL
        const pdfDataUrl = pdf.output('dataurlstring');
        pdf.save(`${invoice?.invoiceNumber}.pdf`);
        const byteString = atob(pdfDataUrl.split(',')[1]);
        const mimeString = pdfDataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        const fileName = `${invoice?.invoiceNumber}.pdf`;
        const storageRef = ref(storage, `invoices/${fileName}`);

        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error('Error uploading PDF to Firebase:', error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('PDF available at', downloadURL);

              const pdfResult = await uploadInvoiceToFireBase(
                invoice,
                downloadURL
              );

              if (pdfResult.success) {
                toast.success('Invoice Pdf Saved');
              } else {
                toast.error(pdfResult.message);
              }
            } catch (error) {
              console.error('Error getting download URL:', error);
            }
          }
        );
        await generateSummaryPDF();
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.61 },
      autoPaging: 'text',
    });
  };

  const generateSummaryPDF = async () => {
    const elementId = `${invoice?.invoiceId}-summary`;
    const originalElementId = invoice?.invoiceId;

    // console.log('found element', elementId);
    const pdf = new jsPDF('l', 'pt', 'a4');
    const originalElement = document.getElementById(elementId)!;
    const element = originalElement.cloneNode(true) as HTMLElement;

    element.style.width = '1250px';

    // pdf.save(`${elementId}.pdf`);
    pdf.html(element, {
      callback: async () => {
        const pdfDataUrl = pdf.output('dataurlstring');
        pdf.save(`${invoice?.invoiceNumber}-summary.pdf`);
        const byteString = atob(pdfDataUrl.split(',')[1]);
        const mimeString = pdfDataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        const fileName = `PHS-${invoice?.invoiceNumber}.pdf`;
        const storageRef = ref(storage, `invoices/${fileName}`);

        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error('Error uploading PDF to Firebase:', error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Summary PDF available at', downloadURL);

              const pdfResult = await uploadSummaryToFireBase(
                invoice,
                downloadURL
              );

              if (pdfResult.success) {
                toast.success('Summary Pdf Saved');
              } else {
                toast.error(pdfResult.message);
              }
            } catch (error) {
              console.error('Error getting download URL:', error);
            }
          }
        );
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.6 },
    });
  };

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    if (typeof date === 'string') date = parseISO(date);
    return format(date, 'PPP');
  };

  const total = items.reduce((sum, item) => sum + item.itemCost.itemCost, 0);
  const grandTotal = items.reduce((sum, item) => {
    const itemCost = item.itemCost.itemCost || 0;
    return sum + itemCost + 0.18 * itemCost;
  }, 0);
  const generateAndUploadInvoiceSummaryPDF = async () => {
    try {
      await generateSummaryPDF(); // Generate PDF for download/printing
    } catch (err) {
      console.log('error toh yeh hai boss', err);
    }
  };

  const generateAndUploadInvoicePDF = async () => {
    try {
      await generatePDF();
    } catch (err) {
      console.log('error toh yeh hai boss', err);
    }
  };
  console.log('yeich hai items array bawa', items);
  console.log('yeich hai items array bawa', invoice);
  function numberToWords(amount) {
    if (typeof amount !== 'number' || amount < 0) {
      return 'Invalid input';
    }

    const units = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ];

    const tens = [
      '',
      '',
      'twenty',
      'thirty',
      'forty',
      'fifty',
      'sixty',
      'seventy',
      'eighty',
      'ninety',
    ];

    const thousands = ['', 'thousand', 'million'];

    function convertHundreds(num) {
      let result = '';
      if (num > 99) {
        result += units[Math.floor(num / 100)] + ' hundred ';
        num %= 100;
      }
      if (num > 19) {
        result += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
      }
      if (num > 0) {
        result += units[num] + ' ';
      }
      return result.trim();
    }

    function convertNumberToWords(num) {
      if (num === 0) return 'zero';

      let word = '';
      let i = 0;
      while (num > 0) {
        if (num % 1000 !== 0) {
          word = convertHundreds(num % 1000) + ' ' + thousands[i] + ' ' + word;
        }
        num = Math.floor(num / 1000);
        i++;
      }

      return word.trim();
    }

    // Split the amount into whole and decimal parts
    const [wholePart, decimalPart] = amount.toFixed(2).split('.');

    // Convert whole part to words
    let words = convertNumberToWords(parseInt(wholePart, 10)) + ' Rupees';

    // Convert decimal part to words if it exists and is not zero
    if (parseInt(decimalPart, 10) > 0) {
      words +=
        ' and ' + convertNumberToWords(parseInt(decimalPart, 10)) + ' Paise';
    }

    return words;
  }

  const getHsn = async (itemId: string) => {
    const resp = await itemAction.FETCH.fetchHsnNoByItemId(itemId);
    return resp.data;
  };

  return (
    <main className=' w-full flex flex-col gap-1 p-4 pt-20'>
      <div className='flex justify-between items-center pr-6 '>
        <Button
          onClick={(e) => {
            e.preventDefault();
            generateAndUploadInvoicePDF();
            return;
          }}
          className='bg-green-700 text-white px-4 py-2 flex gap-1 items-center rounded ml-auto hover:bg-blue-200 hover:text-primary-color-extreme text-xs'
        >
          <MdOutlineFileDownload className='text-lg' />
          <p>Download PHS Invoice</p>
        </Button>
      </div>
      <div className=' '>
        <div
          className=' border-[1px] border-gray-700  tracking-wider w-full  text-[0.75rem] font-semibold'
          id={`${invoice?.invoiceId}`}
        >
          <h1 className='font-bold text-center w-full py-1'>PROFOMA INVOICE</h1>
          <div className='w-full   flex flex-col gap-3 my-3 ml-4'>
            <div className='flex items-center gap-2'>
              <div className='h-[50] w-[50]'>
                <Image
                  src={'/assets/logo.png'}
                  width={50}
                  height={50}
                  alt='sign image'
                />{' '}
              </div>
              <h1 className='font-bold text-sm uppercase'>Sri Constructions</h1>
            </div>
            <div className=''>
              <p className=' border-b-2 border-b-black w-fit pr-2 pb-2'>
                Specialist in : Horticulture, Conservancy Services, Supply of
                Equipments (F-15 Crane and JCB)
              </p>
              <p className='uppercase pt-2'>
                Address: C-1, BRINDAWAN GARDEN, SONARI, JAMSHEDPUR-831011
              </p>
              <p>Mobile : 9431133471, 9234973465</p>
              <p>Email : shekharenter@gmail.com</p>
              <p className='mt-2'>GSTIN/UN : 20AEMPK3908B1Z2</p>
              <p className='mb-2'>PAN : AEMPK3908B</p>
            </div>
          </div>
          <div className='border-2 border-black w-full pb-10'>
            <div className=' w-full flex flex-1 justify-around my-4 gap-3 overflow-x-scroll px-5 py-2'>
              <div className='flex flex-col gap-1 min-w-52'>
                <div className='flex gap-2'>
                  <span>Customer Name: </span>
                  <span className='font-normal'>
                    TATA STEEL UTILITIES AND INFRASTRUCTURE SERVICES LIMITED{' '}
                  </span>
                </div>
                <div className='flex gap-2'>
                  <span>Address: </span>
                  <span className='font-normal'>
                    CFO, Through CDM-PHS Sakchi Boulevard Road, N Town, Bistupur
                    Jamshedpur - 831001{' '}
                  </span>
                </div>
                <div>GSTIN/UIN: 20AABCJ3604P1ZR</div>
                <div className='flex items-start gap-1'>
                  <span>
                    Place of supply: <br></br> (Address of Delivery)
                  </span>
                  <span>{location}</span>
                </div>
              </div>
              <div className='flex flex-col gap-1 min-w-52'>
                <div className='flex gap-4 items-center '>
                  <p>Ref Performa Invoice no:</p>
                  <p>{invoice?.invoiceNumber}</p>
                </div>
                <div className='flex gap-4 items-center'>
                  <p>Date of Issue :</p>
                  <p> {todayDate()}</p>
                </div>
                <div className='flex gap-4 items-center'>
                  <p>Vendor code</p> <p>10758</p>
                </div>
                <div className='flex gap-4 items-center'>
                  <p>WO/PO No</p> <p>{workOrder?.workOrderNumber}</p>
                </div>
                {/* <div className='flex gap-4 items-center'>
                  <p>WO/PO Date:</p>
                  <p>{formatDate(workOrder?.workOrderValidity)}</p>
                </div> */}
                <div className='flex gap-4 items-center'>
                  <p>Do No:</p>
                  <p></p>
                </div>
                <div className='flex gap-4 items-center'>
                  <p>SES No.</p>
                  <p></p>
                </div>
                <div className='flex gap-4 items-center'>
                  <p>Location:</p> <p>{location}</p>
                </div>
                <div className='flex gap-4 items-center'>
                  <p>Period of service:</p>
                  <span className='flex gap-1'>{service}</span>
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-0 pt-4'>
              <div className='overflow-x-scroll w-full'>
                {' '}
                <table className='w-full  text-[0.75rem] font-semibold border-collapse '>
                  <thead className='font-semibold  w-full text-[0.75rem]'>
                    <th className='border-[1px] border-black pl-2 pb-3 '>SL</th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      HSN
                    </th>

                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      Description of Goods / Services
                    </th>

                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      Quantity
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      UOM
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      Rate
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      Value
                    </th>
                  </thead>
                  <tbody>
                    {itemsList?.map((item: any, index: any) => (
                      <tr key={index}>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {index}
                        </td>

                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {item?.hsnNo}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {`${item?.itemName}`}
                        </td>

                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {`${item?.itemCost.hours}`}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {`${item?.itemCost.unit}`}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {' '}
                          {`${item?.itemPrice}`}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {' '}
                          {`${item?.itemCost.itemCost}`}
                        </td>
                      </tr>
                    ))}

                    {/* total row */}
                    <tr className='border-t-2 border-t-gray-600'>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>

                      {/* <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td> */}

                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '>
                        Total
                      </td>
                      <td className='border-[1px] border-black pl-2 pb-3 '>{`${total} `}</td>
                    </tr>

                    {/* total CGST Row */}
                    <tr className='border-t-2 border-t-gray-600'>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>

                      {/* <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td> */}

                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '>
                        CGST (9%)
                      </td>
                      <td className='border-[1px] border-black pl-2 pb-3 '>{`${totalCgst} `}</td>
                    </tr>
                    {/* total SGST Row */}
                    <tr className='border-t-2 border-t-gray-600'>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>

                      {/* <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td> */}

                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '>
                        SGST (9%)
                      </td>
                      <td className='border-[1px] border-black pl-2 pb-3 '>{`${totalSgst} `}</td>
                    </tr>
                    {/* grand total row */}
                    <tr className='border-t-2 border-gray-600'>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>

                      {/* <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td> */}
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>

                      <td className='border-[1px] border-black pl-2 pb-3 font-bold'>
                        Grand Total
                      </td>
                      <td className='border-[1px] border-black pl-2 pb-3 font-bold'>
                        {`${parseFloat(grandTotal.toFixed(2))} INR`}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className='p-2'>
                  Amount chargeable under Reverce Charge Mechanism - NO
                </p>
              </div>
            </div>
            <div className=' flex justify-between mt-2 gap-2'>
              <div className='flex flex-col gap-3 mt-3 ml-2'>
                <span className='w-full flex items-center gap-2 '>
                  <p className='font-semibold'>Rupees in word: </p>
                  <p className='uppercase'>
                    {/* {number2text(
                      totalCGSTPrice + totalItemsPrice + totalSGSTPrice
                    )} */}
                    {`${numberToWords(grandTotal)} only`}
                  </p>
                </span>
              </div>
              <div className='ml-auto mr-10 flex flex-col items-end gap-6 '>
                <div className='flex items-end'>
                  <p className=' font-mono '>FOR</p>
                  <p className='w-[6rem] border-b-2 border-b-black'></p>
                </div>

                <p className='my-3'>Authorised Signatory</p>
              </div>
            </div>
          </div>
          <div className='flex gap-5'>
            <div className=''>
              <table className='border-[1px] border-black p-1'>
                <thead className='border-[1px] border-black p-1'>
                  <th className='border-[1px] border-black p-1 w-fit'>
                    Service User Feed Back
                  </th>
                  <th className='border-[1px] border-black p-1'>P</th>
                  <th className='border-[1px] border-black p-1'>F</th>
                  <th className='border-[1px] border-black p-1'>G</th>
                  <th className='border-[1px] border-black p-1'>VG</th>
                  <th className='border-[1px] border-black p-1'>EX</th>
                </thead>
                <tbody>
                  <tr className='border-[1px] border-black p-1'>
                    <td className='border-[1px] border-black p-1'>
                      Quality of Services{' '}
                    </td>
                    <td className='border-[1px] border-black p-1'></td>
                    <td className='border-[1px] border-black p-1'></td>
                    <td className='border-[1px] border-black p-1'></td>
                    <td className='border-[1px] border-black p-1'></td>
                    <td className='border-[1px] border-black p-1'></td>
                  </tr>
                  <tr className='border-[1px] border-black p-1'>
                    <td className='border-[1px] border-black p-1'>
                      Safety Compliance{' '}
                    </td>
                    <td className='border-[1px] border-black p-1'></td>
                    <td className='border-[1px] border-black p-1'></td>
                    <td className='border-[1px] border-black p-1'></td>
                    <td className='border-[1px] border-black p-1'></td>
                    <td className='border-[1px] border-black p-1'></td>
                  </tr>
                  <tr className='border-[1px] border-black '>
                    <td className='border-[1px] border-black '>
                      Timely Delivery{' '}
                    </td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                  </tr>
                  <tr className='border-[1px] border-black p-1 '>
                    <td className='border-[1px] border-black p-1 '>
                      Timely bill submission{' '}
                    </td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                  </tr>
                  <tr className='border-[1px] border-black p-1'>
                    <td className='border-[1px] border-black p-1 '>
                      Responsiveness{' '}
                    </td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                  </tr>
                  <tr className='border-[1px] border-black p-1 '>
                    <td className='border-[1px] border-black p-1 '>
                      Resources deployed{' '}
                    </td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                  </tr>
                  <tr className='border-[1px] border-black p-1 '>
                    <td className='border-[1px] border-black p-1 '>
                      Statutory Compliance{' '}
                    </td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                    <td className='border-[1px] border-black p-1 '></td>
                  </tr>
                </tbody>
              </table>
              <p className='my-1'>Signature of Concerned Office</p>
            </div>
            <div>CC/I.O No</div>
          </div>
        </div>
      </div>

      <div className='mt-10 flex justify-between items-center pr-6 '>
        <Button
          onClick={(e) => {
            e.preventDefault();
            generateAndUploadInvoiceSummaryPDF();
            return;
          }}
          className='bg-green-700 text-white px-4 py-2 flex gap-1 items-center rounded ml-auto hover:bg-blue-200 hover:text-primary-color-extreme text-xs'
        >
          <MdOutlineFileDownload className='text-lg' />
          <p>Download summary sheet</p>
        </Button>
      </div>
      <div className='flex items-center justify-center '>
        <div
          id={`${invoice?.invoiceId}-summary`}
          className='flex flex-col justify-center items-center w-full '
        >
          <h2 className='text-center font-bold mb-4 text-base flex gap-1 mx-auto '>
            Invoice no.{' '}
            {/* <p className='tracking-wide'>{invoiceState?.invoiceNo}</p> Summary
            Sheet
          </h2> */}
            <p className='tracking-wide'>{invoice?.invoiceNumber}</p> Summary
            Sheet
          </h2>
          <div className='overflow-x-scroll w-full'>
            <table className=' w-full text-sm border-collapse'>
              <thead>
                <th className='border-[1px] border-black capitalize py-1 pb-2  text-center '>
                  Sl no.
                </th>
                <th className='border-[1px] border-black capitalize py-1 pb-2  text-center '>
                  description
                </th>
                <th className='border-[1px] border-black capitalize py-1 pb-2  text-center '>
                  Chalan no.
                </th>
                <th className='border-[1px] border-black capitalize py-1 pb-2  text-center '>
                  date
                </th>
                <th className='border-[1px] border-black capitalize py-1 pb-2  text-center '>
                  location
                </th>
                <th className='border-[1px] border-black capitalize py-1 pb-2  text-center '>
                  working hour
                </th>
              </thead>
              <tbody>
                {/* {allItemsSummaryArray.map((item, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? '' : 'bg-gray-200'}`}
                >
                  <td className='border-[1px] border-black py-2  text-center '>
                    {index + 1}
                  </td>{' '}
                  <td className='border-[1px] border-black py-2  text-center '>
                    {item?.itemType}
                  </td>{' '}
                  <td className='border-[1px] border-black py-2  text-center '>
                    {item?.chalanNo}
                  </td>{' '}
                  <td className='border-[1px] border-black py-2  text-center '>
                    {formatDate(item?.date.toString())}
                  </td>{' '}
                  <td className='border-[1px] border-black py-2  text-center '>
                    {item?.location}
                  </td>
                  <td className='border-[1px] border-black py-2  text-center '>
                    {item?.unit === 'minute' &&
                      (parseFloat(item?.used.toString()) / 60).toFixed(2)}
                    {item?.unit === 'hour' &&
                      parseFloat(item?.used.toString()).toFixed(2)}
                  </td>
                </tr>
              ))} */}
                {contentArray}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PublicHealthServiceInvoice;

'use client';
import React, { useEffect, useRef, useState } from 'react';
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
import { parseISO, format, formatDate } from 'date-fns';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { storage } from '@/utils/fireBase/config';
import itemAction from '@/lib/actions/item/itemAction';
import chalanAction from '@/lib/actions/chalan/chalanAction';
import { useReactToPrint } from 'react-to-print';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';
import { IEnterprise } from '@/interfaces/enterprise.interface';
import { Loader } from 'lucide-react';
import workOrderAction from '@/lib/actions/workOrder/workOrderAction';
import { getYearForInvoiceNaming } from '@/utils/getYearForInvoiceNaming';

const todayDate = () => {
  let date = formatDate(new Date(), 'dd/MM/yyyy');
  return date;
};

const WMDInvoice = ({
  // invoice,
  items,
  workOrder,
  itemCost,
  location,
  service,
  department,
  selectedChalanNumbers,
}: // mergedItems

{
  items: any;
  workOrder: any;
  // invoice: any;
  itemCost: any;
  location: any;
  service: any;
  department: any;
  selectedChalanNumbers: string[];
  // mergedItems:any
}) => {
  console.log('WON', workOrder);
  // CHALANS NUMBER SORTED AND JOINED, THIS WILL BE INVOICE ID
  const invoiceId = selectedChalanNumbers.sort().join(',').trim();

  // conroutersole.warn("The Merged Items",mergedItems)
  const [totalCgst, setTotalCgst] = useState(0);
  const [totalSgst, setTotalSgst] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [ent, setEnt] = useState<IEnterprise | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [loadingStates, setLoadingStates] = useState({
    autoInvoiceNumberGenerateLoader: false,
  });
  const [itemsList, setItemsList] = useState([]);
  const [dateMapping, setDateMapping] = useState({});
  const contentRefInvoice = useRef(null);
  const reactToPrintFnInvoice = useReactToPrint({
    contentRef: contentRefInvoice,
  });
  const contentRefSummary = useRef(null);
  const reactToPrintFnSummary = useReactToPrint({
    contentRef: contentRefSummary,
  });
  const [lastTwoInvoiceNumbers, setLastTwoInvoiceNumbers] = useState<
    { _id: string; invoiceNumber: string }[]
  >([]);
  useEffect(() => {
    const fetchLastTwoInvoiceNumbers = async () => {
      const { data, message, error, status, success } =
        await chalanAction.FETCH.getLastTwoInvoiceNumbers();

      if (success) {
        const latest2Docs = await JSON.parse(data);
        // console.log('LAST TWO INVOICE NUMBERS', latest2Docs);
        setLastTwoInvoiceNumbers(latest2Docs);
      }
    };
    fetchLastTwoInvoiceNumbers();
  }, []);
  useEffect(() => {
    const fn = async () => {
      const resp = await fetchEnterpriseInfo();
      console.log('response we got ', resp);
      if (resp.data) {
        const inf = await JSON.parse(resp.data);
        setEnt(inf);
        console.log(ent);
      }
      if (!resp.success) {
        toast.error(
          `Failed to load enterprise details, Please Reload or try later. ERROR : ${resp.error}`
        );
      }
    };
    fn();
  }, []);

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
      setTotalCgst(Number(cgst.toFixed(2)));
      setTotalSgst(Number(sgst.toFixed(2)));
      setTotalHours(totalHours);
    };

    const summarySheetInfo = async () => {
      const resp = await chalanAction.FETCH.getSummaryPdfData(
        selectedChalanNumbers
      );
      if (resp.success) {
        // toast.success("Recieved Summary Data")
        console.error(resp.data);
        setDateMapping(resp.data);
      }
    };

    fn();
    summarySheetInfo();
  }, [items, selectedChalanNumbers]);

  // const displayDate = (itemName: string) => {
  //   let date = dateMapping?.get(itemName).from;
  //   console.log(date);
  //   return '';
  // };

  console.warn('The Items Recieved', items);
  const contentArray: any = [];
  let new_total_hours = 0;
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
            {item.workingHour.toFixed(2)}
          </td>
        </tr>
      );
      total += Number(item?.workingHour);
    });
    new_total_hours += total;
    contentArray.push(
      <tr className={`bg-gray-300`}>
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] bg-300 border-black py-2 font-bold  text-center '>
          Item-total
        </td>
        <td className='border-[1px] border-black py-2  text-center '>
          {/* {totalHourObject[key]} */}
          {total.toFixed(2)}
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
        {new_total_hours.toFixed(2)}
      </td>
    </tr>
  );

  const generatePDF = async (printOrDownload: string) => {
    // PUT LOGIC TO PROHIBIT DOWNLOAD WITHOUT ENTERING INVOICE NUMBER
    const originalElementId = `WMD-${invoiceNumber}`;

    const pdf = new jsPDF('l', 'pt', 'a4');
    const originalElement = document.getElementById(originalElementId)!;
    const element = originalElement.cloneNode(true) as HTMLElement;

    element.style.width = '1250px';

    pdf.html(element, {
      callback: async () => {
        // Generate the PDF as a data URL
        const pdfDataUrl = pdf.output('dataurlstring');
        const fileName = `WMD-${invoiceNumber}.pdf`;
        if (printOrDownload === 'download') pdf.save(fileName);

        const invoiceAlreadyExists =
          await chalanAction.CHECK.checkExistingInvoice(
            selectedChalanNumbers,
            `SE/${getYearForInvoiceNaming()}/${invoiceNumber}`
          );
        //invoiceAlreadyExists.success will be true if no invoice exists
        if (!invoiceAlreadyExists.success) {
          return toast.error(
            invoiceAlreadyExists.message || 'Invoice already exists'
          );
        }
        const savedInvoiceResponse =
          await chalanAction.CREATE.createMergeChalan(
            selectedChalanNumbers,
            invoiceNumber
          );

        if (!savedInvoiceResponse.success) {
          return toast.error(
            savedInvoiceResponse.message ||
              'Failed to save invoice, Please try again later'
          );
        }
        if (savedInvoiceResponse.success) {
          toast.success(savedInvoiceResponse.message);
        } // deducting workorder balance
        const workOrderUpdateResponse =
          await workOrderAction.UPDATE.updateWorkOrderBalance(
            workOrder,
            grandTotal
          );
        if (!workOrderUpdateResponse.success) {
          toast.error('work order value did not deducted, Please try again', {
            duration: 5000,
          });
        }
        if (workOrderUpdateResponse.success) {
          toast.success(workOrderUpdateResponse.message);
        }
        const byteString = atob(pdfDataUrl.split(',')[1]);
        const mimeString = pdfDataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

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
                invoiceId,
                downloadURL
              );

              if (pdfResult.success) {
                toast.success('Invoice Pdf Saved');
              } else {
                toast.error(pdfResult.message);
              }
              await generateSummaryPDF(printOrDownload);
            } catch (error) {
              console.error('Error getting download URL:', error);
            }
          }
        );
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.61 },
      autoPaging: 'text',
    });
  };

  const generateSummaryPDF = async (printOrDownload: string) => {
    const originalElementId = `WMD-${invoiceNumber}-summary`;

    // console.log('found element', elementId);
    const pdf = new jsPDF('l', 'pt', 'a4');
    const originalElement = document.getElementById(originalElementId)!;
    const element = originalElement.cloneNode(true) as HTMLElement;

    element.style.width = '1250px';

    // pdf.save(`${elementId}.pdf`);
    pdf.html(element, {
      callback: async () => {
        const pdfDataUrl = pdf.output('dataurlstring');
        const fileName = `WMD-${invoiceNumber}.pdf`;
        if (printOrDownload === 'download') pdf.save(fileName);

        const byteString = atob(pdfDataUrl.split(',')[1]);
        const mimeString = pdfDataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

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
                invoiceId,
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

  const total = items.reduce((sum, item) => sum + item.itemCost.itemCost, 0);
  const grandTotal = items.reduce((sum, item) => {
    const itemCost = item.itemCost.itemCost || 0;
    return sum + itemCost + 0.18 * itemCost;
  }, 0);

  const generateAndUploadInvoiceSummaryPDF = async (
    printOrDownload: string
  ) => {
    try {
      await generateSummaryPDF(printOrDownload); // Generate PDF for download/printing
    } catch (err) {
      console.log('error toh yeh hai boss', err);
    }
  };

  const generateAndUploadInvoicePDF = async (printOrDownload: string) => {
    try {
      await generatePDF(printOrDownload);
    } catch (err) {
      console.log('error toh yeh hai boss', err);
    }
  };
  console.log('Received items in WMD Invoice', items);
  // console.log('yeich hai items array bawa', invoice);
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

  const handleAutoGenerateInvoice = async () => {
    try {
      setLoadingStates((allStates) => ({
        ...allStates,
        autoInvoiceNumberGenerateLoader: true,
      }));
      const resp = await chalanAction.FETCH.getLatestInvoiceNumber();
      if (resp.success) {
        setInvoiceNumber(await JSON.parse(resp.data));
      }
      if (!resp.success) {
        // console.error('An Error Occurred');
        return toast.error(resp.message);
      }
    } catch (err) {
      toast.error('An Error Occurred');
      toast.error(
        JSON.stringify(err) || 'Unexpected error occurred, Please try later'
      );
    } finally {
      setLoadingStates((allStates) => ({
        ...allStates,
        autoInvoiceNumberGenerateLoader: false,
      }));
    }
  };
  return (
    <main className=' w-full flex flex-col gap-4 p-4 pt-20'>
      <div className='flex justify-between items-center pr-6 '>
        <div className='flex flex-col gap-3'>
          <div className='flex items-end justify-center gap-2'>
            <form className='flex flex-col gap-1 justify-start items-start'>
              <label>Enter invoice number</label>
              <input
                className='text-lg p-1 border-[1px] border-gray-300 rounded-sm bg-gray-50'
                placeholder='123'
                type='text'
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.currentTarget.value)}
              />
            </form>{' '}
            <span>or</span>
            <div className='flex flex-col'>
              <p className='text-xs text-gray-400'>(Recommended)</p>
              <button
                onClick={handleAutoGenerateInvoice}
                className='bg-blue-100 text-blue-500 px-2 py-1 rounded-sm flex justify-center items-center gap-1'
              >
                {loadingStates.autoInvoiceNumberGenerateLoader && <Loader />}
                <>Auto generate invoice number</>
              </button>
            </div>
          </div>
          <div className='text-gray-500 flex justify-start items-center gap-1'>
            <p className='text-sm'>Last two created invoice numbers are : </p>
            {lastTwoInvoiceNumbers.length > 0 ? (
              <>
                {lastTwoInvoiceNumbers.map((no) => (
                  <span key={no?._id} className='text-gray-700 text-sm'>
                    {no?.invoiceNumber},
                  </span>
                ))}
              </>
            ) : (
              'Failed to fetch'
            )}
          </div>
        </div>
        <div className='flex justify-between items-center gap-3'>
          <Button
            onClick={() => {
              if (!invoiceNumber) {
                return toast.error(
                  'Invoice number is must to save invoice or summery sheet'
                );
              }
              reactToPrintFnInvoice();
              generateAndUploadInvoicePDF('print');
            }}
          >
            Print WMD Invoice
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              if (!invoiceNumber) {
                return toast.error(
                  'Invoice number is must to save invoice or summery sheet'
                );
              }
              generateAndUploadInvoicePDF('download');
              return;
            }}
            className='bg-green-700 text-white px-4 py-2 flex gap-1 items-center rounded ml-auto hover:bg-blue-200 hover:text-primary-color-extreme text-xs'
          >
            <MdOutlineFileDownload className='text-lg' />
            <p>Download WMD Invoice</p>
          </Button>
        </div>
      </div>
      <div
        className='border-2 border-black p-2'
        id={`WMD-${invoiceNumber}`}
        ref={contentRefInvoice}
      >
        <div className='  tracking-wider w-full  text-[0.75rem] font-semibold'>
          <div className='flex'>
            <div className='w-full flex flex-col gap-2 justify-center items-center'>
              <div className='w-[70%] flex-col flex gap-1 justify-center items-center text-base'>
                <h1 className='uppercase'>Jusco LTD</h1>
                <h2 className='uppercase'>Water Management</h2>
              </div>
              <div className=' flex-col flex gap-1 justify-center items-center text-base'>
                <h1>JOB STATEMENT / PROFORMA INVOICE FORMAT </h1>
                <p className='text-sm'>
                  (For making DO & Service Entry Sheet for service job){' '}
                </p>
              </div>
            </div>
            <div className='w-fit text-nowrap flex flex-col gap-1 justify-center items-center text-base'>
              <p>From No:- WMD/Bill/01</p>
              <p>Effective Dt: 16.12.2018</p>
            </div>
          </div>

          <div className='flex justify-between gap-4 mb-6 mt-10'>
            <div className='w-[50%] flex border-[1px] border-black'>
              <div className='h-full flex flex-col justify-between '>
                <span className='border-[1px] border-black p-1 pl-2'>1.</span>
                <span className='border-[1px] border-black p-1 pl-2'>2.</span>
                <span className='border-[1px] border-black p-1 pl-2'>3.</span>
                <span className='border-[1px] border-black p-1 pl-2'>4.</span>
                <span className='border-[1px] border-black p-1 pl-2'>5.</span>
                <span className='border-[1px] border-black p-1 pl-2'>6.</span>
                <span className='border-[1px] border-black p-1 pl-2'>7.</span>
              </div>
              <div className='h-full flex flex-col justify-between  w-fit'>
                <span className='border-[1px] border-black p-1 pl-2 font-bold'>
                  {' '}
                  Job Statement No:
                </span>
                <span className='border-[1px] border-black p-1 pl-2 font-bold'>
                  WO/PO no:
                </span>
                <span className='border-[1px] border-black p-1 pl-2 font-bold'>
                  Vendor&apos;s name:
                </span>
                <span className='border-[1px] border-black p-1 pl-2 font-bold'>
                  Job Location:
                </span>
                <span className='border-[1px] border-black p-1 pl-2 font-bold'>
                  Service Period:
                </span>
                <span className='border-[1px] border-black p-1 pl-2 font-bold'>
                  IO NO:
                </span>
                <span className='border-[1px] border-black p-1 pl-2 font-bold'>
                  Billing Details:
                </span>
              </div>
              <div className='h-full flex flex-col justify-between  flex-grow'>
                <span className='border-[1px] border-black p-1 pl-2'>
                  {invoiceNumber ? invoiceNumber : 'N/A'}
                </span>
                <span className='border-[1px] border-black p-1 pl-2'>
                  {' '}
                  {workOrder?.workOrderNumber}
                </span>
                <span className='border-[1px] border-black p-1 pl-2'>
                  {' '}
                  {ent?.name ? (
                    <span className='font-normal uppercase'>{ent?.name}</span>
                  ) : (
                    <span className='font-normal text-red-500 uppercase'>
                      No vendor name found. Try by Reloading
                    </span>
                  )}
                </span>
                <span className='border-[1px] border-black p-1 pl-2'>
                  {location}
                </span>
                <span className='border-[1px] border-black p-1 pl-2'>
                  {service}
                </span>
                <span className='border-[1px] border-black p-1 pl-2'>-</span>
                <span className='border-[1px] border-black p-1 pl-2'>
                  As Below
                </span>
              </div>
            </div>
            <div className='w-[40%] flex border-[1px] border-black justify-start h-fit'>
              <div className='h-full flex flex-col  w-fit'>
                <span className='border-[1px] border-black p-1 pl-2 font-bold'>
                  {' '}
                  Date of Receipt in
                </span>
                <span className='border-[1px] border-black p-1 pl-2'>
                  Date of Receipt in Bill section
                </span>
                <span className='border-[1px] border-black p-1 pl-2'>
                  DO No
                </span>
                <span className='border-[1px] border-black p-1 pl-2'>
                  SES Sheet No
                </span>
                <span className='border-[1px] border-black p-1 pl-2'>
                  Dt SESheet
                </span>
              </div>
              <div className='h-full flex flex-col  flex-grow'>
                <span className='border-[1px] border-black p-1 pl-2 flex-grow'>
                  -
                </span>
                <span className='border-[1px] border-black p-1 pl-2 flex-grow'>
                  -
                </span>
                <span className='border-[1px] border-black p-1 pl-2 flex-grow'>
                  -
                </span>
                <span className='border-[1px] border-black p-1 pl-2 flex-grow'>
                  -
                </span>
                <span className='border-[1px] border-black p-1 pl-2 flex-grow'>
                  -
                </span>
              </div>
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
                  SAP Line no
                </th>
                <th className='border-[1px] border-black pl-2 pb-3 '>SAC</th>
                <th className='border-[1px] border-black pl-2 pb-3 '>
                  Job Description
                </th>
                <th className='border-[1px] border-black pl-2 pb-3 '>Unit</th>
                <th className='border-[1px] border-black pl-2 pb-3 '>
                  Quantity
                </th>
                <th className='border-[1px] border-black pl-2 pb-3 '>Rate</th>
                <th className='border-[1px] border-black pl-2 pb-3 '>Amount</th>
              </thead>
              <tbody>
                {itemsList?.map((item: any, index: any) => (
                  <tr key={index}>
                    <td className='border-[1px] border-black pl-2 pb-3 '>
                      {index}
                    </td>
                    <td className='border-[1px] border-black pl-2 pb-3 '>-</td>
                    <td className='border-[1px] border-black pl-2 pb-3 '>
                      {item?.hsnNo}
                    </td>
                    <td className='border-[1px] border-black pl-2 pb-3 '>
                      {`${item?.itemName}`}
                    </td>
                    <td className='border-[1px] border-black pl-2 pb-3 '>
                      {`${item?.itemCost.unit}`}
                    </td>
                    <td className='border-[1px] border-black pl-2 pb-3 '>
                      {`${(item?.itemCost.hours).toFixed(2)}`}
                    </td>
                    <td className='border-[1px] border-black pl-2 pb-3 '>
                      {' '}
                      {`${(item?.itemPrice).toFixed(2)}`}
                    </td>
                    <td className='border-[1px] border-black pl-2 pb-3 '>
                      {' '}
                      {`${(item?.itemCost.itemCost).toFixed(2)}`}
                    </td>
                  </tr>
                ))}

                {/* total row */}
                <tr className='border-t-2 border-t-gray-600'>
                  <td className='border-[1px] border-black pl-2 pb-3 '></td>
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
                  <td className='border-[1px] border-black pl-2 pb-3 '>{`${total.toFixed(
                    2
                  )} `}</td>
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
                  <td className='border-[1px] border-black pl-2 pb-3 '></td>
                  <td className='border-[1px] border-black pl-2 pb-3 '>
                    Add CGST @
                  </td>
                  <td className='border-[1px] border-black pl-2 pb-3 '>{`${totalCgst.toFixed(
                    2
                  )} `}</td>
                </tr>
                {/* total SGST Row */}
                <tr className='border-t-2 border-t-gray-600'>
                  <td className='border-[1px] border-black pl-2 pb-3 '></td>
                  <td className='border-[1px] border-black pl-2 pb-3 '></td>

                  {/* <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td> */}

                  <td className='border-[1px] border-black pl-2 pb-3 '></td>
                  <td className='border-[1px] border-black pl-2 pb-3 '></td>
                  <td className='border-[1px] border-black pl-2 pb-3 '></td>
                  <td className='border-[1px] border-black pl-2 pb-3 '></td>
                  <td className='border-[1px] border-black pl-2 pb-3 '>
                    Add SGST @
                  </td>
                  <td className='border-[1px] border-black pl-2 pb-3 '>{`${totalSgst.toFixed(
                    2
                  )} `}</td>
                </tr>
                {/* grand total row */}
                <tr className='border-t-2 border-gray-600'>
                  <td className='border-[1px] border-black pl-2 pb-3 '></td>
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
                    {`${parseFloat(grandTotal).toFixed(2)} INR`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className='flex gap-4 items-center justify-between  mt-6'>
          <div className='w-[30%]  flex flex-col  border-[1px] border-black'>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Sign:</span>
              <span className='font-normal'></span>
            </div>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Name:</span>
              <span className='font-normal'></span>
            </div>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Date:</span>
              <span className='font-normal'></span>
            </div>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span className='font-normal'>JS Rcvd in Exe Sec </span>
              <span className='font-normal'></span>
            </div>
          </div>
          <div className='w-[30%]  flex flex-col '>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Sign:</span>
              <span className='font-normal'></span>
            </div>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Name:</span>
              <span className='font-normal'></span>
            </div>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Date:</span>
              <span className='font-normal'></span>
            </div>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Certified by Site Engg/ Officer </span>
              <span className='font-normal'></span>
            </div>
          </div>
          <div className='w-[30%]  flex flex-col '>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Sign: </span>
              <span className='font-normal'></span>
            </div>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Name:</span>
              <span className='font-normal'></span>
            </div>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Date:</span>
              <span className='font-normal'></span>
            </div>
            <div className='w-full flex gap-2 border-[1px] border-black p-1'>
              <span>Certified by Mgr/ Sr Mgr </span>
              <span className='font-normal'></span>
            </div>
          </div>
        </div>
        <div className='flex gap-4 items-center justify-between mt-6'>
          <div className='w-[30%] flex flex-col border-[1px] border-black'>
            <span className='font-semibold border-[1px] border-black p-1'>
              Name & Sign & Date
            </span>
            <span className='font-normal border-[1px] border-black p-1'>
              JS Rcvd in Bill Sec{' '}
            </span>
          </div>
          <div className='w-[30%] flex flex-col '>
            <span className='font-semibold'>Name & Sign & Date</span>
            <div className='h-[50] w-[50]'>
              <Image
                src={'/assets/stamp.jpg'}
                width={100}
                height={100}
                alt='sign image'
              />{' '}
            </div>
          </div>
        </div>

        <div className='p-4'>
          <p className='font-bold'>Note</p>
          <p>
            1. Attach / Put stamp for Vendor Evaluation with all Job Statement{' '}
          </p>
          <p>
            2 Before certifying Job statement, pls check PO balance Value ,
            Validity & IO Budget{' '}
          </p>
        </div>
      </div>

      <div className='mt-10 flex justify-between items-center pr-6 '>
        <Button
          onClick={() => {
            if (!invoiceNumber) {
              return toast.error(
                'Invoice number is must to save invoice or summery sheet'
              );
            }
            reactToPrintFnSummary();
            generateAndUploadInvoiceSummaryPDF('print');
          }}
        >
          Print Summary Sheet
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            if (!invoiceNumber) {
              return toast.error(
                'Invoice number is must to save invoice or summery sheet'
              );
            }
            generateAndUploadInvoiceSummaryPDF('download');
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
          id={`WMD-${invoiceNumber}-summary`}
          ref={contentRefSummary}
          className='flex flex-col justify-center items-center w-full '
        >
          <h2 className='text-center font-bold mb-4 text-base flex gap-1 mx-auto '>
            WMD Invoice no.{' '}
            {/* <p className='tracking-wide'>{invoiceState?.invoiceNo}</p> Summary
            Sheet
          </h2> */}
            <p className='tracking-wide'>{invoiceNumber}</p> Summary Sheet
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
                  Item no.
                </th>
                <th className='border-[1px] border-black capitalize py-1 pb-2  text-center '>
                  date
                </th>
                <th className='border-[1px] border-black capitalize py-1 pb-2  text-center '>
                  location
                </th>
                <th className='border-[1px] border-black capitalize py-1 pb-2  text-center '>
                  working Duration
                </th>
              </thead>
              <tbody>{contentArray}</tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};
export default WMDInvoice;

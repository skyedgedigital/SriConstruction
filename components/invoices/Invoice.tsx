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
import { formatDate } from 'date-fns';
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
const Invoice = ({
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
  const [lastTwoInvoiceNumbers, setLastTwoInvoiceNumbers] = useState<
    { _id: string; invoiceNumber: string }[]
  >([]);
  const [itemsList, setItemsList] = useState([]);
  const [dateMapping, setDateMapping] = useState({});
  const contentInvoiceRef = useRef(null);
  const reactToPrintFnInvoice = useReactToPrint({
    contentRef: contentInvoiceRef,
  });
  const contentSummaryRef = useRef(null);
  const reactToPrintFnSummary = useReactToPrint({
    contentRef: contentSummaryRef,
  });

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
  console.log('ITEMS', items);

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

      console.log('UPDATED ITEMS', updatedItems);
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
        console.log('RESP', resp.data);
        setDateMapping(resp.data);
      }
    };

    fn();
    summarySheetInfo();
  }, [items, selectedChalanNumbers]);

  const displayDate = (itemName: string) => {
    // let date = dateMapping?.get(itemName).from;
    // console.log(date);
    // return '';
  };

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
      <tr className={`bg-gray-100`}>
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] border-black py-2  text-center '>-</td>{' '}
        <td className='border-[1px] bg-300 border-black py-2 font-bold  text-center '>
          Item total Duration
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
        Total Duration
      </td>
      <td className='border-[1px] border-black py-2  text-center '>
        {/* {totalHourObject[key]} */}
        {new_total_hours.toFixed(2)}
      </td>
    </tr>
  );

  const generatePDF = async (printOrDownload: string) => {
    const originalElementId = invoiceNumber;

    const pdf = new jsPDF('l', 'pt', 'a4');
    const originalElement = document.getElementById(originalElementId)!;
    const element = originalElement.cloneNode(true) as HTMLElement;

    element.style.width = '1250px';

    pdf.html(element, {
      callback: async () => {
        // Generate the PDF as a data URL
        const pdfDataUrl = pdf.output('dataurlstring');
        const fileName = `Invoice-${invoiceNumber}.pdf`;
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
        if (printOrDownload === 'download') pdf.save(fileName);

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
          toast.success('Invoice saved successfully');
        }
        // deducting workorder balance
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
    const originalElementId = `${invoiceNumber}-summary`;

    // console.log('found element', elementId);
    const pdf = new jsPDF('l', 'pt', 'a4');
    const originalElement = document.getElementById(originalElementId)!;
    const element = originalElement.cloneNode(true) as HTMLElement;

    element.style.width = '1250px';

    pdf.html(element, {
      callback: async () => {
        const pdfDataUrl = pdf.output('dataurlstring');
        const fileName = `Invoice-${invoiceNumber}-summary.pdf`;
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
  console.log('TOTAL', total);
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
  // console.log('yeich hai items array bawa', items);
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
    <main className=' w-full flex flex-col gap-1 p-4 pt-20'>
      <div className='flex justify-between items-end p-6 '>
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
            Print Invoice
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
            <p>Download Invoice</p>
          </Button>
        </div>
      </div>
      <div className=' flex items-center justify-center '>
        <div
          className=' border-[1px] border-gray-700  tracking-wider w-full  text-[0.75rem] font-semibold'
          id={`${invoiceNumber}`}
          ref={contentInvoiceRef}
        >
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
              {ent?.name ? (
                <h1 className='font-normal uppercase mb-2'>{ent?.name}</h1>
              ) : (
                <h1 className='font-normal text-red-500 uppercase mb-2'>
                  No company found. Try by Reloading
                </h1>
              )}
            </div>
            <div className=''>
              <p className=' border-b-2 border-b-black w-fit pr-2 pb-2'>
                Specialist in : Horticulture, Conservancy Services, Supply of
                Equipments (F-15 Crane and JCB)
              </p>
              {ent?.address ? (
                <p className='font-normal pt-2'>Address: {ent?.address}</p>
              ) : (
                <p className='font-normal text-red-500 uppercase pt-2'>
                  Address: No address found. Try by Reloading
                </p>
              )}
              <p>Mobile : 9431133471, 9234973465</p>
              {ent?.email ? (
                <p className='font-normal mb-2'>Email: {ent?.email}</p>
              ) : (
                <p className='font-normal text-red-500 uppercase mb-2'>
                  Email: No email found. Try by Reloading
                </p>
              )}{' '}
            </div>
          </div>
          <div className='border-2 border-black w-full pb-10'>
            <h1 className='font-bold text-center w-full py-1'>
              PROFOMA INVOICE
            </h1>
            <div className='w-full text-center border-t-2 border-b-2 my-1  border-gray-700 py-1 justify-around  flex '>
              <div className='font-bold flex gap-2 pb-1 items-center '>
                <p> GST IN:</p>
                {ent?.gstin ? (
                  <p className='font-normal uppercase mb-2'> {ent?.gstin}</p>
                ) : (
                  <p className='font-normal text-red-500 uppercase mb-2'>
                    No GSTIN found. Try by Reloading
                  </p>
                )}
              </div>
              <div className='font-bold flex gap-2 items-center pb-1'>
                <p>PAN:</p>
                {ent?.pan ? (
                  <p className='font-normal uppercase mb-2'>{ent?.pan}</p>
                ) : (
                  <p className='font-normal text-red-500 uppercase mb-2'>
                    No PAN found. Try by Reloading
                  </p>
                )}
              </div>
            </div>
            <div className=' w-full flex flex-1 justify-around my-4 gap-3 overflow-x-scroll px-5 py-2'>
              <div className='flex flex-col gap-1 min-w-52'>
                <h1 className='uppercase'>CUSTOMER NAME & ADDRESS</h1>
                <div>
                  <div>To</div>
                  <div>The CFO</div>
                  <div>Tata Steel UISL</div>
                  <div className='flex gap-4 items-center'>
                    <p>Through :-</p> <p>{department}</p>
                  </div>
                  <div className='font-bold flex gap-2 items-center'>
                    <p>GSTIN/UN</p>
                    {ent?.gstin ? (
                      <p className='font-normal uppercase mb-2'>{ent?.gstin}</p>
                    ) : (
                      <p className='font-normal text-red-500 uppercase mb-2'>
                        No GSTIN/UN found. Try by Reloading
                      </p>
                    )}
                  </div>
                  <div className='flex gap-4 items-center'>
                    <p>Place of Supply:</p> <p>{location}</p>
                  </div>
                  <div className='mt-2'>STATE CODE : Jharkhand - 20</div>
                </div>
              </div>
              <div className='flex flex-col gap-1 min-w-52'>
                <div className='flex gap-4 items-center '>
                  <p>Invoice no:</p>
                  <p>
                    {/* SE/{todayDate().split('/')[2].substring(2, 4)}-
                    {Number(todayDate().split('/')[2].substring(2, 4)) + 1}/ */}
                    SE/{getYearForInvoiceNaming()}/{invoiceNumber}
                  </p>
                </div>
                <div className='flex gap-4 items-center'>
                  <p>Date of Issue :</p>
                  <p> {todayDate()}</p>
                </div>
                <div className='flex gap-4 items-center'>
                  <p>Vendor code: </p>
                  {ent?.vendorCode ? (
                    <p className='font-normal  mb-2'>{ent?.vendorCode}</p>
                  ) : (
                    <p className='font-normal text-red-500 uppercase mb-2'>
                      No Vendor code found. Try by Reloading
                    </p>
                  )}
                </div>
                <div className='flex gap-4 items-center'>
                  <p>WO/PO No: </p> <p>{workOrder?.workOrderNumber}</p>
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
            <div className='flex flex-col gap-0 '>
              <p className='font-semibold text-center w-full p-1 pb-2  border-[1px]  border-gray-600 border-b-transparent'>
                {workOrder?.workDescription}
              </p>
              <div className='overflow-x-scroll w-full'>
                {' '}
                <table className='w-full  text-[0.75rem] font-semibold border-collapse '>
                  <thead className='font-semibold  w-full text-[0.75rem]'>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      Item No:
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      HSN/SAC
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      Description of Goods Service
                    </th>
                    {/* <th className='border-[1px] border-black pl-2 pb-3 '>Qty.</th>
                  <th className='border-[1px] border-black pl-2 pb-3 '>UOM</th> */}
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      {/* Rate. (INR) */}
                      Quantity
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      UOM
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      {/* Quantity */}
                      Rate. (INR)
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      Value
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      C GST rate
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      S GST rate
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      C GST Amount(INR)
                    </th>
                    <th className='border-[1px] border-black pl-2 pb-3 '>
                      S GST Amount(INR)
                    </th>
                  </thead>
                  <tbody>
                    {itemsList?.map((item: any, index: any) => (
                      <tr key={index}>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {item?.itemNumber}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {item?.hsnNo}
                          {/* {console.warn(item.hsnNo)} */}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {item?.itemName}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {/* {`${item?.itemPrice}`} */}
                          {`${(item?.itemCost.hours).toFixed(2)}`}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {`${item?.itemCost.unit}`}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {`${item?.itemPrice?.toFixed(2)}`}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {`${item?.itemCost.itemCost?.toFixed(2)}`}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          9%
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          9%
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {(0.09 * item?.itemCost.itemCost).toFixed(2)}{' '}
                        </td>
                        <td className='border-[1px] border-black pl-2 pb-3 '>
                          {(0.09 * item?.itemCost.itemCost).toFixed(2)}{' '}
                        </td>
                      </tr>
                    ))}

                    {/* total row */}
                    <tr className='border-t-2 border-t-gray-600'>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>

                      {/* <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td>
                    <td className='border-[1px] border-black pl-2 pb-3 '></td> */}

                      <td className='border-[1px] border-black pl-2 pb-3 '>
                        Total
                      </td>
                      <td className='border-[1px] border-black pl-2 pb-3 '>{`${total?.toFixed(
                        2
                      )} `}</td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '>
                        {totalCgst.toFixed(2)}
                      </td>
                      <td className='border-[1px] border-black pl-2 pb-3 '>
                        {totalSgst.toFixed(2)}
                      </td>
                    </tr>
                    {/* grand total row */}
                    <tr className='border-t-2 border-gray-600'>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
                      <td className='border-[1px] border-black pl-2 pb-3 '></td>
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
                        {`${parseFloat(grandTotal.toFixed(2))} INR`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className=' flex justify-between mt-2 gap-2'>
              <div className='flex flex-col gap-3 mt-3 ml-2'>
                <span className='w-full flex items-center gap-2 '>
                  <p className='font-semibold'>Rupees in word: </p>
                  <p>
                    {/* {number2text(
                      totalCGSTPrice + totalItemsPrice + totalSGSTPrice
                    )} */}
                    {`${numberToWords(grandTotal)} only`}
                  </p>
                </span>
                <div className='font-semibold w-fit flex justify-center items-end gap-5'>
                  <p>
                    Whether tax is payable under Reverse charge Mechanism or
                    not:
                  </p>
                  <p>No</p>
                </div>
              </div>
              <div className='ml-auto mr-10 flex items-center  font-bold flex-col gap-6 '>
                <p className=' font-mono '>M/s SHEKHAR ENTERPRISES</p>
                <Image
                  src={'/assets/stamp.jpg'}
                  width={'100'}
                  height={'100'}
                  alt='sign image'
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                />
              </div>
            </div>
          </div>
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
          id={`${invoiceNumber}-summary`}
          className='flex flex-col justify-center items-center w-full '
          ref={contentSummaryRef}
        >
          <h2 className='text-center font-bold mb-4 text-base flex gap-1 mx-auto '>
            Invoice no.{' '}
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
                  Chalan no.
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

export default Invoice;

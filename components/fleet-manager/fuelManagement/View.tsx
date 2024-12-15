import fuelManagementAction from '@/lib/actions/fuelManagement/fuelManagementAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getChalansForFuelManagement } from '@/lib/actions/chalan/fetch';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { formatCurrency } from '@/utils/formatCurrency';

const View = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [result, setResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);

  const [total, setTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  let months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  let years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
  useEffect(() => {
    const fn = async () => {
      const resp = await vehicleAction.FETCH.fetchAllVehicles();
      console.warn(resp);
      if (resp.success) {
        if (resp?.data) {
          setVehicles(JSON.parse(resp?.data));
        }
      } else {
        toast.error(
          resp.message || 'Failed to Load vehicles, Please Try Later'
        );
      }
    };
    fn();
  }, []);
  const verify = (): boolean => {
    // if (selectedOption === '') {
    //   toast.error('No Vehicle Selected');
    //   return false;
    // }
    if (selectedMonth === '') {
      toast.error('No Month Selected');
      return false;
    }
    if (selectedYear === '') {
      toast.error('No Year Selected');
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verify()) {
      return;
    }
    console.log(selectedOption);
    // const resp1=await getChalansForFuelManagement(selectedMonth,selectedYear,selectedOption)
    // const resp1Data=await JSON.parse(resp1.data);
    let resp1Data = [];
    console.log('yeto resp1data hai', resp1Data);
    const resp = await fuelManagementAction.FETCH.fetchFuelManagement(
      selectedOption,
      selectedMonth,
      selectedYear
    );
    if (resp.success) {
      const respData = JSON.parse(resp.data);
      console.log('yeto respdata hai', respData);

      const combinedArray = resp1Data.concat(respData?.fuelManagement);
      console.log('yeto combined hai', combinedArray);
      // Sort the combined array by the date field
      //const sortedArray = combinedArray.sort((a, b) => a.date.getTime() - b.date.getTime());
      console.log(resp);
      setResult(combinedArray);
      if (respData?.total) {
        console.log('TOTAL', total);
        setTotal(respData?.total);
      }
    } else {
      toast.error(resp.message || 'Failed to load data, Please try later');
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const exportToExcelHandler = async () => {
    console.log('first');
    const excelReportTitle = `Fuel Report for month: ${selectedMonth} year:${selectedYear}`;
    const rowsForTitle = [[excelReportTitle], []];

    const worksheetData = result?.map((item: any) => {
      return {
        Date: formatDate(item?.date),
        'Vehicle No.': item?.vehicleNumber || 'No Vehichle',
        'Meter Reading': item?.meterReading || 0,
        'Fuel Qty.': item?.fuel || 0,
        Amount: item?.amount || 0,
      };
    });

    worksheetData.push({
      Date: '',
      'Vehicle No.': '',
      'Meter Reading': '',
      'Fuel Qty.': 'Total',
      Amount: total,
    });

    const combinedExcelRows = rowsForTitle.concat(
      XLSX.utils.sheet_to_json(XLSX.utils.json_to_sheet(worksheetData), {
        header: 1,
      })
    );

    const worksheet = XLSX.utils.aoa_to_sheet(combinedExcelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fuel Report');
    XLSX.writeFile(
      workbook,
      `fuel_report_${selectedMonth}_${selectedYear}.xlsx`
    );
    toast.success('Export Completed');
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className='max-w-md mx-auto mt-4 p-6 bg-white shadow-md rounded-md flex-wrap'
      >
        <div className='mb-4'>
          <label
            htmlFor='dropdown'
            className='block text-sm font-medium text-gray-700'
          >
            Select a Vehicle:
          </label>
          <select
            id='dropdown'
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>All vehicles for selected month & year</option>
            {/* <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option> */}
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.vehicleNumber}>
                {vehicle.vehicleNumber}
              </option>
            ))}
          </select>
        </div>

        <div className='mb-4'>
          <label
            htmlFor='dropdown'
            className='block text-sm font-medium text-gray-700'
          >
            Select a Month:
          </label>
          <select
            id='dropdown'
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            {/* <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option> */}
            {months.map((ele) => (
              <option key={ele} value={ele}>
                {ele}
              </option>
            ))}
          </select>
        </div>

        <div className='mb-4'>
          <label
            htmlFor='dropdown'
            className='block text-sm font-medium text-gray-700'
          >
            Select a Year:
          </label>
          <select
            id='dropdown'
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            {/* <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option> */}
            {years.map((ele) => (
              <option key={ele} value={ele}>
                {ele}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type='submit'
            className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            View Summary
          </button>
        </div>
      </form>

      <div className='flex items-center justify-center mt-5 p-2 flex-col min-w-full'>
        {result?.length > 0 && (
          <Button
            className='mt-4 mb-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 mr-auto'
            onClick={exportToExcelHandler}
          >
            Export to Excel
          </Button>
        )}
        {result && (
          <div className='text-2xl'>List Of Entries/Chalans for Fuel</div>
        )}
      </div>
      {result && (
        <div className='flex flex-col items-center justify-center mt-6'>
          <span className='mr-auto ml-3 my-2 text-gray-500'>
            Total Documents : {result?.length}
          </span>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Date
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Vehicle Number
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  MeterReading
                </th>

                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Fuel Quantity
                </th>

                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Amount
                </th>

                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {console.log('The Result', result)}
              {result?.map((ele) => (
                <tr key={ele._id} className='hover:bg-gray-100'>
                  <td className='px-6 py-2 text-base whitespace-nowrap'>
                    {formatDate(ele.date)}
                  </td>
                  <td className='px-6 py-2 text-base whitespace-nowrap'>
                    {ele?.vehicleNumber}
                  </td>
                  <td className='px-6 py-2 text-base whitespace-nowrap'>
                    {ele.meterReading}
                  </td>
                  <td className='px-6 py-2 text-base whitespace-nowrap'>
                    {<span>{`${ele.fuel} Ltrs`}</span>}
                  </td>
                  <td className='px-6 py-2 text-base whitespace-nowrap'>
                    {formatCurrency(ele?.amount)}
                  </td>

                  <td className='px-6 py-2 text-base whitespace-nowrap'>
                    <button
                      className='text-red-500'
                      onClick={async () => {
                        const resp =
                          await fuelManagementAction.DELETE.deleteFuelManagement(
                            ele._id
                          );
                        if (resp.success) {
                          toast.success('Deleted,Reload to view Changes');
                        } else {
                          toast.error('Something went wrong');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className='font-semi text-lg py-2'>
                  Total : {formatCurrency(total)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default View;

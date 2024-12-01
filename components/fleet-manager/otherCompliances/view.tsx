import complianceAction from '@/lib/actions/compliances/complianceAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const View = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [result, setResults] = useState(null);
  const [selectedCompliance, setSelectedCompliance] = useState('');
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
  const options = [
    'EMI',
    'INSURANCE',
    'TAX',
    'FITNESS',
    'LOAD TEST',
    'SAFETY',
    'PUC',
    'OTHER',
  ];
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
    if (selectedOption === '') {
      toast.error('Select A Vehicle');
      return false;
    }
    if (selectedMonth === '') {
      toast.error('Select A Month');
      return false;
    }
    if (selectedYear === '') {
      toast.error('Select A Year');
      return false;
    }
    return true;
  };
  const handleDelete = async (complianceId: any) => {
    const resp = await complianceAction.DELETE.deleteCompliance(complianceId);
    if (resp.success) {
      toast.success(resp.message);
    } else {
      toast.error(resp.message);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let searchObj: any = {
      vehicleNumber: selectedOption,
      month: selectedMonth,
      year: selectedYear,
    };
    if (selectedCompliance !== '') {
      searchObj.compliance = selectedCompliance;
    }

    const resp = await complianceAction.FETCH.fetchCompliance(
      JSON.stringify(searchObj)
    );
    if (resp.success) {
      setResults(JSON.parse(resp.data));
      toast.success(resp.message);
    } else {
      toast.error(
        resp.message || 'Failed to Load Compliance, Please try later'
      );
    }
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
            <option value=''>Select...</option>
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
            Select a Compliance:
          </label>
          <select
            id='dropdown'
            value={selectedCompliance}
            onChange={(e) => setSelectedCompliance(e.target.value)}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            {/* <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option> */}
            {options.map((ele) => (
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
            Select Month:
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
            Select Year:
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
            View Compliances
          </button>
        </div>
      </form>

      {result && (
        <div className='mt-2 flex p-2 text-3xl items-center justify-center'>
          Compliances Filed
        </div>
      )}
      {result && (
        <>
          <div className='flex flex-col items-center justify-center mt-6'>
            {result.length === 0 && (
              <span className='mt-4'>No Tools Present</span>
            )}
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Compliance
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
                    Month/Year
                  </th>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {result.map((ele) => (
                  <tr key={ele._id} className='hover:bg-gray-100'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {ele.compliance}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {ele.amount}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {ele.month}/{ele.year}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {' '}
                      {formatDate(ele.Date)}{' '}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <button
                        onClick={() => handleDelete(ele._id)}
                        className='text-red-600 hover:text-red-900'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};

export default View;

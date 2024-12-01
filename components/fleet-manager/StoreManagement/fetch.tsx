import storeManagementAction from '@/lib/actions/storeManagement/storeManagementAction';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const ViewTool = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [result, setResults] = useState(null);
  useEffect(() => {
    const fn = async () => {
      const resp = await vehicleAction.FETCH.fetchAllVehicles();
      console.warn(resp);
      if (resp.success) {
        if (resp.data) {
          setVehicles(JSON.parse(resp.data));
        }
      } else {
        toast.error(
          resp.message || 'failed to load vahicles, Please try later'
        );
      }
    };
    fn();
  }, []);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedOption === '') {
      toast.error('Select A Vehicle First');
      return;
    }
    const resp = await storeManagementAction.FETCH.fetchStoreManagement(
      selectedOption
    );
    if (resp.success) {
      setResults(JSON.parse(resp.data));
      toast.success('Tools Fetched');
    } else {
      toast.error('An Error Occurred');
    }
  };
  // function handleDelete(_id: any): void {
  //     throw new Error("Function not implemented.");
  // }

  // function handleUpdate(_id: any): void {
  //     throw new Error("Function not implemented.");
  // }

  const handleDelete = async (toolId: any) => {
    const resp = await storeManagementAction.DELETE.deleteStoreManagement(
      toolId
    );
    if (resp.success) {
      toast.success('Tool Deleted');
    } else {
      toast.error('An Error Occurred');
    }
  };

  const handleReturn = async (storeId: any) => {
    // const resp = await storeManagementAction.UPDATE.updateStoreManagement(storeId,JSON.stringify(updates))
    const resp = await storeManagementAction.UPDATE.returnTool(storeId);
    if (resp.success) {
      toast.success('Tool Returned');
    } else {
      toast.error('An Error Occurred');
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

        <div>
          <button
            type='submit'
            className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            View Tools
          </button>
        </div>
      </form>

      {result && (
        <div className='mt-2 flex p-2 text-3xl items-center justify-center'>
          Tools assigned
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
                    Tool
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Quantity
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Total Price
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Allotment Date
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Return Date
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Status
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
                      {ele.tool.toolName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {ele.quantity}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {ele.totalPrice}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {' '}
                      {formatDate(ele.dateOfAllotment)}{' '}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {' '}
                      {formatDate(ele.dateOfReturn)}{' '}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {ele.returned ? (
                        <span className='text-green-500'>Returned</span>
                      ) : (
                        <span className='text-red-500'>Not Returned</span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <button
                        onClick={() => handleDelete(ele._id)}
                        className='text-red-600 hover:text-red-900'
                      >
                        Delete
                      </button>
                      {!ele.returned && (
                        <button
                          onClick={() => handleReturn(ele._id)}
                          className='text-green-600 hover:blue-red-900 ml-2 text-sm'
                        >
                          Returned
                        </button>
                      )}
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

export default ViewTool;

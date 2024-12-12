import { IFuel, IFuelPrices } from '@/interfaces/fuel.interface';
import fuelManagementAction from '@/lib/actions/fuelManagement/fuelManagementAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const FuelType = ['petrol', 'diesel'];
const FuelPrices = () => {
  const [fuelInfo, setFuelInfo] = useState<IFuelPrices>({
    fuelType: '',
    price: 0,
  });

  const [savedFuelPrices, setSavedFuelPrices] = useState<IFuelPrices[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reloadPrices, setReloadPrices] = useState<boolean>(true);

  useEffect(() => {
    const fn = async () => {
      try {
        setLoading(true);
        const res = await fuelManagementAction.FETCH.fetchSavedFuelPrices();
        if (res.success) {
          // console.log('FETCHED SUCCESSFULLY')
          setSavedFuelPrices(res.data);
          toast.success(res.message);
        }
        if (!res.success) {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error(error || 'Failed to fetch fuel prices, Please try later');
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, [reloadPrices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fuelInfo.fuelType) {
      return toast.error('Please select fuel type');
    }
    if (fuelInfo.price <= 0) {
      return toast.error('Fuel price must me greater than 0');
    }

    try {
      const res = await fuelManagementAction.CREATE.saveFuelPrices(fuelInfo);
      if (res.success) {
        console.log('saved price', res.data);
        toast.success(res.message);
        setReloadPrices(!reloadPrices);
      } else {
        console.log('ERROR', res.error);
        toast.error(res.message);
      }
    } catch (error) {
      console.log('FUEL PRICE ERROR', error);
      toast.error(JSON.stringify(error));
    }
  };
  return (
    <section className='grid grid-cols-1 grid-rows-2 md:grid-cols-2 gap-6'>
      <div className='mt-4 p-6 bg-white shadow-md rounded-md flex-wrap flex flex-col gap-3          '>
        <h3 className='font-semibold '>Fill Details</h3>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label
              htmlFor='dropdown'
              className='block text-sm font-medium text-gray-700'
            >
              Select Fuel
            </label>
            <select
              id='dropdown'
              value={fuelInfo.fuelType}
              onChange={(e) => {
                setFuelInfo((info) => ({
                  ...info,
                  fuelType: e.target.value,
                }));
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            >
              <option value=''>Select...</option>
              {FuelType.map((ele) => (
                <option key={ele} value={ele}>
                  {ele}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-4'>
            <label
              htmlFor='input'
              className='block text-sm font-medium text-gray-700'
            >
              Amount (in rupees):
            </label>
            <input
              type='number'
              id='input'
              step={0.001}
              value={fuelInfo.price}
              onChange={(e) => {
                setFuelInfo((info) => ({
                  ...info,
                  price: parseFloat(e.target.value),
                }));
              }}
              className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter Tool Here'
              min={'1'}
            />
          </div>
          <div>
            <button
              type='submit'
              className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
      <div className='mt-4 p-6 bg-white shadow-md rounded-md flex-wrap flex flex-col gap-3          '>
        <h3 className='font-semibold text-blue-500'>Current Saved prices</h3>
        {savedFuelPrices.length > 0 && !loading ? (
          <table className='flex-1'>
            <thead className='bg-gray-100 border-[1px] border-b-gray-200'>
              <th className='text-center py-2'>Fuel Type</th>
              <th className='text-center py-2'>Price</th>
            </thead>
            <tbody>
              {savedFuelPrices.map((info) => (
                <tr
                  key={info.fuelType}
                  className='border-[1px] border-b-gray-200'
                >
                  <td className='text-center py-2'>{info?.fuelType}</td>
                  <td className='text-center'>{info?.price}</td>
                </tr>
              ))}
              <tr>
                <td></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className='flex-1'>Loading fuel prices...</p>
        )}
        <div>
          <button
            onClick={() => setReloadPrices(!reloadPrices)}
            className='w-full inline-flex justify-center py-2 px-4  shadow-sm text-sm font-medium rounded-md  border-[1px] border-blue-400 text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Refresh Details
          </button>
        </div>
      </div>
    </section>
  );
};

export default FuelPrices;

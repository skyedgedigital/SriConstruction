'use client';

import { IWorkOrder } from '@/interfaces/workOrder.interface';
import workOrderAction from '@/lib/actions/workOrder/workOrderAction';
import { formatCurrency } from '@/utils/formatCurrency';
import { DividerVerticalIcon } from '@radix-ui/react-icons';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const WorkOrderView = () => {
  const [workOrders, setWorkOrders] = useState<IWorkOrder[]>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  useEffect(() => {
    const fn = async () => {
      const result = await workOrderAction.FETCH.fetchAllWorkOrder();
      if (result.success) {
        toast.success(result.message);
        const parsedResult = JSON.parse(result.data);
        setWorkOrders(parsedResult);
      }
    };
    fn();
  }, []);

  const handleView = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setShowModal(true);
  };
  return (
    <section className='p-4'>
      <div className='w-1/2 flex flex-col gap-1 border-[1px] border-gray-300 rounded p-2 justify-start items-center lg:min-h-[calc(100vh-2rem)]'>
        <div className='flex justify-between items-center w-full px-3'>
          <h2 className='flex justify-center text-xl'>
            List of Fleet Work Orders
          </h2>
          {
            <p className='text-gray-400'>
              {workOrders ? <>({workOrders?.length} workorders)</> : ''}
            </p>
          }
        </div>
        <div className=' w-full p-1 rounded-sm'>
          {workOrders?.map((ele) => (
            <div
              key={ele?._id}
              className='p-2 flex rounded-sm  border-b hover:bg-gray-200 items-center justify-between'
            >
              <div className='flex flex-col gap-1'>
                <span className='flex justify-start items-center gap-1'>
                  <p className='text-sm text-gray-600'>Work Order Number:</p>
                  <p> {ele.workOrderNumber}</p>
                </span>
                <div className='flex justify-start items-center gap-2'>
                  <div className=' text-sm flex justify-start items-center gap-1'>
                    <p className='text-gray-500'>value:</p>
                    <p className='text-blue-500'>
                      {formatCurrency(ele?.workOrderValue)}
                    </p>
                  </div>
                  <DividerVerticalIcon />
                  <div className=' text-sm flex justify-start items-center gap-1'>
                    <p className='text-gray-500'>Balance:</p>
                    <p className='text-green-600'>
                      {formatCurrency(ele?.workOrderBalance)}
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex space-x-2'>
                <button
                  onClick={() => handleView(ele)}
                  className='text-blue-500 bg-white px-2 py-1 rounded-sm'
                >
                  View
                </button>{' '}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && selectedWorkOrder && (
        <>
          <div className='lg:min-w-[33%] justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
            <div className='relative w-auto my-6 mx-auto max-w-3xl'>
              <div className=' rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
                <div className='flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t'>
                  <h3 className='text-xl font-semibold'>Work Order Details</h3>
                  <button
                    className='p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none'
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className='relative p-6 flex flex-col'>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm  text-gray-700'>
                      Work Order Number:
                    </label>{' '}
                    <div className='flex justify-start items-center gap-3'>
                      {selectedWorkOrder?.workOrderNumber ? (
                        <span className='text-md font-semibold'>
                          {selectedWorkOrder?.workOrderNumber}
                        </span>
                      ) : (
                        <span className='text-md text-red-400'>
                          Did not found any value. Try by saving this workorder
                          again
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2 '>
                    <label className='block text-sm  text-gray-700 '>
                      Description:
                    </label>
                    {selectedWorkOrder?.workDescription ? (
                      <span className='text-md '>
                        {selectedWorkOrder?.workDescription}
                      </span>
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>

                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm  text-gray-700'>
                      Validity:
                    </label>
                    {selectedWorkOrder?.workOrderValidity ? (
                      <span className='text-md '>
                        {new Date(
                          selectedWorkOrder?.workOrderValidity
                        ).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm  text-gray-700'>
                      Value:
                    </label>
                    {selectedWorkOrder?.workOrderValue ? (
                      <span className='text-md  '>
                        {formatCurrency(selectedWorkOrder?.workOrderValue)}
                      </span>
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm  text-gray-700'>
                      Remained Balance:
                    </label>
                    {selectedWorkOrder?.workOrderBalance ? (
                      selectedWorkOrder?.workOrderBalance > 0 ? (
                        <span className='text-md '>
                          {formatCurrency(selectedWorkOrder?.workOrderBalance)}
                        </span>
                      ) : (
                        <span className='text-md  text-red-500'>
                          {formatCurrency(selectedWorkOrder?.workOrderBalance)}
                        </span>
                      )
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2 '>
                    <label className='block text-sm  text-gray-700 '>
                      Units:
                    </label>
                    {selectedWorkOrder?.units ? (
                      selectedWorkOrder?.units?.map((un, i) => (
                        <span key={un} className='text-md '>
                          {un}
                          {selectedWorkOrder?.units?.length !== i + 1 && ','}
                        </span>
                      ))
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>
                  {/* Add more details as necessary */}
                </div>
                <div className='flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b'>
                  <button
                    className='text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    type='button'
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='opacity-25 fixed inset-0 z-40 bg-black'></div>
        </>
      )}
    </section>
  );
};

export default WorkOrderView;

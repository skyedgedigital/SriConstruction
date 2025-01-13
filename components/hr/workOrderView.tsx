import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import { IWorkOrderHr } from '@/lib/models/HR/workOrderHr.model';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const WorkOrderView = () => {
  const [workOrders, setWorkOrders] = useState<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  useEffect(() => {
    const fn = async () => {
      const result = await WorkOrderHrAction.FETCH.fetchAllWorkOrderHr();
      if (result.success) {
        setWorkOrders(JSON.parse(result.data));
      }
    };
    fn();
  }, []);

  const convertDateFormat = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleDelete = async (id: any) => {
    const result = await WorkOrderHrAction.DELETE.deleteWorkOrderHr(id);
    if (result.success) {
      toast.success('Work Order Deleted');
      setWorkOrders((prevWorkOrders: any) =>
        prevWorkOrders.filter((wo: any) => wo._id !== id)
      );
    } else {
      toast.error(result.message);
    }
  };

  const handleView = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setShowModal(true);
  };

  const isWorkOrderInLapse = (wo: IWorkOrderHr): Boolean => {
    const validTill = new Date(wo?.validTo).getTime();
    const lapseTill = new Date(wo?.lapseTill).getTime();
    const now = Date.now();
    return validTill <= now && now <= lapseTill;
  };
  const isWorkOrderExpired = (wo: IWorkOrderHr): Boolean => {
    const lapseTill = new Date(wo?.lapseTill).getTime();
    const now = Date.now();
    return lapseTill <= now;
  };
  return (
    <>
      <div className='w-full flex flex-col gap-1 border-[1px] border-gray-300 rounded p-2 justify-start items-center lg:min-h-[calc(100vh-2rem)]'>
        <div className='flex justify-between items-center w-full px-3'>
          <h2 className='flex justify-center text-xl'>List of Work Orders</h2>
          {
            <p className='text-gray-400'>
              {workOrders ? <>({workOrders?.length} workorders)</> : ''}
            </p>
          }
        </div>
        <div className=' w-full p-1 rounded-sm'>
          {workOrders?.map((ele: any) => (
            <div
              key={ele._id}
              className='p-2 flex rounded-sm  border-b hover:bg-gray-200 items-center justify-between'
            >
              <div className='flex-grow flex justify-start items-center gap-3'>
                <span>{ele.workOrderNumber}</span>
                {isWorkOrderInLapse(ele) ? (
                  <span
                    className={` text-white bg-orange-500 text-xs rounded-full px-2 py-1`}
                  >
                    In Lapse
                  </span>
                ) : isWorkOrderExpired(ele) ? (
                  <span
                    className={` text-white bg-red-500 text-xs rounded-full px-2 py-1`}
                  >
                    Expired
                  </span>
                ) : (
                  ''
                )}
              </div>
              <div className='flex space-x-2'>
                <button
                  onClick={() => handleView(ele)}
                  className='text-blue-500 bg-white px-2 py-1 rounded-sm'
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(ele._id)}
                  className='text-red-500 bg-white px-2 py-1 rounded-sm'
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && selectedWorkOrder && (
        <>
          <div className=' justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
            <div className='relative w-auto my-6 mx-auto max-w-3xl'>
              <div className=' rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
                <div className='flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t'>
                  <h3 className='text-2xl font-semibold'>Work Order Details</h3>
                  <button
                    className='p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none'
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className='relative p-6 flex flex-col'>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
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
                      {isWorkOrderInLapse(selectedWorkOrder) ? (
                        <span
                          className={` text-white bg-orange-500 text-xs rounded-full px-2 py-1`}
                        >
                          In Lapse
                        </span>
                      ) : isWorkOrderExpired(selectedWorkOrder) ? (
                        <span
                          className={` text-white bg-red-500 text-xs rounded-full px-2 py-1`}
                        >
                          Expired
                        </span>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2 '>
                    <label className='block text-sm font-medium text-gray-700 '>
                      Department:
                    </label>
                    {selectedWorkOrder?.dept ? (
                      <span className='text-md font-semibold'>
                        {selectedWorkOrder?.dept}
                      </span>
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Job Description:
                    </label>
                    {selectedWorkOrder?.jobDesc ? (
                      <span className='text-md font-semibold'>
                        {selectedWorkOrder?.jobDesc}
                      </span>
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Other Description:
                    </label>
                    {selectedWorkOrder?.orderDesc ? (
                      <span className='text-md font-semibold'>
                        {selectedWorkOrder?.orderDesc}
                      </span>
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Section:
                    </label>
                    {selectedWorkOrder?.section ? (
                      <span className='text-md font-semibold'>
                        {selectedWorkOrder?.section}
                      </span>
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Valid From:
                    </label>
                    {selectedWorkOrder?.validFrom ? (
                      <span className='text-md font-semibold'>
                        {selectedWorkOrder?.validFrom}
                      </span>
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Valid Till:
                    </label>
                    {selectedWorkOrder?.validTo ? (
                      <span className='text-md font-semibold'>
                        {selectedWorkOrder?.validTo}
                      </span>
                    ) : (
                      <span className='text-md text-red-400'>
                        Did not found any value. Try by saving this workorder
                        again
                      </span>
                    )}
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Lapse Till:
                    </label>
                    {selectedWorkOrder?.lapseTill ? (
                      <span className='text-md font-semibold'>
                        {selectedWorkOrder?.lapseTill}
                      </span>
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
    </>
  );
};

export default WorkOrderView;

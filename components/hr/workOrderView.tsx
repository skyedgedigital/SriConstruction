import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
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

  return (
    <>
      <div className='w-full flex flex-col'>
        <h2 className='flex justify-center text-2xl'>List of Work Orders</h2>
        {workOrders?.map((ele: any) => (
          <div
            key={ele._id}
            className='p-2 flex rounded-sm cursor-pointer border-b hover:bg-gray-200 items-center justify-between'
          >
            <span className='flex-grow'>{ele.workOrderNumber}</span>
            <div className='flex space-x-2'>
              <button
                onClick={() => handleView(ele)}
                className='bg-blue-500 text-white p-2 rounded-sm'
              >
                View
              </button>
              <button
                onClick={() => handleDelete(ele._id)}
                className='bg-red-500 text-white p-2 rounded-sm'
              >
                Delete
              </button>
            </div>
          </div>
        ))}
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
                    </label>
                    <span className='text-md font-semibold'>
                      {selectedWorkOrder.workOrderNumber}
                    </span>
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2 '>
                    <label className='block text-sm font-medium text-gray-700 '>
                      Department:
                    </label>
                    <span className='text-md font-semibold'>
                      {selectedWorkOrder.dept}
                    </span>
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Job Description:
                    </label>
                    <span className='text-md font-semibold'>
                      {selectedWorkOrder.jobDesc} hdgfhejwdn ihdc wdi j
                      ;cwkp;dow wpc wpo cwdkp
                    </span>
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Other Description:
                    </label>
                    <span className='text-md font-semibold'>
                      {selectedWorkOrder.otherDesc}
                    </span>
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Section:
                    </label>
                    <span className='text-md font-semibold'>
                      {selectedWorkOrder.section}
                    </span>
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Valid From:
                    </label>
                    <span className='text-md font-semibold'>
                      {selectedWorkOrder.validFrom}
                    </span>
                  </div>
                  <div className='my-4 text-blueGray-500 text-md leading-relaxed flex items-center gap-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Valid Till:
                    </label>
                    <span className='text-md font-semibold'>
                      {selectedWorkOrder.validTo}
                    </span>
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

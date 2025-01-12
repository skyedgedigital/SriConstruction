'use client';

import StateActionHr from '@/lib/actions/HR/State/StateAction';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const StateWiseView = ({ reload }) => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [uniqueStates, setUniqueStates] = useState<string[]>([]);
  const [groupedByState, setGroupedByState] = useState<any>({});
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const [editingId, setEditingId] = useState(null); // Track the currently editing work order ID
  const [editedWorkOrder, setEditedWorkOrder] = useState({}); // Track updated values for rate and address

  useEffect(() => {
    const fetchWorkOrders = async () => {
      const result = await WorkOrderHrAction.FETCH.fetchAllWorkOrderHr();
      console.log('fetch all work order HR: ', JSON.parse(result.data));
      if (result.success) {
        const orders = JSON.parse(result.data);
        setWorkOrders(orders);

        // Extract unique states from work orders' stateDetails
        const stateGroups: any = {};
        const states = orders.reduce((acc: string[], order: any) => {
          const { StateDetails } = order;
          console.log('state details: ', StateDetails);
          const stateName = StateDetails?.stateName;

          if (stateName && !acc.includes(stateName)) {
            acc.push(stateName);
          }

          // Group work orders by state
          if (stateName) {
            if (!stateGroups[stateName]) stateGroups[stateName] = [];
            stateGroups[stateName].push(order);
          }
          return acc;
        }, []);

        setUniqueStates(states);
        setGroupedByState(stateGroups);
      }
    };
    fetchWorkOrders();
  }, [reload]);

  const handleDelete = async (id: string) => {
    const result = await StateActionHr.DELETE.deleteState(id);
    if (result.success) {
      toast.success('Work order removed from the state succesfully!');
      setGroupedByState((prevState: any) => {
        const newState = { ...prevState };
        for (const [state, orders] of Object.entries(newState)) {
          //@ts-ignore
          newState[state] = orders.filter((order: any) => order._id !== id);
        }
        return newState;
      });
    } else {
      toast.error('An Error Occurred');
    }
  };

  const handleView = (state: string) => {
    setSelectedState(state);
    setShowModal(true);
  };

  const handleEdit = (workOrder) => {
    setEditingId(workOrder._id); // Set the current work order to edit mode
    setEditedWorkOrder({
      rate: workOrder.StateDetails.statePayRate,
      address: workOrder.StateDetails.stateAddress,
    });
  };

  const handleSave = async (editedWorkOrder, id) => {
    const update = JSON.stringify(editedWorkOrder);
    const save = await StateActionHr.UPDATE.updateStateDetail(update, id);
    if (save.success) {
      toast.success('Work order updated succesfully!');
    } else {
      toast.error('Failed to update work order!');
    }
    console.log('Saved changes for', id, editedWorkOrder);
    setEditingId(null); // Exit edit mode after saving
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedWorkOrder((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className='w-full flex flex-col gap-1 border-[1px] border-gray-300 rounded p-2 justify-start items-center lg:min-h-[calc(100vh-2rem)]'>
        {' '}
        <div className='flex justify-between items-center w-full px-3 p-1'>
          <h2 className='flex justify-center text-xl'>List of States</h2>
          {
            <p className='text-gray-400'>
              ({uniqueStates ? <>{uniqueStates?.length} states)</> : ''}
            </p>
          }
        </div>{' '}
        <div className=' w-full p-1 rounded-sm'>
          {uniqueStates.map((state) => (
            <div
              key={state}
              className='p-2 flex rounded-sm  border-b hover:bg-gray-200 items-center justify-between'
            >
              <div>
                <span className='flex-grow'>{state}</span>
                <span className='ml-2 text-gray-500'>
                  ({groupedByState[state]?.length || 0} Work Orders)
                </span>
              </div>
              <button
                onClick={() => handleView(state)}
                className='text-blue-500 bg-white px-2 py-1 border-[1px border-blue-300 rounded-sm ml-2'
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedState && (
        <>
          <div className='justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
            <div className='relative w-auto my-6 mx-auto max-w-3xl'>
              <div className='rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
                {/* Header */}
                <div className='flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t'>
                  <h3 className='text-2xl font-semibold'>
                    {selectedState} - Work Orders
                  </h3>
                  <button
                    className='p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none'
                    onClick={() => setShowModal(false)}
                  >
                    ×
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className='relative p-6 flex flex-col max-h-[70vh] overflow-y-auto'>
                  {groupedByState[selectedState].map((workOrder) => (
                    <div
                      key={workOrder._id}
                      className='flex justify-between items-center p-2 border-b'
                    >
                      <div>
                        <p>
                          <strong>Work Order Number:</strong>{' '}
                          {workOrder.workOrderNumber}
                        </p>
                        <p>
                          <strong>Department:</strong> {workOrder.dept}
                        </p>
                        {editingId === workOrder._id ? (
                          <>
                            <p>
                              <strong>Address:</strong>
                              <input
                                type='text'
                                name='address'
                                //@ts-ignore
                                value={editedWorkOrder.address}
                                onChange={handleChange}
                                className='border rounded px-2 py-1 ml-2'
                              />
                            </p>
                            <p>
                              <strong>State Rate:</strong>
                              <input
                                type='text'
                                name='rate'
                                //@ts-ignore
                                value={editedWorkOrder.rate}
                                onChange={handleChange}
                                className='border rounded px-2 py-1 ml-2'
                              />
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              <strong>Address:</strong>{' '}
                              {workOrder.StateDetails.stateAddress}
                            </p>
                            <p>
                              <strong>State Rate:</strong>{' '}
                              {workOrder.StateDetails.statePayRate}
                            </p>
                          </>
                        )}
                      </div>
                      <div className='flex space-x-2 px-8'>
                        {editingId === workOrder._id ? (
                          <button
                            onClick={() =>
                              handleSave(editedWorkOrder, workOrder._id)
                            }
                            className='bg-green-500 text-white p-2 rounded-sm'
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(workOrder)}
                            className='bg-yellow-500 text-white p-2 rounded-sm'
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(workOrder._id)}
                          className='bg-red-500 text-white p-2 rounded-sm'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
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

          {/* Background Overlay */}
          <div className='opacity-25 fixed inset-0 z-40 bg-black'></div>
        </>
      )}
    </>
  );
};

export default StateWiseView;

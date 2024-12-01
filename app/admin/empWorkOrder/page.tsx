'use client'
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction'
import workOrderAction from '@/lib/actions/workOrder/workOrderAction';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const Page = () => {
  const [result, setResult] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [extraDetails, setExtraDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fn = async () => {
      const resp = await WorkOrderHrAction.FETCH.fetchAllWorkOrderHr();
      if (resp.success) {
        setResult(JSON.parse(resp.data));
      } else {
        toast.error('Error Occurred while fetching');
      }
    };
    fn();
  }, []);

  const openModal = async (item) => {
    setSelectedItem(item);
    setLoadingDetails(true);
    setIsModalOpen(true);

    try {
      const resp = await WorkOrderHrAction.FETCH.fetchEmpsFromWorkOrder(item._id)
      if (resp.success) {
        setExtraDetails(JSON.parse(resp.data));
        console.log(JSON.parse(resp.data))
        console.log(typeof(JSON.parse(resp.data)))
      } else {
        toast.error('Error occurred while fetching additional details');
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
      toast.error('Failed to fetch additional details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setExtraDetails(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="ml-16">
        <p className="w-full text-4xl text-blue-500 text-center">
          Work-Order For All Emps
        </p>
      </div>
      <div className="overflow-x-auto">
        {
          result.length > 0 ? (
            <table className="w-full text-blue-500 mt-4 ml-16">
              <thead>
                <tr>
                  <th className="px-4 py-2">Work Order Number</th>
                  <th className="px-4 py-2">Valid From</th>
                  <th className="px-4 py-2">Valid To</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.map((item, index) => (
                  <tr key={index} className="border-t border-gray-400">
                    <td className="px-4 py-2">{item.workOrderNumber}</td>
                    <td className="px-4 py-2 text-center">{item.validFrom}</td>
                    <td className="px-4 py-2 text-center">{item.validTo}</td>
                    <td className="px-4 py-2">
                      <button 
                        onClick={() => openModal(item)}
                        className="bg-blue-500 text-white px-4 py-2 rounded">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-blue-500 text-2xl text-center mt-4">
              No Work Order Available
            </div>
          )
        }
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl text-blue-500 mb-4"> Employees Worked on this Work-Order </h2>

            {loadingDetails ? (
              <p className="mt-4">Loading additional details...</p>
            ) : (
              extraDetails && (
                [...extraDetails].map((element, index) => {
                  return(
                    <>
                      <p key={index}>
                        <strong>Name :</strong>{element.name}
                        <strong className='ml-2' >Code :</strong>{element.code}
                      </p>
                    </>
                  )
                })
              )
            )}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={closeModal}
                className="bg-blue-500 text-white px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;

import PpeAction from '@/lib/actions/ppe/ppeAction';
import SafetyToolsAction from '@/lib/actions/safetyTools/safetyToolsAction';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const ViewToolMaintanence = () => {
    const [result, setResult] = useState([]);
    useEffect(() => {
        const fn = async () => {
          const resp = await SafetyToolsAction.FETCH.fetchMaintanenceList();
          console.warn(resp);
          if (resp.data) {
            setResult(JSON.parse(resp.data));
          }
        };
        fn();
      }, []);
    const handleDelete = async(id:any) => {
        const resp = await SafetyToolsAction.DELETE.deleteMaintanenceById(id);
        if(resp.success){
            toast.success("Deleted");
        }
        else{
            toast.error("Error while Deleting")
        }
    }
  return (
    <>
    
    {result && (
        <>
          <div className="flex flex-col items-center justify-center mt-6">
            <h2 className="text-3xl">List Of Maintanence</h2>
            {result.length === 0 && (
              <span className="mt-4">No Maintanence Present</span>
            )}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    doc NO:
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    rev No:
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Link
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.map((ele) => (
                  <tr key={ele._id} className="hover:bg-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                        {
                            ele.docNo
                        }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ele.revNo}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {ele.date}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={ele.link} target='__blank' className='text-blue-500' >
                        Link
                      </a>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(ele._id)}
                        className="text-red-600 hover:text-red-900"
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
  )
}

export default ViewToolMaintanence

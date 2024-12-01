import chemicalAction from '@/lib/actions/chemicals/chemicalAction';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const ViewChemicalIssueAndReplacement = () => {
    const [result, setResult] = useState([]);
    useEffect(() => {
        const fn = async () => {
          const resp = await chemicalAction.FETCH.fetchChemicalIssueAndReplacementRegister();
          console.warn(resp);
          if (resp.success) {
            setResult(JSON.parse(resp.data));
          } else{
            toast.error(resp.message)
          }
        };
        fn();
      }, []);
    const handleDelete = async(id:any) => {
        const resp = await chemicalAction.DELETE.deleteChemicalIssueAndReplacement(id)
        if(resp.success){
            toast.success("Deleted");
        }
        else{
            toast.error(resp.message)
        }
    }
  return (
    <>
    
    {result && (
        <>
          <div className="flex flex-col items-center justify-center mt-6">
            <h2 className="text-3xl">List Of Chemical Issue And Replacement Registers</h2>
            {result.length === 0 && (
              <span className="mt-4">No Register Present</span>
            )}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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

export default ViewChemicalIssueAndReplacement

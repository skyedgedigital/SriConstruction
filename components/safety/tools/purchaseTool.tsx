import SafetyToolsAction from '@/lib/actions/safetyTools/safetyToolsAction';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const PurchaseTool = () => {
  const [result, setResult] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [chemicals,setChemicals] = useState([]);
  const [date,setDate] = useState("");
  const [price,setPrice] = useState(0)
  useEffect(()=>{
    const fn = async() => {
        const resp = await SafetyToolsAction.FETCH.fetchSafetyToolPurchases();       
        if(resp.success){
            setResult(JSON.parse(resp.data));
            console.warn(JSON.parse(resp.data))
        }
    }
    const fnChem = async() => {
      const resp = await SafetyToolsAction.FETCH.fetchSafetyToolsAll();
      if(resp.success){
        setChemicals(JSON.parse(resp.data));
        }
      else{
        toast.error(resp.message);
      }
    }
    fn();
    fnChem();
  },[])
  const handleDelete = async(id:any) => {
    const resp = await SafetyToolsAction.DELETE.deleteSafetyToolPurchase(id)
    if(resp.success){
      toast.success("Purchase Deleted,Reload to view Changes");
    }
    else{
      toast.error("Purchase Not Deleted");
    }
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    const resp = await SafetyToolsAction.CREATE.createSafetyToolPurchase(
      JSON.stringify(
        {
          toolId:selectedOption,
          price:price,
          date:date,
          quantity:quantity,
        }
      )
    );
    if(resp.success){
      toast.success("Purchase Created,Reload to view Changes");
      }
      else{
        toast.error("Purchase Not Created");
        }
    console.warn("Q"+quantity)
  }

  return (
    <>

<form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto mt-4 p-6 bg-white shadow-md rounded-md flex-wrap"
      >
        <div className="mb-4">
          <label
            htmlFor="dropdown"
            className="block text-sm font-medium text-gray-700"
          >
            Select a Tool:
          </label>
          <select
            id="dropdown"
            value={selectedOption}
            onChange={async (e) => {
              setSelectedOption(e.target.value);
              if (e.target.value != "") {
                const resp = await SafetyToolsAction.FETCH.fetchSafetyToolById(
                  e.target.value
                );
                const data = JSON.parse(resp.data);
                setQuantity(data.quantity);
              }
            }}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select...</option>
            {/* <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option> */}
            {chemicals.map((vehicle) => (
              <option key={vehicle.id} value={vehicle._id}>
                {vehicle.category} {
                  (vehicle.subcategory!==""?<>
                    {
                      "("+vehicle.subcategory+")"
                    }
                  </>:<></>)
                }
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="input"
            className="block text-sm font-medium text-gray-700"
          >
            Item Quantity:
          </label>
          <input
            type="number"
            id="input"
            value={quantity}
            onChange={(e) => {
              setQuantity(parseInt(e.target.value));
            }}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            // placeholder="Enter One Consumable Here"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="input"
            className="block text-sm font-medium text-gray-700"
          >
            Total Cost:
          </label>
          <input
            type="number"
            id="input"
            value={price}
            onChange={(e) => {
              setPrice(parseInt(e.target.value));
            }}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            // placeholder="Enter One Consumable Here"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="input"
            className="block text-sm font-medium text-gray-700"
          >
            Date (DD-MM-YYYY)
          </label>
          <input
            type="text"
            id="input"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
            }}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Date Here"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </div>
      </form>

        {result && (
        <>
          <div className="flex flex-col items-center justify-center mt-6">
            <h2 className="text-3xl">List Of Chemicals</h2>
            {result.length === 0 && (
              <span className="mt-4">No Chemical Present</span>
            )}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tool 
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date(DD-MM-YYYY)
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
                    <td className="px-6 py-4 whitespace-nowrap">{ele.toolId.category} {
                  (ele.toolId.subcategory!==""?<>
                    {
                      "("+ele.toolId.subcategory+")"
                    }
                  </>:<></>)
                }</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ele.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ele.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ele.date}
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

export default PurchaseTool

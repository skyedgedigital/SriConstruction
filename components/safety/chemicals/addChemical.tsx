import chemicalAction from "@/lib/actions/chemicals/chemicalAction";
import React, { useState } from "react";
import toast from "react-hot-toast";

const AddChemicals = () => {
  const [name, setName] = useState("");
  const [quantity,setQuantity] = useState(0);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const resp = await chemicalAction.CREATE.createChemical(
      JSON.stringify({
        name:name,
        quantity:quantity
      })
    )
    if(resp.success){
      toast.success(resp.message);
      setName("");
      setQuantity(0);
    }
    else{
      toast.error(resp.message);
    }
  };
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
            Chemical Name:
          </label>
          <input type="text" id="input" value={name} onChange={(e)=>{
            setName(e.target.value);
          }}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Name Here" />
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
        <div>
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default AddChemicals;

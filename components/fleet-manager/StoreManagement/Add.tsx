import toolManagementAction from '@/lib/actions/tool/toolManagementAction';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Add = () => {
  const [toolName, setToolName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(1);
  const verify = (): boolean => {
    if (toolName === '') {
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verify()) {
      return;
    }
    const data = {
      toolName,
      quantity,
      price,
    };
    const resp = await toolManagementAction.CREATE.createTool(
      JSON.stringify(data)
    );
    if (resp.success) {
      toast.success(resp.message);
      setToolName('');
      setQuantity(1);
      setPrice(1);
    } else {
      toast.error(
        resp.message || 'Unexpected Error Occurred, Failed to create tool'
      );
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className='max-w-md mx-auto mt-4 p-6 bg-white shadow-md rounded-md flex-wrap'
      >
        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Tool Name:
          </label>
          <input
            type='text'
            id='input'
            value={toolName}
            onChange={(e) => {
              setToolName(e.target.value);
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Tool Name Here'
            min='1'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Tool Quantity:
          </label>
          <input
            type='number'
            id='input'
            value={quantity}
            onChange={(e) => {
              setQuantity(parseInt(e.target.value));
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            // placeholder="Enter One Consumable Here"
            min='1'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Tool Price(per Item):
          </label>
          <input
            type='number'
            id='input'
            value={price}
            onChange={(e) => {
              setPrice(parseInt(e.target.value));
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            // placeholder="Enter One Consumable Here"
            min='0'
          />
        </div>

        <div>
          <button
            type='submit'
            className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Add Tool To Inventory
          </button>
        </div>
      </form>
    </>
  );
};

export default Add;

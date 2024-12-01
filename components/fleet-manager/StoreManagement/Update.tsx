import toolManagementAction from '@/lib/actions/tool/toolManagementAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Update = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [tools, setTools] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(1);
  const handleSubmit = async (e) => {
    e.preventDefault();
  };
  useEffect(() => {
    const fn = async () => {
      const resp = await toolManagementAction.FETCH.fetchTools();
      if (resp.success) {
        setTools(JSON.parse(resp.data));
      } else {
        toast.error(resp.message || 'Failed to fetch tools, please try later');
      }
    };
    fn();
  }, []);

  const handleToolChange = (e) => {
    const selectedTool = e.target.value;
    const tool = tools.find((tool) => tool.toolName === selectedTool);
    if (tool) {
      setQuantity(tool.quantity);
      setPrice(tool.price);
    } else {
      setQuantity(1);
      setPrice(1);
    }
    setSelectedOption(selectedTool);
  };

  return (
    <>
      <div className='ml-16'>Update Tool</div>
      <form
        onSubmit={handleSubmit}
        className='max-w-md mx-auto mt-4 p-6 bg-white shadow-md rounded-md flex-wrap'
      >
        <div className='mb-4'>
          <label
            htmlFor='dropdown'
            className='block text-sm font-medium text-gray-700'
          >
            Select a Tool:
          </label>
          <select
            id='dropdown'
            value={selectedOption}
            onChange={handleToolChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            {/* <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option> */}
            {tools?.map((ele) => (
              <option key={ele.id} value={ele.toolName}>
                {ele.toolName}
              </option>
            ))}
          </select>
        </div>

        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Quantity:
          </label>
          <input
            type='number'
            id='input'
            value={quantity}
            onChange={(e) => {
              setQuantity(parseInt(e.target.value));
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Tool Here'
            min={'1'}
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700'
          >
            Price(per Item):
          </label>
          <input
            type='number'
            id='input'
            value={price}
            onChange={(e) => {
              setPrice(parseInt(e.target.value));
            }}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Tool Here'
            min={'1'}
          />
        </div>

        <div>
          <button
            type='submit'
            className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Update Tool Info
          </button>
        </div>
      </form>
    </>
  );
};

export default Update;

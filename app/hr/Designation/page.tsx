'use client';
import designationAction from '@/lib/actions/HR/Designation/designationAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

const Page = () => {
  const [data, setData] = useState<any>(null);
  const [formData, setFormData] = useState({
    designation: '',
    basic: 0,
    OldBasic: 0,
    DA: 0,
    OldDA: 0,
    PayRate: 0,
    Basic2: 0,
  });
  const [editFormData, setEditFormData] = useState({
    designation: '',
    basic: 0,
    OldBasic: 0,
    DA: 0,
    OldDA: 0,
    PayRate: 0,
    Basic2: 0,
  });
  const [editFormName, setEditFormName] = useState<string>('');
  const [modalName, setModalName] = useState('');
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editFormEleId, setEditFormEleId] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const fetchDesignations = async () => {
    const resp = await designationAction.FETCH.fetchDesignations();
    if (resp.status === 200) {
      setData(JSON.parse(resp.data));
    }
  };
  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    if (name === 'basic') {
      setFormData((prevData) => {
        return {
          ...prevData,
          [name]: value,
          // PayRate: Number(value) + Number(prevData.DA),
          PayRate: Number((Number(value) + Number(prevData.DA)).toFixed(2)),
        };
      });
    } else if (name === 'DA') {
      setFormData((prevData) => {
        return {
          ...prevData,
          [name]: value,
          PayRate: Number((Number(value) + Number(prevData.basic)).toFixed(2)),
        };
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleEditInputChange = (event: any) => {
    const { name, value } = event.target;
    console.log(typeof value);
    if (name === 'basic') {
      setEditFormData((prevData) => {
        return {
          ...prevData,
          [name]: value,
          // PayRate: Number(value) + Number(prevData.DA),
          PayRate: Number((Number(value) + Number(prevData.DA)).toFixed(2)),
        };
      });
    } else if (name === 'DA') {
      setEditFormData((prevData) => {
        return {
          ...prevData,
          [name]: value,
          // PayRate: Number(value) + Number(prevData.basic),
          PayRate: Number((Number(value) + Number(prevData.basic)).toFixed(2)),
        };
      });
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
    }
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const resp = await designationAction.CREATE.createDesignation(
      JSON.stringify(formData)
    );
    if (resp.status === 200) {
      toast.success(resp.message);
      setFormData({
        designation: '',
        basic: 0,
        OldBasic: 0,
        DA: 0,
        OldDA: 0,
        PayRate: 0,
        Basic2: 0,
      });
      fetchDesignations();
    } else {
      toast.error(resp.message);
    }
    setDialogOpen(false);
  };
  const handleDelete = async (id: string) => {
    const resp = await designationAction.DELETE.deleteDesignation(id);
    if (resp.status === 200) {
      toast.success('Deleted,Reload to view Changes');
      fetchDesignations();
    } else {
      toast.error('An Error Occurred');
    }
  };
  return (
    <>
      <section className='flex flex-col h-screen'>
        <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
          Designation
        </h1>
        <div className='flex-1 overflow-y-auto p-4'>
          <div className='flex flex-col lg:flex-row lg:gap-6'>
            <div className='flex-1'>
              <div className='w-full flex flex-col gap-1 border-[1px] border-gray-300 rounded p-2 justify-start items-center lg:min-h-[calc(100vh-2rem)]'>
                <div className='flex justify-between items-center w-full px-3'>
                  <h2 className='flex justify-center text-xl'>
                    List of Designations
                  </h2>
                  {
                    <p className='text-gray-400'>
                      ({data ? <>{data?.length} designations</> : ''})
                    </p>
                  }
                </div>
                <div className='flex flex-col w-full'>
                  {data?.map((ele) => {
                    return (
                      <div
                        key={ele._id}
                        className='p-2 flex justify-between items-center rounded-sm border-b hover:bg-gray-200'
                      >
                        <span>{ele.designation}</span>
                        <div className='flex w-fit justify-center items-center gap-2'>
                          <button
                            className='px-2 py-1 bg-white rounded-sm text-blue-500'
                            onClick={() => {
                              setShowViewModal(true);
                              setEditFormName(ele.designation);
                              editFormData.basic = ele.basic;
                              editFormData.designation = ele.designation;
                              editFormData.OldBasic = ele.OldBasic;
                              editFormData.DA = ele.DA;
                              editFormData.OldDA = ele.OldDA;
                              editFormData.PayRate = ele.PayRate;
                              editFormData.Basic2 = ele.Basic2;
                            }}
                          >
                            View
                          </button>
                          <button
                            className='px-2 py-1 bg-white rounded-sm text-orange-500'
                            onClick={() => {
                              setShowModal(true);
                              setEditFormName(ele.designation);
                              setEditFormEleId(ele._id);
                              editFormData.basic = ele.basic;
                              editFormData.designation = ele.designation;
                              editFormData.OldBasic = ele.OldBasic;
                              editFormData.DA = ele.DA;
                              editFormData.OldDA = ele.OldDA;
                              editFormData.PayRate = ele.PayRate;
                              editFormData.Basic2 = ele.Basic2;
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className='px-2 py-1 bg-white rounded-sm text-red-500'
                            onClick={() => {
                              setSelectedWorkOrder(ele);
                              setDialogOpen(true);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>{' '}
            </div>

            <div className='lg:w-1/3'>
              <div className='lg:sticky lg:top-0'>
                <div className='w-full flex-col justify-center p-4 gap-2 border-[1px] border-gray-300 rounded'>
                  <h2 className='flex justify-center items-center text-xl'>
                    Add Designation
                  </h2>
                  <form
                    onSubmit={handleSubmit}
                    className='bg-white rounded-md flex-wrap'
                  >
                    <div className='mb-4'>
                      <label
                        htmlFor='input'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Designation:
                      </label>
                      <input
                        type='text'
                        id='input'
                        name='designation'
                        value={formData.designation}
                        onChange={handleInputChange}
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Enter Designation Here'
                        min='1'
                      />
                    </div>

                    <div className='mb-4'>
                      <label
                        htmlFor='input'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Basic:
                      </label>
                      <input
                        type='text'
                        id='input'
                        name='basic'
                        value={formData.basic}
                        onChange={handleInputChange}
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Enter Basic Here'
                        min='1'
                      />
                    </div>

                    <div className='mb-4'>
                      <label
                        htmlFor='input'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Old Basic
                      </label>
                      <input
                        type='text'
                        id='input'
                        name='OldBasic'
                        value={formData.OldBasic}
                        onChange={handleInputChange}
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Enter Old Basic Here'
                        min='1'
                      />
                    </div>

                    <div className='mb-4'>
                      <label
                        htmlFor='input'
                        className='block text-sm font-medium text-gray-700'
                      >
                        DA:
                      </label>
                      <input
                        type='text'
                        id='input'
                        name='DA'
                        value={formData.DA}
                        onChange={handleInputChange}
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Enter DA Here'
                        min='1'
                      />
                    </div>

                    <div className='mb-4'>
                      <label
                        htmlFor='input'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Old DA:
                      </label>
                      <input
                        type='text'
                        id='input'
                        name='OldDA'
                        value={formData.OldDA}
                        onChange={handleInputChange}
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Enter Old DA Here'
                        min='1'
                      />
                    </div>

                    <div className='mb-4'>
                      <label
                        htmlFor='input'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Pay Rate:
                      </label>
                      <input
                        type='text'
                        id='input'
                        name='PayRate'
                        value={formData.PayRate}
                        onChange={handleInputChange}
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Enter DA Here'
                        min='1'
                      />
                    </div>

                    <div className='mb-4'>
                      <label
                        htmlFor='input'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Basic2:
                      </label>
                      <input
                        type='text'
                        id='input'
                        name='Basic2'
                        value={formData.Basic2}
                        onChange={handleInputChange}
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Enter Branch Here'
                        min='1'
                      />
                    </div>

                    <div>
                      <button
                        type='submit'
                        className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      >
                        Save Designation
                      </button>
                    </div>
                  </form>
                </div>{' '}
              </div>
            </div>
          </div>
        </div>
      </section>
      {showViewModal ? (
        <>
          <div className='justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
            <div className='relative w-auto my-6 mx-auto max-w-3xl'>
              {/*content*/}
              <div className='border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
                {/*header*/}
                <div className='flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t'>
                  <h3 className='text-3xl font-semibold'>
                    Details of {editFormName}
                  </h3>
                  <button
                    className='p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none'
                    onClick={() => setShowModal(false)}
                  >
                    <span className='bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none'>
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className='relative p-6 flex-auto'>
                  <p className='my-4 text-blueGray-500 text-lg leading-relaxed'>
                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Designation: {editFormData.designation}
                    </label>
                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Basic: {editFormData.basic}
                    </label>

                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      OldBasic: {editFormData.OldBasic}
                    </label>

                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      DA: {editFormData.DA}
                    </label>

                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      OldDA: {editFormData.OldDA}
                    </label>

                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      PayRate: {editFormData.PayRate}
                    </label>

                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Basic2: {editFormData.Basic2}
                    </label>
                  </p>
                </div>
                {/*footer*/}
                <div className='flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b'>
                  <button
                    className='text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    type='button'
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='opacity-25 fixed inset-0 z-40 bg-black'></div>
        </>
      ) : null}
      {showModal ? (
        <>
          <div className='justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
            <div className='relative w-auto my-6 mx-auto max-w-3xl'>
              {/*content*/}
              <div className='border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
                {/*header*/}
                <div className='flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t'>
                  <h3 className='text-3xl font-semibold'>
                    Edit Form for {editFormName}
                  </h3>
                  <button
                    className='p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none'
                    onClick={() => setShowModal(false)}
                  >
                    <span className='bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none'>
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className='relative p-6 flex-auto'>
                  <div className='mb-4'>
                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Designation:
                    </label>
                    <input
                      type='text'
                      id='input'
                      name='designation'
                      value={editFormData.designation}
                      onChange={handleEditInputChange}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Enter Designation Here'
                      min='1'
                    />
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Basic:
                    </label>
                    <input
                      type='text'
                      id='input'
                      name='basic'
                      value={editFormData.basic}
                      onChange={handleEditInputChange}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Enter Basic Here'
                      min='1'
                    />
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Old Basic
                    </label>
                    <input
                      type='text'
                      id='input'
                      name='OldBasic'
                      value={editFormData.OldBasic}
                      onChange={handleEditInputChange}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Enter Old Basic Here'
                      min='1'
                    />
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      DA:
                    </label>
                    <input
                      type='text'
                      id='input'
                      name='DA'
                      value={editFormData.DA}
                      onChange={handleEditInputChange}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Enter DA Here'
                      min='1'
                    />
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Old DA:
                    </label>
                    <input
                      type='text'
                      id='input'
                      name='OldDA'
                      value={editFormData.OldDA}
                      onChange={handleEditInputChange}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Enter Old DA Here'
                      min='1'
                    />
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Pay Rate:
                    </label>
                    <input
                      type='text'
                      id='input'
                      name='PayRate'
                      value={editFormData.PayRate}
                      onChange={handleEditInputChange}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Enter DA Here'
                      min='1'
                    />
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Basic2:
                    </label>
                    <input
                      type='text'
                      id='input'
                      name='Basic2'
                      value={editFormData.Basic2}
                      onChange={handleEditInputChange}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Enter Branch Here'
                      min='1'
                    />
                  </div>
                </div>
                {/*footer*/}
                <div className='flex flex-col-reverse md:flex-row items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b'>
                  <button
                    className='text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    type='button'
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className='bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    type='button'
                    onClick={async () => {
                      const resp =
                        await designationAction.UPDATE.updateDesignation(
                          JSON.stringify(editFormData),
                          editFormEleId
                        );
                      if (resp.status === 200) {
                        toast.success('Esi Updated,Reload to View Changes');
                      } else {
                        toast.error('An Error Occurred');
                      }
                      setShowModal(false);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='opacity-25 fixed inset-0 z-40 bg-black'></div>
        </>
      ) : null}{' '}
      <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-red-500'>
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this Designation? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-500'
              onClick={() => handleDelete(selectedWorkOrder._id)}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Page;

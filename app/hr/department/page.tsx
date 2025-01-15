'use client';
import departmentHrAction from '@/lib/actions/HR/DepartmentHr/departmentHrAction';
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
  const [departments, setDepartments] = useState<any>(null);
  const [inputDepartmentString, setInputDepartmentString] =
    useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editFormName, setEditFormName] = useState<string>('');
  const [editFormInput, setEditFormInput] = useState<string>('');
  const [editFormEleId, setEditFormEleId] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const fetchDepartments = async () => {
    const result = await departmentHrAction.FETCH.fetchDepartmentHr();
    if (result.status === 200) {
      setDepartments(JSON.parse(result.data));
    }
  };
  useEffect(() => {
    fetchDepartments();
  }, []);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (inputDepartmentString === '') {
      toast.error('Enter Department Name');
      return;
    }
    const obj = {
      name: inputDepartmentString,
    };
    const res = await departmentHrAction.CREATE.createDepartmentHr(
      JSON.stringify(obj)
    );
    if (res.status === 200) {
      toast.success('Department Created');
      setInputDepartmentString('');
      fetchDepartments();
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async (id: string) => {
    const resp = await departmentHrAction.DELETE.deleteDepartmentHr(id);
    if (resp.status === 200) {
      toast.success('Department deleted successfully');
      fetchDepartments();
    } else {
      toast.error('An Error Occurred');
    }
    setDialogOpen(false);
  };
  return (
    <>
      <section className='flex flex-col h-screen '>
        <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
          Department
        </h1>

        <div className='flex-1 overflow-y-auto p-4'>
          <div className='flex flex-col lg:flex-row lg:gap-6'>
            <div className='flex-1'>
              <div className='w-full flex flex-col gap-1 border-[1px] border-gray-300 rounded p-2 justify-start items-center lg:min-h-[calc(100vh-2rem)]'>
                <div className='flex justify-between items-center w-full px-2'>
                  <h2 className='flex justify-center text-xl'>
                    List of Departments
                  </h2>
                  {
                    <p className='text-gray-400'>
                      {departments ? (
                        <>({departments?.length} departments)</>
                      ) : (
                        ''
                      )}
                    </p>
                  }
                </div>
                <div className='flex flex-col w-full'>
                  {departments?.map((ele) => {
                    return (
                      <>
                        <div
                          key={ele._id}
                          className='p-2 flex justify-between items-center rounded-sm border-b hover:bg-gray-200'
                        >
                          <span>{ele.name}</span>
                          <div className='flex w-fit gap-2'>
                            <button
                              className='px-2 py-1 rounded bg-white text-orange-500'
                              onClick={() => {
                                setShowModal(true);
                                setEditFormName(ele.name);
                                setEditFormInput(ele.name);
                                setEditFormEleId(ele._id);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className='px-2 py-1 rounded bg-white text-red-500'
                              onClick={() => {
                                setSelectedWorkOrder(ele);
                                setDialogOpen(true);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </div>
              </div>{' '}
            </div>

            <div className='lg:w-1/3'>
              <div className='lg:sticky lg:top-0'>
                <div className='w-full flex-col justify-center p-4 gap-2 border-[1px] border-gray-300 rounded'>
                  <h2 className='flex justify-center items-center text-xl'>
                    Add Department
                  </h2>
                  <form
                    onSubmit={handleSubmit}
                    className='max-w-md mx-auto mt-4 p-6 bg-white rounded-md flex-wrap'
                  >
                    <div className='mb-4'>
                      <label
                        htmlFor='input'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Department Name:
                      </label>
                      <input
                        type='text'
                        id='input'
                        value={inputDepartmentString}
                        onChange={(e) => {
                          setInputDepartmentString(e.target.value);
                        }}
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Enter Department Name Here'
                        min='1'
                      />
                    </div>

                    <div>
                      <button
                        type='submit'
                        className='w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      >
                        Add Department
                      </button>
                    </div>
                  </form>
                </div>{' '}
              </div>
            </div>
          </div>
        </div>

        {/* <div className='flex flex-col lg:flex-row'></div> */}
      </section>
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
                  <p className='my-4 text-blueGray-500 text-lg leading-relaxed'>
                    <label
                      htmlFor='input'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Department Name:
                    </label>
                    <input
                      type='text'
                      id='input'
                      value={editFormInput}
                      onChange={(e) => {
                        setEditFormInput(e.target.value);
                      }}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Enter Department Name Here'
                      min='1'
                    />
                  </p>
                </div>
                {/*footer*/}
                <div className='flex flex-col md:flex-row items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b'>
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
                      const obj = {
                        name: editFormInput,
                      };
                      const resp =
                        await departmentHrAction.UPDATE.updateDepartmentHr(
                          JSON.stringify(obj),
                          editFormEleId
                        );
                      if (resp.status === 200) {
                        toast.success(
                          'Department Updated,Reload to View Changes'
                        );
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
              Are you sure you want to delete this Department? This action
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

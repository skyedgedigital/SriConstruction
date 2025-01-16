import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EmpDataViewComponent from './EmpDataViewComponent';

const EmpDataComponent = (props) => {
  //   console.log(props);
  const { docId, name } = props;
  const [showModal, setShowModal] = useState(false);
  async function deleteEmployee(empId: any) {
    const resp = await EmployeeDataAction.DELETE.deleteEmployeeData(docId);
    if (resp.success) {
      toast.success(resp.message);
    } else {
      toast.error(resp.message);
    }
  }

  return (
    <>
      <div className='bg-slate-200 my-2 px-3 py-2 rounded-sm cursor-pointer flex justify-between'>
        <span>{name}</span>
        <div className='flex gap-2'>
          <button
            className='text-blue-500'
            onClick={() => {
              window.open(`/hr/editEmpData?docId=${docId}&name=${name}`);
            }}
          >
            Edit
          </button>
          <button
            className='text-green-500'
            onClick={() => {
              setShowModal(!showModal);
            }}
          >
            {showModal ? (
              <span className='text-red-500'>Close</span>
            ) : (
              <span className='text-green-500'>View</span>
            )}
          </button>
          <button
            className='text-red-500'
            onClick={async () => {
              await deleteEmployee(docId);
            }}
          >
            Delete
          </button>
        </div>
      </div>
      {showModal && (
        <>
          <EmpDataViewComponent docId={docId} />
        </>
      )}
    </>
  );
};

export default EmpDataComponent;

"use client"

import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import React, { useEffect, useState } from 'react'
import Create from './edit';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  LargeDialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const DataComponent = ({eleId}) => {
    const [showModal,setShowModal] = useState<boolean>(false);
    const [viewModal,setViewModal] = useState(false);
    const [data,setData] = useState<any>(null)
    useEffect(()=>{
        const fn = async() => {
            const resp = await EmployeeDataAction.FETCH.fetchEmployeeById(eleId)
            if(resp.status === 200){
                setData(JSON.parse(resp.data))
            }
            console.log(resp.data)
        }
        fn();
    },[eleId])
                        
    const redirect = () => {
        window.open(`/hr/empCard?name=${data?.name}&designation=${data?.designation?.designation}&slNo=${data?.workManNo}`)
    }

    return (
      <>
          <div className='flex flex-col'>
              {data && (
                  <div className="p-2 flex rounded-sm cursor-pointer border-b hover:bg-gray-200 justify-between items-center">
                      <div className="flex-grow pr-4">{data.name}</div>
                      <div className="flex space-x-4">
                          <Dialog>
                              <DialogTrigger className='text-green-500'>View</DialogTrigger>
                              <LargeDialogContent className='w-5/6 max-w-full'>
                                  <DialogHeader>
                                      <DialogTitle>Information of {data.name}</DialogTitle>
                                      <DialogDescription>
                                          <div className="flex flex-col space-y-4">
                                              {/* Employee Information Section */}
                                              <div className="border border-gray-200 rounded-lg p-4">
                                                  <h3 className="font-bold text-lg">Employee Information</h3>
                                                  <ul className="list-disc pl-4">
                                                      <li>Code: {data.code ? data.code : 'N/A'}</li>
                                                      <li>Workman No: {data.workManNo ? data.workManNo : 'N/A'}</li>
                                                      <li>Name: {data.name ? data.name : 'N/A'}</li>
                                                      <li>Department: {data.department ? data.department.name : 'N/A'}</li>
                                                      <li>Site: {data.site ? data.site.name : 'N/A'}</li>
                                                      <li>Designation: {data.designation ? data.designation.designation : 'N/A'}</li>
                                                      <li>PF Applicable: {data.pfApplicable ? data.pfApplicable : 'N/A'}</li>
                                                      <li>PF No: {data.pfNo ? data.pfNo : 'N/A'}</li>
                                                      <li>UAN: {data.UAN ? data.UAN : 'N/A'}</li>
                                                      <li>ESIC No: {data.ESICNo ? data.ESICNo : 'N/A'}</li>
                                                      <li>Aadhaar Number: {data.adhaarNumber ? data.adhaarNumber : 'N/A'}</li>
                                                  </ul>
                                              </div>
                                              {/* Additional sections... */}
                                              {/* Personal Information Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-bold text-lg">Personal Information</h3>
        <ul className="list-disc pl-4">

          <li>Sex: {data.sex ? data.sex : 'N/A'}</li>
          <li>Marital Status: {data.martialStatus? data.martialStatus : 'N/A'}</li>
          <li>Date of Birth: {data.dob? data.dob : 'N/A'}</li>
          <li>Attendance Allowance: {data.attendanceAllowance ? data.attendanceAllowance : 'N/A'}</li>
          {/* <li>Father's Name: {data.fathersName}</li> */}
          <li>Address: {data.address? data.address : 'N/A'}</li>
          <li>Landline Number: {data.landlineNumber? data.landlineNumber : 'N/A'}</li>
          <li>Mobile Number: {data.mobileNumber? data.mobileNumber : 'N/A'}</li>
          <li>Working Status: {data.workingStatus ? data.workingStatus : 'N/A'}</li>
          <li>Appointment Date: {data.appointmentDate ? data.appointmentDate : 'N/A'}</li>
          <li>Resign Date: {data.resignDate ? data.resignDate : 'N/A'}</li>
        </ul>
      </div>

      {/* Other Details Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-bold text-lg">Other Details</h3>
        <ul className="list-disc pl-4">
        
          <li>Safety Pass Number: {data.safetyPassNumber}</li>
          <li>Safety Pass Validity: {data.SpValidity}</li>
          <li>Police Verification Validity: {data.policeVerificationValidityDate}</li>
          <li>Gate Pass Number: {data.gatePassNumber}</li>
          <li>Gate Pass Validity: {data.gatePassValidTill}</li>

        </ul>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-bold text-lg">Add/Ded</h3>
        <ul className="list-disc pl-4">
        
          <li>Basic {data.basic}</li>
          <li>DA {data.DA}</li>
          <li>HRA {data.HRA}</li>
          <li>CA{data.CA}</li>
          <li>Food{data.food}</li>
          <li>Incentives{data.incentives}</li>
          <li>Uniform{data.uniform}</li>
          <li>Medical{data.medical}</li>
          <li>Loan{data.loan}</li>
          <li>LIC{data.LIC}</li>
          <li>Old Basic{data.oldBasic}</li>
          <li>Old DA{data.oldDA}</li>
        </ul>
      </div>
      <button className='p-2 text-white bg-blue-500 w-40 rounded-sm hover:text-blue-500 hover:bg-slate-200' onClick={() => {
    redirect();
  }}  >
        Employement Card
      </button>
                                          </div>
                                      </DialogDescription>
                                  </DialogHeader>
                              </LargeDialogContent>
                          </Dialog>
  
                          <Dialog>
                              <DialogTrigger className='text-blue-500'>Edit</DialogTrigger>
                              <LargeDialogContent className='w-5/6 max-w-full'>
                                  <DialogHeader>
                                      <DialogTitle>Edit Information for {data.name}</DialogTitle>
                                      <DialogDescription>
                                          <Create name={data.name} docId={eleId} />
                                      </DialogDescription>
                                  </DialogHeader>
                              </LargeDialogContent>
                          </Dialog>
  
                          <button
                              className="text-red-500"
                              onClick={async () => {
                                  const resp = await EmployeeDataAction.DELETE.deleteEmployeeData(eleId);
                                  if (resp.status === 200) {
                                      toast.success("Deleted, Reload to View Changes");
                                  } else {
                                      toast.error(resp.message);
                                  }
                              }}
                          >
                              Delete
                          </button>
                      </div>
                  </div>
              )}
          </div>
  
          {/* Modal Code for Show Modal */}
          {showModal ? (
              <>
                  <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none mt-16">
                      <div className="relative w-auto my-6 pt-96 mx-auto max-w-3xl">
                          {/* content */}
                          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                              {/* header */}
                              <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                  <h3 className="text-3xl font-semibold">Edit Form for</h3>
                                  <button
                                      className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                      onClick={() => setShowModal(false)}
                                  >
                                      <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">×</span>
                                  </button>
                              </div>
                              {/* body */}
                              <div className="relative p-6 flex-auto">
                                  {/* <Create /> */}
                              </div>
                              {/* footer */}
                              <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                  <button
                                      className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                      type="button"
                                      onClick={() => setShowModal(false)}
                                  >
                                      Close
                                  </button>
                                  <button
                                      className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                      type="button"
                                  >
                                      Save Changes
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
              </>
          ) : null}
      </>
  );
  
}

export default DataComponent

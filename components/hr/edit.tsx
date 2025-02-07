import departmentHrAction from '@/lib/actions/HR/DepartmentHr/departmentHrAction';
import designationAction from '@/lib/actions/HR/Designation/designationAction';
import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import EsiLocationAction from '@/lib/actions/HR/EsiLocation/EsiLocationAction';
import siteMasterAction from '@/lib/actions/HR/siteMaster/siteMasterAction';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  fetchEmployeeById,
  fetchEmployeeByName,
} from '@/lib/actions/HR/EmployeeData/fetch';
import BankAction from '@/lib/actions/HR/Bank/bankAction';

const Create = ({ name, docId }) => {
  const [formData, setFormData] = useState({
    code: '',
    workManNo: '',
    name: '',
    department: '',
    site: '',
    designation: '',
    bank: '',
    accountNumber: '',
    pfApplicable: false,
    pfNo: '',
    UAN: '',
    ESICApplicable: false,
    ESICNo: '',
    ESILocation: '',
    adhaarNumber: '',
    sex: '',
    martialStatus: '',
    dob: '',
    attendanceAllowance: false,
    fathersName: '',
    address: '',
    landlineNumber: '',
    mobileNumber: '',
    workingStatus: true,
    appointmentDate: '',
    resignDate: '',
    safetyPassNumber: '',
    SpValidity: '',
    policeVerificationValidityDate: '',
    gatePassNumber: '',
    gatePassValidTill: '',
    basic: '',
    DA: '',
    HRA: '',
    CA: '',
    food: '',
    incentives: '',
    uniform: '',
    medical: '',
    loan: '',
    LIC: '',
    oldBasic: '',
    oldDA: '',
  });
  const [departmentList, setDepartmentList] = useState<any>(null);
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);

  const [siteList, setSiteList] = useState<any>(null);
  const [designationList, setDeisgnationList] = useState<any>(null);
  const [bankList, setBankList] = useState<any>(null);

  const [EsiLocationList, setEsiLocationList] = useState<any>(null);
  useEffect(() => {
    const depFn = async () => {
      const resp = await departmentHrAction.FETCH.fetchDepartmentHr();
      if (resp.status === 200) {
        setDepartmentList(JSON.parse(resp.data));
      }
    };
    const siteFn = async () => {
      const resp = await siteMasterAction.FETCH.fetchSiteMaster();
      if (resp.status === 200) {
        setSiteList(JSON.parse(resp.data));
      }
    };
    const designationFn = async () => {
      const resp = await designationAction.FETCH.fetchDesignations();
      if (resp.status === 200) {
        setDeisgnationList(JSON.parse(resp.data));
      }
    };
    const bankFn = async () => {
      const resp = await BankAction.FETCH.fetchBanks();
      if (resp.status === 200) {
        setBankList(JSON.parse(resp.data));
      }
    };
    const EsiLocationFn = async () => {
      const resp = await EsiLocationAction.FETCH.fetchEsiLocation();
      if (resp.status === 200) {
        setEsiLocationList(JSON.parse(resp.data));
      }
    };
    const FetchEmployee = async () => {
      // const resp = await fetchEmployeeByName(name)
      // console.log('LAWDE', name, docId);
      const resp = await fetchEmployeeById(docId);
      console.log('wowoowowowowowowow', resp);
      if (resp.status === 200) {
        const details = await JSON.parse(resp.data);

        console.log(details._id);
        // setEmployeeDetails(details);
        setEmployeeDetails(() => ({
          ...details,
          dob: formatDate(details.dob),
          appointmentDate: formatDate(details.appointmentDate),
          resignDate: formatDate(details.resignDate),
          policeVerificationValidityDate: formatDate(
            details.policeVerificationValidityDate
          ),
          gatePassValidTill: formatDate(details.gatePassValidTill),
          SpValidity: formatDate(details.SpValidity),
        }));
        setFormData((prevData) => ({
          ...prevData,
          ...details,
        }));
        console.log('yeh hogya formdata', formData);
      }
    };
    const fn = async () => {
      depFn();
      siteFn();
      designationFn();
      EsiLocationFn();
      FetchEmployee();
      bankFn();
    };
    fn();
  }, []);
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleToggle = (fieldName: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: !prevData[fieldName],
    }));
    console.log(formData);
  };
  const handleSubmit = async () => {
    // Convert all date fields to 'dd-mm-yyyy' format
    console.log('yyyy', formData);
    const formattedData = {
      ...formData,
      dob: formData.dob,
      appointmentDate: formData.appointmentDate,
      resignDate: formData.resignDate,
      policeVerificationValidityDate: formData.policeVerificationValidityDate,
      gatePassValidTill: formData.gatePassValidTill,
      SpValidity: formData.SpValidity,
    };
    const resp = await EmployeeDataAction.UPDATE.updateEmployeeData(
      JSON.stringify(formattedData),
      employeeDetails._id
    );
    if (resp.status === 200) {
      toast.success('Edited Successfully');
    } else {
      toast.error(resp.message);
    }
  };

  // Function to format date from 'yyyy-mm-dd' to 'dd-mm-yyyy'
  const formatDate = (dateString) => {
    if (!dateString) return dateString; // Return if dateString is empty
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`; // Return in 'dd-mm-yyyy' format
  };

  return (
    <div className=''>
      <p className='flex items-center mt-2 justify-center p-2 border-gray-600 border-b font-semibold text-2xl '>
        Employee Information
      </p>

      <div className='flex items-center justify-center flex-wrap'>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Code:
          </label>
          <input
            type='text'
            id='input'
            name='code'
            value={formData.code}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Code Here'
            min='1'
          />
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            WorkMan No:
          </label>
          <input
            type='text'
            id='input'
            name='workManNo'
            value={formData.workManNo}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter workMan No Here'
            min='1'
          />
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Name:
          </label>
          <input
            type='text'
            id='input'
            name='name'
            value={formData.name}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter name Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Department:
          </label>
          <select
            id='department'
            name='department'
            value={formData.department}
            onChange={handleInputChange}
            className='mt-1 block w-60 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>

            {departmentList?.map((ele) => (
              <option key={ele._id} value={ele._id}>
                {ele.name}
              </option>
            ))}
          </select>
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Site:
          </label>
          <select
            id='site'
            name='site'
            value={formData.site}
            onChange={handleInputChange}
            className='mt-1 block w-60 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>

            {siteList?.map((ele) => (
              <option key={ele._id} value={ele._id}>
                {ele.name}
              </option>
            ))}
          </select>
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Designation:
          </label>
          <select
            id='designation'
            name='designation'
            value={formData.designation}
            onChange={handleInputChange}
            className='mt-1 block w-60 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>

            {designationList?.map((ele) => (
              <option key={ele._id} value={ele._id}>
                {ele.designation}
              </option>
            ))}
          </select>
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Bank:
          </label>
          <select
            id='bank'
            name='bank'
            value={formData.bank}
            onChange={handleInputChange}
            className='mt-1 block w-60 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>

            {bankList?.map((ele) => (
              <option key={ele._id} value={ele._id}>
                {ele.ifsc}
              </option>
            ))}
          </select>
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Account No:
          </label>
          <input
            type='text'
            id='input'
            name='accountNumber'
            value={formData.accountNumber}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Account No Here'
            min='1'
          />
        </div>
        <div className='m-4'>
          <label className='inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              className='sr-only peer'
              checked={formData.pfApplicable}
              onChange={() => handleToggle('pfApplicable')}
            />
            <span className='ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 mr-2'>
              Pf Applicable
            </span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Pf No:
          </label>
          <input
            type='text'
            id='input'
            name='pfNo'
            value={formData.pfNo}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Pf No.'
            min='1'
          />
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            UAN:
          </label>
          <input
            type='text'
            id='input'
            name='UAN'
            value={formData.UAN}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter UAN Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label className='inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              className='sr-only peer'
              checked={formData.ESICApplicable}
              onChange={() => handleToggle('ESICApplicable')}
            />
            <span className='ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 mr-2'>
              ESIC Applicable
            </span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            ESICNo:
          </label>
          <input
            type='text'
            id='input'
            name='ESICNo'
            value={formData.ESICNo}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter ESICNo Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            ESILocation:
          </label>
          <select
            id='ESILocation'
            name='ESILocation'
            value={formData.ESILocation}
            onChange={handleInputChange}
            className='mt-1 block w-60 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>

            {EsiLocationList?.map((ele) => (
              <option key={ele._id} value={ele._id}>
                {ele.name}
              </option>
            ))}
          </select>
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            AadharNo:
          </label>
          <input
            type='text'
            id='input'
            name='adhaarNumber'
            value={formData.adhaarNumber}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter adhaar Number Here'
            min='1'
          />
        </div>
      </div>

      <p className='flex items-center justify-center p-2 border-gray-600 border-b font-semibold text-2xl'>
        Personal Information
      </p>

      <div className='flex items-center justify-center flex-wrap'>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Sex:
          </label>
          <select
            id='sex'
            name='sex'
            value={formData.sex}
            onChange={handleInputChange}
            className='mt-1 block w-40 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            <option value='Male'>Male</option>
            <option value='Female'>Female</option>
            <option value='other'>TransGender</option>
          </select>
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Martial Status:
          </label>
          <select
            id='martialStatus'
            name='martialStatus'
            value={formData.martialStatus}
            onChange={handleInputChange}
            className='mt-1 block w-50 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select...</option>
            <option value='married'>married</option>
            <option value='unmarried'>unmaried</option>
            <option value='choose to not disclose'>
              choose to not disclose
            </option>
          </select>
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            DOB:
          </label>
          <input
            type='date'
            id='input'
            name='dob'
            value={formData.dob}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter DOB Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label className='inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              className='sr-only peer'
              checked={formData.attendanceAllowance}
              onChange={() => handleToggle('attendanceAllowance')}
            />
            <span className='ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 mr-2'>
              Attendance Allowance
            </span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Fathers Name:
          </label>
          <input
            type='text'
            id='input'
            name='fathersName'
            value={formData.fathersName}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder="Enter Father's Name Here"
            min='1'
          />
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Address:
          </label>
          <input
            type='text'
            id='input'
            name='address'
            value={formData.address}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter address Here'
            min='1'
          />
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Landline:
          </label>
          <input
            type='text'
            id='input'
            name='landlineNumber'
            value={formData.landlineNumber}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Landline Here'
            min='1'
          />
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Mobile Number:
          </label>
          <input
            type='text'
            id='input'
            name='mobileNumber'
            value={formData.mobileNumber}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter mobile Number Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label className='inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              className='sr-only peer'
              checked={formData.workingStatus}
              onChange={() => handleToggle('workingStatus')}
            />
            <span className='ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 mr-2'>
              Working Status
            </span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Appointment Date(DD-MM-YYYY):
          </label>
          <input
            type='date'
            id='input'
            name='appointmentDate'
            value={formData.appointmentDate}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Appointment Date Here'
            min='1'
          />
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Resign Date:
          </label>
          <input
            type='date'
            id='input'
            name='resignDate'
            value={formData.resignDate}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Resign Date Here'
            min='1'
          />
        </div>
      </div>

      <p className='flex items-center justify-center p-2 border-gray-600 border-b font-semibold text-2xl'>
        Other Details
      </p>
      <div className='flex items-center justify-center flex-wrap'>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Safety Pass Number:
          </label>
          <input
            type='text'
            id='input'
            name='safetyPassNumber'
            value={formData.safetyPassNumber}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Safety Pass No. Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Sp Validity:
          </label>
          <input
            type='date'
            id='input'
            name='SpValidity'
            value={formData.SpValidity}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Sp Validity Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Police Verification Validity Date(DD-MM-YYYY):
          </label>
          <input
            type='date'
            id='input'
            name='policeVerificationValidityDate'
            value={formData.policeVerificationValidityDate}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Date Here'
            min='1'
          />
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Gate Pass Number
          </label>
          <input
            type='text'
            id='input'
            name='gatePassNumber'
            value={formData.gatePassNumber}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter gate Pass Number Here'
            min='1'
          />
        </div>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Gate Pass Valid Till(DD-MM-YYYY)
          </label>
          <input
            type='date'
            id='input'
            name='gatePassValidTill'
            value={formData.gatePassValidTill}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Gate Pass Validity Here'
            min='1'
          />
        </div>
      </div>
      <div className='flex items-center justify-center flex-wrap'>
        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Basic
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

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            DA
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

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            HRA
          </label>
          <input
            type='text'
            id='input'
            name='HRA'
            value={formData.HRA}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter HRA Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            CA
          </label>
          <input
            type='text'
            id='input'
            name='CA'
            value={formData.CA}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter CA Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Food
          </label>
          <input
            type='text'
            id='input'
            name='food'
            value={formData.food}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter food Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Incentives
          </label>
          <input
            type='text'
            id='input'
            name='incentives'
            value={formData.incentives}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Incentives Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Uniform
          </label>
          <input
            type='text'
            id='input'
            name='uniform'
            value={formData.uniform}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Uniform Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Medical
          </label>
          <input
            type='text'
            id='input'
            name='medical'
            value={formData.medical}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter medical Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Loan
          </label>
          <input
            type='text'
            id='input'
            name='loan'
            value={formData.loan}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Loan Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            LIC
          </label>
          <input
            type='text'
            id='input'
            name='LIC'
            value={formData.LIC}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter LIC Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Old Basic
          </label>
          <input
            type='text'
            id='input'
            name='oldBasic'
            value={formData.oldBasic}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter Old Basic Here'
            min='1'
          />
        </div>

        <div className='m-4'>
          <label
            htmlFor='input'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Old DA
          </label>
          <input
            type='text'
            id='input'
            name='oldDA'
            value={formData.oldDA}
            onChange={handleInputChange}
            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Enter oldDA Here'
            min='1'
          />
        </div>
      </div>
      <div className='flex items-center justify-center w-full mt-2'>
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded'
          onClick={handleSubmit}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Create;

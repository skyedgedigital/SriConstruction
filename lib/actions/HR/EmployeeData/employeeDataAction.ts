import { autoGenEmpCode } from './autoGenerateEmpCode';
import {
  createEmployeeData,
  createEmployeeDataBulk,
  uploadEmployeeDataPhotos,
} from './create';
import { deleteEmployeeData } from './delete';
import {
  fetchEmployeeByCode,
  fetchEmployeeById,
  fetchEmployeeByName,
  fetchEmployees,
  fetchAllEmployees,
  fetchEmployeesLazyLoading,
  fetchCompliancesByMonthYear,
  fetchEmployeesWithWorkorderHr
} from './fetch';
import { fetchEmployeesJoined, fetchEmployeesResigned, fetchEmpNames, fetchEmpsJoinedOrLeftWithinDateRange } from './fetchData';
import { getNotification } from './notification';
import { updateEmployeeData } from './update';

const EmployeeDataAction = {
  CREATE: {
    createEmployeeData: createEmployeeData,
    createEmployeeDataBulk: createEmployeeDataBulk,
    createRandomEmpCode: autoGenEmpCode,
    uploadEmployeeDataPhotos: uploadEmployeeDataPhotos,
  },
  DELETE: {
    deleteEmployeeData: deleteEmployeeData,
  },
  UPDATE: {
    updateEmployeeData: updateEmployeeData,
  },
  FETCH: {
    fetchAllEmployeeData: fetchEmployees,
    fetchEmployeeByName: fetchEmployeeByName,
    fetchEmployeeByCode: fetchEmployeeByCode,
    fetchEmployeeById: fetchEmployeeById,
    fetchAllEmployees: fetchAllEmployees,
    fetchEmployeesWithWorkorderHr: fetchEmployeesWithWorkorderHr,
    fetchEmployeesLazyLoading: fetchEmployeesLazyLoading,
    fetchNotification: getNotification,
    fetchCompliances: fetchCompliancesByMonthYear,
    fetchEmpNames: fetchEmpNames,
    fetchEmpsWithDateRange:fetchEmpsJoinedOrLeftWithinDateRange,
    fetchEmpsJoinedWithinDateRange:fetchEmployeesJoined,
    fetchEmpsResigned:fetchEmployeesResigned
  },
};

export default EmployeeDataAction;

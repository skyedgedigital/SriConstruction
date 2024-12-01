import { createEmployee, uploadPhotos } from './create';
import { deleteEmployee } from './delete';
import { getEmployee, fetchAllEmployees, fetchEmpByPhoneNumber } from './fetch';

const employeeAction = {
  CREATE: {
    createEmployee: createEmployee,
    uploadPhotos: uploadPhotos,
  },
  FETCH: {
    getEmployee: getEmployee,
    fetchAllEmployees: fetchAllEmployees,
    fetchEmployeeByPhoneNumber: fetchEmpByPhoneNumber,
  },
  DELETE: {
    deleteEmployee: deleteEmployee,
  },
};

export default employeeAction;

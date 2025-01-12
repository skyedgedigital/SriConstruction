import { getEmpsInvolvedInWorkOrder } from './empFromWorkOrder';
import {
  createWorkOrderHr,
  deleteWorkOrderHr,
  fetchAllValidWorkOrderHr,
  fetchAllWorkOrderHr,
  fetchSingleWorkOrderHr,
  getTotalWorkOrder,
} from './workOrderHr';

const WorkOrderHrAction = {
  CREATE: {
    createWorkOrderHr: createWorkOrderHr,
  },
  FETCH: {
    fetchAllWorkOrderHr: fetchAllWorkOrderHr,
    fetchSingleWorkOrderHr: fetchSingleWorkOrderHr,
    fetchEmpsFromWorkOrder: getEmpsInvolvedInWorkOrder,
    fetchTotalNumberOfWorkOrder: getTotalWorkOrder,
    fetchAllValidWorkOrderHr,
  },
  DELETE: {
    deleteWorkOrderHr: deleteWorkOrderHr,
  },
};

export default WorkOrderHrAction;

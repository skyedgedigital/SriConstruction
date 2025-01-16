import { createWorkOrder } from "./create";
import { deleteWorkOrder } from "./delete";
import { fetchAllWorkOrdersData, fetchWorkOrderByWorkOrderNumber, fetchWorkOrderUnitsByWorkOrderNameOrId } from "./fetch";
import { updateWorkOrder, updateWorkOrderBalance } from "./update";

const workOrderAction = {
  CREATE: {
    createWorkOrder: createWorkOrder,
  },
  DELETE: {
    deleteWorkOrder: deleteWorkOrder,
  },
  FETCH: {
    fetchAllWorkOrder: fetchAllWorkOrdersData,
    fetchWorkOrderByNumber: fetchWorkOrderByWorkOrderNumber,
    fetchWorkOrderUnitByNumberOrId: fetchWorkOrderUnitsByWorkOrderNameOrId,
  },
  UPDATE: {
    updateWorkOrder: updateWorkOrder,
    updateWorkOrderBalance,
  },
};

export default workOrderAction
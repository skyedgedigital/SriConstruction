import { getEmpsInvolvedInWorkOrder } from "./empFromWorkOrder";
import { createWorkOrderHr, deleteWorkOrderHr, fetchAllWorkOrderHr, fetchSingleWorkOrderHr, getTotalWorkOrder } from "./workOrderHr";

const WorkOrderHrAction = {
    CREATE:{
        createWorkOrderHr:createWorkOrderHr
    },
    FETCH:{
        fetchAllWorkOrderHr:fetchAllWorkOrderHr,
        fetchSingleWorkOrderHr:fetchSingleWorkOrderHr,
        fetchEmpsFromWorkOrder:getEmpsInvolvedInWorkOrder,
        fetchTotalNumberOfWorkOrder:getTotalWorkOrder
    },
    DELETE:{
        deleteWorkOrderHr:deleteWorkOrderHr
    }
}

export default WorkOrderHrAction
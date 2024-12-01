import { createStoreManagment } from "./create"
import { deleteStoreManagment } from "./delete"
import { fetchStoreManagment } from "./fetch"
import { returnTool, updateStoreManagment } from "./update"


const storeManagementAction = {
    CREATE:{
        createStoreManagement:createStoreManagment
    },
    UPDATE:{
        updateStoreManagement:updateStoreManagment,
        returnTool:returnTool
    },
    DELETE:{
        deleteStoreManagement:deleteStoreManagment
    },
    FETCH:{
        fetchStoreManagement:fetchStoreManagment
    }
}

export default storeManagementAction
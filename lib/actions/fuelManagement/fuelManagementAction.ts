import { createFuelManagement } from "./create"
import { deleteFuelManagement } from "./delete"
import { fetchFuelManagement } from "./fetch"
import { updateFuelManagement } from "./update"

const fuelManagementAction = {
    CREATE:{
        createFuelManagement:createFuelManagement
    },
    UPDATE:{
        updateFuelManagement:updateFuelManagement
    },
    DELETE:{
        deleteFuelManagement:deleteFuelManagement
    },
    FETCH:{
        fetchFuelManagement:fetchFuelManagement
    }
}

export default fuelManagementAction
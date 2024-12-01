import { createVehicle } from "./create";
import { deleteVehicleByVehicleNumber } from "./delete";
import { fetchAllVehicles, fetchVehicleByVehicleNumber } from "./fetch";
import { updateVehicleFields } from "./update";

const vehicleAction = {
    CREATE:{
        createVehicle:createVehicle
    },
    FETCH:{
        fetchAllVehicles:fetchAllVehicles,
        fetchVehicleByVehicleNumber:fetchVehicleByVehicleNumber
    },
    DELETE:{
        deleteVehicleByVehicleNumber:deleteVehicleByVehicleNumber
    },
    UPDATE:{
        updateVehicleFields:updateVehicleFields
    },
}

export default vehicleAction
import { createEsiLocation } from "./create"
import { deleteEsiLocation } from "./delete"
import { fetchEsiLocation } from "./fetch"
import { updateEsiLocation } from "./update"

const EsiLocationAction = {
    CREATE:{
        createEsiLocation:createEsiLocation
    },
    DELETE:{
        deleteEsiLocation:deleteEsiLocation
    },
    UPDATE:{
        updateEsiLocation:updateEsiLocation
    },
    FETCH:{
        fetchEsiLocation:fetchEsiLocation
    }
}

export default EsiLocationAction
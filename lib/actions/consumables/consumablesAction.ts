import { createConsumables } from "./create"
import { deleteConsumables } from "./delete"
import { fetchConsumables } from "./fetch"
import { updateConsumables } from "./update"

const consumableAction = {
    CREATE:{
        createConsumables:createConsumables
    },
    DELETE:{
        deleteConsumables:deleteConsumables
    },
    UPDATE:{
        updateConsumables:updateConsumables
    },
    FETCH:{
        fetchConsumables:fetchConsumables
    }
}

export default consumableAction
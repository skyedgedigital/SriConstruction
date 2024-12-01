import { createSiteMaster } from "./create"
import { deleteSiteMaster } from "./delete"
import { fetchSiteMaster } from "./fetch"
import { updateSiteMaster } from "./update"

const siteMasterAction = {
    CREATE:{
        createSiteMaster:createSiteMaster
    },
    UPDATE:{
        updateSiteMaster:updateSiteMaster
    },

    DELETE:{
        deleteSiteMaster:deleteSiteMaster
    },

    FETCH:{
        fetchSiteMaster:fetchSiteMaster
    }
}

export default siteMasterAction
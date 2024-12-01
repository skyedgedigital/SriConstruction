import { createDesignation } from "./create";
import { deleteDesignation } from "./delete";
import { fetchDesignations } from "./fetch";
import { updateDesignation } from "./update";

const designationAction = {
    CREATE:{
        createDesignation:createDesignation
    },
    UPDATE:{
        updateDesignation:updateDesignation
    },

    DELETE:{
        deleteDesignation:deleteDesignation
    },
    FETCH:{
        fetchDesignations:fetchDesignations
    }
}

export default designationAction;
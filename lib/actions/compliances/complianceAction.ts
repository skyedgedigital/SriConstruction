import { createCompliance } from "./create";
import { deleteCompliance } from "./delete";
import { fetchCompliance } from "./view";

const complianceAction = {
    CREATE:{
        createCompliance:createCompliance
    },
    DELETE:{
        deleteCompliance:deleteCompliance
    },
    FETCH:{
        fetchCompliance:fetchCompliance
    }
}

export default complianceAction
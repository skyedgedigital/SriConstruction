import { createDepartmentHr } from "./create"
import { deleteDepartmentHr } from "./delete"
import { fetchDepartmentHr } from "./fetch"
import { updateDepartmentHr } from "./update"

const departmentHrAction = {
    CREATE:{
        createDepartmentHr:createDepartmentHr
    },
    FETCH:{
        fetchDepartmentHr:fetchDepartmentHr
    },
    UPDATE:{
        updateDepartmentHr:updateDepartmentHr
    },
    DELETE:{
        deleteDepartmentHr:deleteDepartmentHr
    }
}

export default departmentHrAction
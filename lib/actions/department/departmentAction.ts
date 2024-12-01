import { createDepartment } from "./create";
import { deleteDepartment } from "./delete";
import { fetchAllDepartments } from "./fetch";

const departmentAction = {
    CREATE:{
        createDepartment:createDepartment
    },
    FETCH:{
        fetchAllDepartments:fetchAllDepartments
    },
    DELETE:{
        deleteDepartment:deleteDepartment
    }
}

export default departmentAction
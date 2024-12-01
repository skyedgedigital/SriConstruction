import { createEngineer } from "./create";
import { deleteEngineer } from "./delete";
import { fetchAllEngineers, fetchEngineerByDepartment } from "./fetch";

const engineerAction = {
    CREATE:{
        createEngineer:createEngineer
    },
    DELETE:{
        deleteEngineer:deleteEngineer
    },
    FETCH:{
        fetchAllEngineers:fetchAllEngineers,
        fetchEngineerByDepartmentName:fetchEngineerByDepartment
    }
}

export default engineerAction
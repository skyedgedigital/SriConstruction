import { createTool } from "./create";
import { deleteTool } from "./delete";
import { fetchTools } from "./fetch";
import { updateTool } from "./update";

const toolManagementAction = {
    CREATE:{
        createTool:createTool
    },
    DELETE:{
        deleteTool:deleteTool
    },
    FETCH:{
        fetchTools:fetchTools
    },
    UPDATE:{
        updateTools:updateTool
    }
}

export default toolManagementAction
import {createState,deleteState,fetchState,updateStateDetail} from "./State_CURD"

const StateActionHr = {
    CREATE:{
        createState:createState
    },
    FETCH:{
        fetchState:fetchState
    },
    UPDATE:{
        updateStateDetail:updateStateDetail
    },
    DELETE:{
        deleteState:deleteState
    }


}

export default StateActionHr
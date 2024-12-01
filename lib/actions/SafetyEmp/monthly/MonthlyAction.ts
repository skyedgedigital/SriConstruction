import { addMonthlyTask, deleteMonthlyTask, fetchMonthlyTask, updateMonthlyTask } from "./monthly";

const MonthlyAction = {
    CREATE:{
        createMonthlyEvent:addMonthlyTask
    },
    DELETE:{
        deleteMonthlyEvent:deleteMonthlyTask
    },
    UPDATE:{
        updateMonthlyEvent:updateMonthlyTask
    },
    FETCH:{
        fetchMonthlyEvent:fetchMonthlyTask
    }
}

export default MonthlyAction
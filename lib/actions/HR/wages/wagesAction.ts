import { createWageForAnEmployee } from "./create"
import { fetchFilledWages } from "./fetch"
import { fetchWageForAnEmployee, fetchFinalSettlement, fetchWagesForCalendarYear, fetchWagesForFinancialYear } from "./fetch"

const wagesAction = {
    CREATE: {
        createWage: createWageForAnEmployee
    },
    FETCH: {
        fetchFilledWages: fetchFilledWages,
        fetchWageForAnEmployee: fetchWageForAnEmployee,
        fetchFinalSettlement, fetchWagesForCalendarYear, fetchWagesForFinancialYear
    }
}

export default wagesAction
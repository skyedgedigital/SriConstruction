import { createWageForAnEmployee } from "./create"
import { fetchFilledWages } from "./fetch"
import {
  fetchWageForAnEmployee,
  fetchFinalSettlement,
  fetchWagesForCalendarYear,
  fetchWagesForFinancialYear,
  fetchFilledWagesWithAttendanceDays,
} from './fetch';

const wagesAction = {
  CREATE: {
    createWage: createWageForAnEmployee,
  },
  FETCH: {
    fetchFilledWages: fetchFilledWages,
    fetchWageForAnEmployee: fetchWageForAnEmployee,
    fetchFinalSettlement,
    fetchWagesForCalendarYear,
    fetchWagesForFinancialYear,
    fetchFilledWagesWithAttendanceDays,
  },
};

export default wagesAction
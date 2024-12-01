import { addEmployeeToAdvanceRegister, addEmployeeToDamageRegister, fetchAdvanceRegister, fetchDamageRegister, fetchEmployeeRegisterById, updateAdvanceInstallment, updateAdvanceRegisterEntry, updateDamageInstallment, updateDamageRegisterEntry } from "./complianceRegister";

const ComplianceRegisterAction = {
    CREATE: {
        addEmployeeToDamageRegister: addEmployeeToDamageRegister,
        addEmployeeToAdvanceRegister: addEmployeeToAdvanceRegister
    },
    FETCH: {
        fetchDamageRegister: fetchDamageRegister,
        fetchAdvanceRegister: fetchAdvanceRegister,
        fetchEmployeeRegisterById: fetchEmployeeRegisterById,
    },
    UPDATE: {
        updateDamageInstallment: updateDamageInstallment,
        updateAdvanceInstallment: updateAdvanceInstallment,
        updateDamageRegisterEntry: updateDamageRegisterEntry,
        updateAdvanceRegisterEntry: updateAdvanceRegisterEntry
    },
    DELETE: {
        // delete or edit after basic functions ke baad karte hai
    }
}

export default ComplianceRegisterAction;
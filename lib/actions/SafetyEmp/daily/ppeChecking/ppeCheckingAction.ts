import { addPpeChecking, deletePpeChecking, fetchPpeCheckingAll, fetchPpeCheckingById, updatePpeChecking } from "./ppeChecking"

const PpeCheckingAction = {
    CREATE:{
        createPpeChecking:addPpeChecking
    },
    FETCH:{
        fetchAllPpeCheckings:fetchPpeCheckingAll,
        fetchPpeCheckingById:fetchPpeCheckingById
    },
    DELETE:{
        deletePpeChecking:deletePpeChecking
    },
    UPDATE:{
        updatePpeChecking:updatePpeChecking
    }
}

export default PpeCheckingAction
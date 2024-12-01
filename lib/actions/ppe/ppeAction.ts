import { deleteAuditById, genAudit, getAuditAll } from "./audit";
import { deleteCheckListById, genCheckList, getCheckListAll } from "./checkList";
import { createPpe, deletePpe, fetchPpeAll, fetchPpeById, updatePpe } from "./ppe";
import { createPpeIssue, deletePpeIssue, fetchPpeIssue } from "./ppeIssue";
import { deletePpeIssueAndReplacement, fetchPpeIssueAndReplacement, genPpeIssueAndReplacement } from "./ppeIssueAndReplacement";
import { createPpePurchase, deletePpePurchase, fetchPpePurchases } from "./ppePurchase";

const PpeAction = {
    CREATE:{
        createPpe:createPpe,
        createPpeIssue:createPpeIssue,
        createPpePurchase:createPpePurchase,
        createCheckList:genCheckList,
        createAudit:genAudit,
        createPpeIssueAndReplacement:genPpeIssueAndReplacement
    },
    DELETE:{
        deletePpe:deletePpe,
        deletePpeIssue:deletePpeIssue,
        deleltePpePurchase:deletePpePurchase,
        deleteAudit:deleteAuditById,
        deleteCheckListById:deleteCheckListById,
        deletePpeIssueAndReplacement:deletePpeIssueAndReplacement
    },
    FETCH:{
        fetchPpeAll:fetchPpeAll,
        fetchPpeById:fetchPpeById,
        fetchPpeIssuesAll:fetchPpeIssue,
        fetchPpePurchases:fetchPpePurchases,
        fetchAllCheckList:getCheckListAll,
        fetchAllAudit:getAuditAll,
        fetchPpeIssueAndReplacement:fetchPpeIssueAndReplacement
    },
    UPDATE:{
        updatePpe:updatePpe,
    },
    
}

export default PpeAction
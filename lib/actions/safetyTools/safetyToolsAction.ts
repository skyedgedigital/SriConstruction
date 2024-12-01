import { deleteAuditById, genAudit, getAuditAll } from "./audit";
import { deleteCheckListById, genCheckList, getCheckListAll } from "./checkList";
import { deleteMaintanenceById, genMaintanence, getMaintanenceAll } from "./maintanence";
import { deleteSafetyToolIssueAndReplacement, genSafetyToolIssueAndReplacement, viewSafetyToolIssueAndReplacement } from "./safetyToolIssueAndReplacementRegister";
import { createTool, deleteTool, fetchSafetyToolById, fetchSafetyTools, updateSafetyTool } from "./safetyTools";
import { createSafetyToolIssue, deleteSafetyToolIssue, fetchSafetyToolsIssue } from "./safetyToolsIssue";
import { createService, deleteService, fetchSafetyToolsInService } from "./safetyToolsMant";
import { createSafetyToolPurchase, deleteSafetyToolPurchase, fetchSafetyToolsPurchases } from "./safetyToolsPurchase";

const SafetyToolsAction = {
    CREATE:{
        createSafetyTool:createTool,
        createSafetyToolIssue:createSafetyToolIssue,
        createSafetyToolService:createService,
        createSafetyToolPurchase:createSafetyToolPurchase,
        createCheckList:genCheckList,
        createAudit:genAudit,
        createMaintanence:genMaintanence,
        createIssueAndReplacement:genSafetyToolIssueAndReplacement
    },
    DELETE:{
        deleteSafetyTool:deleteTool,
        deleteSafetyToolService:deleteService,
        deleteSafetyToolIssue:deleteSafetyToolIssue,
        deleteSafetyToolPurchase:deleteSafetyToolPurchase,
        deleteCheckListById:deleteCheckListById,
        deleteAuditById:deleteAuditById,
        deleteMaintanenceById:deleteMaintanenceById,
        deleteIssueAndReplacement:deleteSafetyToolIssueAndReplacement
    },
    FETCH:{
        fetchSafetyToolsAll:fetchSafetyTools,
        fetchSafetyToolsIssues:fetchSafetyToolsIssue,
        fetchSafetyToolsServices:fetchSafetyToolsInService,
        fetchSafetyToolPurchases:fetchSafetyToolsPurchases,
        fetchSafetyToolById:fetchSafetyToolById,
        fetchCheckList:getCheckListAll,
        fetchAuditList:getAuditAll,
        fetchMaintanenceList:getMaintanenceAll,
        fetchIssueAndReplacement:viewSafetyToolIssueAndReplacement
    },
    UPDATE:{
        updateSafetyTool:updateSafetyTool
    }
}

export default SafetyToolsAction
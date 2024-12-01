import { deleteCorrectiveAndPreventive, fetchCorrectiveAndPreventive, genCorrectiveAndPreventive } from "./creativeAndPreventive";
import { deleteHkAudit, fetchAllHkAudit, genHkAudit } from "./houseKeepingAudit";
import { deleteSafetyIndAndTraining, fetchSafetyIndAndTraining, genSafetyIndAndTraining } from "./safetyIndAndTraining";
import { deleteSiteSecurityUploads, fetchSiteSecurityUploads, genSiteSecurityUploads } from "./siteSecurityUploads";

const weeklyAuditAction = {
    CREATE:{
        createHouseKeepingAudit:genHkAudit,
        createSafetyIndAndTraining:genSafetyIndAndTraining,
        createCorrectiveAndPrev:genCorrectiveAndPreventive,
        createSiteSecurityUploads:genSiteSecurityUploads
    },
    FETCH:{
        fetchAllHouseKeepingAudit:fetchAllHkAudit,
        fetchSafetyIndAndTraining:fetchSafetyIndAndTraining,
        fetchCorrectiveAndPrev:fetchCorrectiveAndPreventive,
        fetchSiteSecurityUploads:fetchSiteSecurityUploads
    },
    DELETE:{
        deleteHouseKeepingAudit:deleteHkAudit,
        deleteSafetyIndAndTraining:deleteSafetyIndAndTraining,
        deleteCorrectiveAndPrev:deleteCorrectiveAndPreventive,
        deleteSiteSecurityUploads:deleteSiteSecurityUploads
    }
}

export default weeklyAuditAction;
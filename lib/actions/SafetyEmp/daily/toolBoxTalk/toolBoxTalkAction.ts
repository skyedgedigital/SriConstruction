import { deleteAttUploads, fetchAttUploads, genAttUpload } from "./attendanceUploads"
import { deleteSiteUploads, fetchSiteUploads, genSiteUploads } from "./siteUploads"
import { deleteStripUploads, fetchStripUploads, genStripUploads } from "./stripUploads"
import { deleteToolBoxTalk, fetchAllToolBoxTalk, genToolBoxTalk } from "./toolBoxTalk"

const toolBoxTalkAction = {
    CREATE:{
        createToolBoxTalk:genToolBoxTalk,
        createAttendanceUpload:genAttUpload,
        createStripUpload:genStripUploads,
        createSiteUpload:genSiteUploads
    },
    DELETE:{
        deleteToolBoxTalk:deleteToolBoxTalk,
        deleteAttendanceUpload:deleteAttUploads,
        deleteStripUpload:deleteStripUploads,
        deleteSiteUpload:deleteSiteUploads
    },
    FETCH:{ 
        fetchAllToolBoxTalk:fetchAllToolBoxTalk,
        fetchAttendanceUploads:fetchAttUploads,
        fetchStripUploads:fetchStripUploads,
        fetchSiteUploads:fetchSiteUploads
    }
}

export default toolBoxTalkAction
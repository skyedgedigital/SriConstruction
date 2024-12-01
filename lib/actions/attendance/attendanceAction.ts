import { fetchAllAttendance, fetchAttendance, fetchStatus } from "./fetch"
import { putAttendance } from "./put"

const attendanceAction = {
    PUT:{
        putAttendance:putAttendance
    },
    FETCH:{
        fetchAttendance:fetchAttendance,
        fetchAllAttendance:fetchAllAttendance,
        fetchStatus:fetchStatus
    }
}

export default attendanceAction
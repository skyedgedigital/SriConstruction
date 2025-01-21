import { fetchAllAttendance, fetchAttendance, fetchStatus, fetchYearlyLeavesAndPresentCounts } from "./fetch"
import { putAttendance } from "./put"

const attendanceAction = {
  PUT: {
    putAttendance: putAttendance,
  },
  FETCH: {
    fetchAttendance: fetchAttendance,
    fetchAllAttendance: fetchAllAttendance,
    fetchStatus: fetchStatus,
    fetchYearlyLeavesAndPresentCounts,
  },
};

export default attendanceAction
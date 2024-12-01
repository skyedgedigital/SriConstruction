import { fetchAnalytics, fetchHRAnalytics } from "./fetch"

const analyticsAction = {
    FETCH: {
        fetchAnalytics: fetchAnalytics,
        fetchHRAnalytics: fetchHRAnalytics
    }
}

export default analyticsAction
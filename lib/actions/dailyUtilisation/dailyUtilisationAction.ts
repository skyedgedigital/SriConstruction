import createDailyUtilisation from "./create";
import fetchDailyUtilisation from "./fetch";

const dailyUtilisationAction = {
    CREATE:{
        createDailyUtilisation:createDailyUtilisation
    },
    FETCH:{
        fetchDailyUtilisation:fetchDailyUtilisation
    }
}

export default dailyUtilisationAction
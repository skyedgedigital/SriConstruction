import { createChalan } from "./create"
import { deleteChalanbyChalanNumber } from "./delete"
import { getAllChalans, getChalanByChalanNumber, getChalanByEngineerAndWorkOrder, getChalansCreatedAWeekBefore, getPaginationInformation,getAllNonVerifiedChalans,getAllVerifiedChalans, getAllInvoiceCreatedChalans } from "./fetch"
import { markChalanAsVerified, updateChalan } from "./update"
import { testFunction } from "./test"
import { fn } from "./calculatePrice"
import { mergeChalans } from "./merge"
import { checkIfExisting, generateContinousInvocieNumber } from "./invoice"
import { getPhysicalChalansOfInvoice } from "./getChalanOfInvoice"
import { getSummaryPdfData } from "./summaryPdf"
import { vehicleReport } from "./vehicleReport"

const chalanAction = {
    CREATE:{
        createChalan:createChalan,
        createMergeChalan:mergeChalans
    },
    DELETE:{
        deleteChalan:deleteChalanbyChalanNumber
    },
    UPDATE:{
        updateChalan:updateChalan,
        markAsVerified:markChalanAsVerified
    },
    FETCH:{
        getAllChalans:getAllChalans,
        getChalanByChalanNumber:getChalanByChalanNumber,
        getAllChalansCreatedLastSevenDays:getChalansCreatedAWeekBefore,
        getPaginationInformation:getPaginationInformation,
        getChalanByEngineerAndWorkOrder:getChalanByEngineerAndWorkOrder,
        getAllNonVerifiedChalans:getAllNonVerifiedChalans,
        getAllVerifiedChalans:getAllVerifiedChalans,
        getAllInvoiceCreatedChalans:getAllInvoiceCreatedChalans,
        getPhysicalChalansOfInvoice:getPhysicalChalansOfInvoice,
        getLatestInvoiceNumber:generateContinousInvocieNumber,
        getSummaryPdfData:getSummaryPdfData,
        vehicleReport:vehicleReport
    },
    CHECK:{
        checkExistingInvoice:checkIfExisting
    },
    TEST:{
        testChalan:testFunction,
        calc:fn
    }
}

export default chalanAction
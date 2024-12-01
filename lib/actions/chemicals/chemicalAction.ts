import { createChemicalIssue, deleteChemicalIssue, fetchChemicalIssueById, fetchChemicalIssues } from "./chemicalIssue";
import { deleteChemicalIssueAndReplacementRegister, genChemicalIssueAndReplacement, viewChemicalIssueAndReplacementRegister } from "./chemicalIssueAndReplacement";
import { createChemicalPurchase, deleteChemicalPurchase, fetchChemicalPurchases } from "./chemicalPurchase";
import createChemical from "./createChemical";
import deleteChemical from "./deleteChemical";
import { fetchChemicalById, fetchChemicals } from "./fetchChemicals";
import { updateChemical } from "./updateChemical";

const chemicalAction = {
    CREATE:{
        createChemical:createChemical,
        createChemicalPurchase:createChemicalPurchase,
        createChemicalIssue:createChemicalIssue,
        createChemicalIssueAndReplacementRegister:genChemicalIssueAndReplacement
    },
    DELETE:{
        deleteChemical:deleteChemical,
        deleteChemicalIssue:deleteChemicalIssue,
        deleteChemicalPurchase:deleteChemicalPurchase,
        deleteChemicalIssueAndReplacement:deleteChemicalIssueAndReplacementRegister
    },
    UPDATE:{
        updateChemical:updateChemical,
    },
    FETCH:{
        fetchAllChemicals:fetchChemicals,
        fetchChemicalById:fetchChemicalById,
        fetchAllChemicalsIssues:fetchChemicalIssues,
        fetchChemicalIssueById:fetchChemicalIssueById,
        fetchChemicalPurchases:fetchChemicalPurchases,
        fetchChemicalIssueAndReplacementRegister:viewChemicalIssueAndReplacementRegister
    }
}

export default chemicalAction
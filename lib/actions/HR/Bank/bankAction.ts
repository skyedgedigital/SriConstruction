
import { createBank } from "./create";
import { fetchBanks } from "./fetch";
import { updateBank } from "./update";
import { deleteBank } from "./delete";

const BankAction = {
    CREATE:{
        createBank:createBank
    },
    UPDATE:{
        updateBank:updateBank
    },

    DELETE:{
        deleteBank:deleteBank
    },
    FETCH:{
        fetchBanks:fetchBanks
    }
}

export default BankAction;
import { createItem } from "./create"
import { deleteItemByItemNumber } from "./delete"
import { fetchAllItemsOfWorkOrder, fetchHsnNumberByItemId, fetchItemByItemNumber } from "./fetch"
import { updateItem } from "./update"

const itemAction = {
    CREATE:{
       createItem:createItem 
    },
    FETCH:{
        fetchAllItemOfWorkOrder:fetchAllItemsOfWorkOrder,
        fetchItemByItemNumber:fetchItemByItemNumber,
        fetchHsnNoByItemId:fetchHsnNumberByItemId
    },
    DELETE:{
        deleteItemByItemNumber:deleteItemByItemNumber
    },
    UPDATE:{
        updateItemByItemId:updateItem
    }
}

export default itemAction
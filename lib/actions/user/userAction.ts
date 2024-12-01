import { createAdmin, createUser } from "./create"
import { deleteUser, deleteAdmin } from "./delete"
import { getUser, getAdmin } from "./fetch"
import { updateUserPassword } from "./update"

const userAction = {
    CREATE: {
        createAdmin: createAdmin,
        createUser: createUser
    },
    FETCH: {
        getUser: getUser,
        getAdmin: getAdmin
    },
    DELETE: {
        deleteUser: deleteUser,
        deleteAdmin: deleteAdmin
    },
    UPDATE: {
        updateUserPassword: updateUserPassword
    }

}

export default userAction
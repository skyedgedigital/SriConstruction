import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

const getServerSideSession = async() => {
    const session = await getServerSession(authOptions)
    return session
}

export default getServerSideSession
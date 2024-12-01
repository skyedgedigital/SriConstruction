'use client'
import UpdatePassword from "@/components/driver/UpdatePassword"
import EmpDetails from "@/components/EmpDetails";
import chalanAction from "@/lib/actions/chalan/chalanAction";
import { useSession } from "next-auth/react";
import { CSSProperties } from "react";
import toast from "react-hot-toast";
import HashLoader from "react-spinners/HashLoader";
const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
const FleetManager = () => {
    const session = useSession();
//   console.warn(session);

  if (!session.data) {
    return (
      <>
        <div className="flex justify-center items-center h-screen w-full">
          <HashLoader color="#000000" cssOverride={override} aria-label="Loading..." />
        </div>
      </>
    );
  }
    return (
        <>
            <EmpDetails details={session?.data} />
      <div className="ml-56 mt-4" >
        <UpdatePassword/>
      </div>
        </>
    )
}
export default FleetManager
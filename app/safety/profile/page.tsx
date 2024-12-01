"use client";
import UpdatePassword from "@/components/driver/UpdatePassword";
import EmpDetails from "@/components/EmpDetails";
import employeeAction from "@/lib/actions/employee/employeeAction";
import SafetyToolsAction from "@/lib/actions/safetyTools/safetyToolsAction";
import { useSession } from "next-auth/react";
import { CSSProperties, useEffect, useState } from "react";
import HashLoader from "react-spinners/HashLoader";
const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const Safety = () => {
  const [phoneNumber, setPhoneNumber] = useState(null);
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

  const run = async () => {
    const resp = await employeeAction.FETCH.fetchEmployeeByPhoneNumber(
      phoneNumber
    );
    console.warn(resp.data);
  };

  return (
    <>
      {/* <div className="ml-[80px]">
        <UpdatePassword />
      </div>
      <button className="m-16" onClick={run}>
        click me
      </button> */}
      <EmpDetails details={session?.data} />
      <div className="ml-56 mt-4" >
        <UpdatePassword/>
      </div>
    </>
  );
};

export default Safety;

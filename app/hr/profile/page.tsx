'use client'
import UpdatePassword from "@/components/driver/UpdatePassword"
import wagesAction from "@/lib/actions/HR/wages/wagesAction"
import attendanceAction from "@/lib/actions/attendance/attendanceAction"
import { useSession } from "next-auth/react"
import { CSSProperties } from "react"
import toast from "react-hot-toast"
import HashLoader from "react-spinners/HashLoader";
import EmpDetails from "@/components/HRDetails"
const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
const FleetManager = () => {

    const session = useSession();

    if (!session.data) {
        return (
          <>
            <div className="flex justify-center items-center h-screen w-full">
              <HashLoader color="#000000" cssOverride={override} aria-label="Loading..." />
            </div>
          </>
        );
      }

    const handleSubmit = async() => {
        const params = {
            employee:'6645b775f407b0c07b5fc1ba',
            month:5,
            year:2024,
            otherCash:{
                "cash":100,
                "parts":400
            },
            otherDeduction:{
                "fine":200
            },
        }
        // const resp = await wagesAction.CREATE.createWage(JSON.stringify(params))
        const resp = await wagesAction.FETCH.fetchFilledWages(5,2024,"Default")
        if(resp.status === 200){
            toast.success("Success")
            console.log(JSON.parse(resp.data))
        }
        else{
            toast.error(resp.message)
        }
    }

    return (
        <>
        
        {/* <div className="ml-[80px]"><UpdatePassword/></div>

        <button onClick={()=>{
            handleSubmit()
        }} className="ml-16" >  
            click me
        </button> */}
        <EmpDetails details={session?.data} />
      <div className="ml-56 mt-4" >
        <UpdatePassword/>
      </div>
        
        </>
    )
}
export default FleetManager
'use client'

import WorkOrderForm from "@/components/hr/workOrderForm"
import WorkOrderView from "@/components/hr/workOrderView"

const Page = () => {
    return(
        <>
            <div className="ml-16" >
                <div className="flex flex-col lg:flex-row" >
                    <WorkOrderView/>
                    <WorkOrderForm/>
                </div>
            </div>
        </>
    )
}

export default Page
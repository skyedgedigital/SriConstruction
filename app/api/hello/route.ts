import workOrderAction from "@/lib/actions/workOrder/workOrderAction";
import connectToDB from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET(req:Request) {
    try{
        await connectToDB();
        const resp = await workOrderAction.FETCH.fetchAllWorkOrder();
        return NextResponse.json(resp);
    }
    catch(err){
        return NextResponse.json({
            "message":err,
            "status":500
        })
    }
}
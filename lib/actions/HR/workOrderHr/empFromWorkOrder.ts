'use server'

import handleDBConnection from "@/lib/database";
import Attendance from "@/lib/models/HR/attendance.model";

const getEmpsInvolvedInWorkOrder = async (workOrderId) => {
  console.log(workOrderId);
  try {
 const dbConnection = await handleDBConnection();
 if (!dbConnection.success) return dbConnection;    const resp = await Attendance.find({
      workOrderHr: workOrderId
    }).populate('employee', ['code', 'name']);

    const set = new Set();
    resp.forEach((item) => {
      set.add(JSON.stringify({
        name: item.employee.name,
        code: item.employee.code
      }));
    });

    // Convert Set of strings back to an array of objects
    //@ts-ignore
    const uniqueEmployeesArray = [...set].map(item => JSON.parse(item));

    console.log(uniqueEmployeesArray);
    return {
      success: true,
      status: 200,
      data: JSON.stringify(uniqueEmployeesArray)
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message: 'An Error Occurred'
    };
  }
}

export { getEmpsInvolvedInWorkOrder }

import MonthlyAction from "@/lib/actions/SafetyEmp/monthly/MonthlyAction";
import React, { useState } from "react";
import toast from "react-hot-toast";

const AddMonthlyTask = () => {
  const [event, setEvent] = useState("");
  const [date, setDate] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const resp = await MonthlyAction.CREATE.createMonthlyEvent(
      JSON.stringify({
        date: date,
        event: event,
      })
    );
    if (resp.success) {
      toast.success("Event Added");
    } else {
      toast.error("Error Occured");
    }
  };
  return (
    <>
    <h1 className="w-full text-center my-4 text-3xl" >
      Add Monthly Event
    </h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto mt-4 p-6 bg-white shadow-md rounded-md flex-wrap"
      >
        
        <div className="mb-4">
          <label
            htmlFor="input"
            className="block text-sm font-medium text-gray-700"
          >
            Event Date (DD-MM-YYYY)
          </label>
          <input
            type="date"
            id="input"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
            }}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Date Here"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="textarea"
            className="block text-sm font-medium text-gray-700"
          >
            Event Description
          </label>
          <textarea
            id="textarea"
            value={event}
            onChange={(e) => {
              setEvent(e.target.value);
            }}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Event Description Here"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default AddMonthlyTask;

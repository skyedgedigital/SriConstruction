import EmployeeDataAction from "@/lib/actions/HR/EmployeeData/employeeDataAction";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmpDataComponent from "./EmpDataComponent";

const ViewEmpData = () => {
  const [loading, setLoading] = useState(false); // To track loading state
  const [data, setData] = useState([]); // To store employee data
  const [page, setPage] = useState(0); // To track the current page
  const [hasMore, setHasMore] = useState(true); // To check if more data is available

  const fetchData = async (currentPage) => {
    setLoading(true);
    try {
      const resp = await EmployeeDataAction.FETCH.fetchEmpNames(currentPage);
      if (resp.success) {
        const newData = JSON.parse(resp.data);
        setData((prev) => [...prev, ...newData]); // Append new data to existing data
        setHasMore(newData.length > 0); // If no new data, stop further requests
      } else {
        toast.error("Error fetching data");
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error occurred");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when page changes
  useEffect(() => {
    if (hasMore) fetchData(page);
  }, [page]);

  // Load more data when scrolling to the bottom
  //   const handleScroll = () => {
  //     if (
  //       window.innerHeight + document.documentElement.scrollTop + 10 >=
  //       document.documentElement.scrollHeight
  //     ) {
  //       if (!loading && hasMore) {
  //         setPage((prev) => prev + 1); // Increment page to fetch more data
  //       }
  //     }
  //   };

  //   // Attach scroll event listener
  //   useEffect(() => {
  //     window.addEventListener("scroll", handleScroll);
  //     return () => window.removeEventListener("scroll", handleScroll); // Cleanup
  //   }, [loading, hasMore]);

  return (
    <div>
      <h1 className="text-center text-xl mt-2">Employee Names</h1>
      {data.map((item, index) => (
        // <p className='bg-slate-200 my-2 px-3 py-2 rounded-sm cursor-pointer' key={index}>{item.name}</p>
        <EmpDataComponent key={index} name={item.name} docId={item._id} />
      ))}
      {loading && <p>Loading...</p>}
      {!hasMore && <p>No more data</p>}
    </div>
  );
};

export default ViewEmpData;

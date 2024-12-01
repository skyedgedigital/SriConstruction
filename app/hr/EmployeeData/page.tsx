// "use client";
// import { useState, useEffect } from "react";
// import ClientComponent from "./ClientComponent";
// import DataComponent from "@/components/hr/DataComponent";
// import EmployeeDataAction from "@/lib/actions/HR/EmployeeData/employeeDataAction";

// const Page = ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
//   // Convert searchParams to usable values
//   const initialPage = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
//   const limit = typeof searchParams.limit === "string" ? Number(searchParams.limit) : 15;

//   // Client-side state for pagination, employees, and loading
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [page, setPage] = useState<number>(initialPage);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [hasMore, setHasMore] = useState<boolean>(true);
//   const [totalPages, setTotalPages] = useState<number>(0);

//   // Fetch employees data function
//   const fetchEmployees = async (page: number) => {
//     setIsLoading(true);

//     try {
//       const res = await EmployeeDataAction.FETCH.fetchEmployeesLazyLoading(page, limit);
//       const response = res;

//       const newEmployees = JSON.parse(response.data);

//       if (Array.isArray(newEmployees)) {
//         setEmployees((prevEmployees) => [...prevEmployees, ...newEmployees]);
//         setTotalPages(response.totalPages);

//         if (page >= response.totalPages) {
//           setHasMore(false);
//         }
//       } else {
//         console.error("Error: newEmployees is not an array:", newEmployees);
//       }
//     } catch (err) {
//       console.error("Error fetching employees:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees(page);
//   }, []); // Initial fetch on mount

//   const loadMore = () => {
//     setPage((prevPage) => prevPage + 1);
//   };

//   useEffect(() => {
//     if (page > initialPage) {
//       fetchEmployees(page);
//     }
//   }, [page]);

//   return (
//     <ClientComponent>
//       <>
//         <h2>View pagem</h2>

//         {/* Loader display */}
//         {isLoading && <div className="loader">Loading data...</div>}

//         {/* List of Employee Data Components */}
//         {employees.length > 0 && (
//           <div>
//             {employees.map((item: any) => (
//               <DataComponent key={item._id} eleId={item._id} />
//             ))}
//           </div>
//         )}

//         {/* Load More Button */}
//         {hasMore && (
//           <button
//             onClick={loadMore}
//             className="mt-4 rounded border bg-gray-100 px-3 py-1 text-sm text-gray-800 hover:text-white hover:bg-black"
//             disabled={isLoading}
//           >
//             {isLoading ? "Loading..." : "Load More"}
//           </button>
//         )}

//         {/* No more data message */}
//         {!hasMore && <p>No more data to load.</p>}
//       </>
//     </ClientComponent>
//   );
// };

// export default Page;

"use client";

import Create from "@/components/hr/create";
import ViewEmpData from "@/components/hr/ViewEmpData";
import React, { useState } from "react";

const Page = () => {
  const [activeTab, setActiveTab] = useState('create');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  return (
    <>
      <p className="text-4xl text-center mt-10">Employee Data</p>
      <div className='p-2 m-2'>
          <ul className='flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400'>
            <li className='me-2'>
              <button
                onClick={() => handleTabClick('create')}
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === 'create'
                    ? 'text-green-600 bg-gray-100'
                    : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                }`}
              >
                Employee Data Entry
              </button>
            </li>
            <li className='me-2'>
              <button
                onClick={() => handleTabClick('view')}
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === 'view'
                    ? 'text-blue-600 bg-gray-100'
                    : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                }`}
              >
                View Entries
              </button>
            </li>
          </ul>
          <div className='tab-content'>
            {activeTab === 'create' && (
              <>
                <Create />
              </>
            )}
            {activeTab === 'view' && <>
              <ViewEmpData/>
            </>}
          </div>
        </div>
    </>
  );
};

export default Page;

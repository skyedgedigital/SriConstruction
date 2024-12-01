import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction'
import employeeAction from '@/lib/actions/employee/employeeAction'
// import React, { useEffect, useState } from 'react'
import DataComponent from './DataComponent'
import clsx from 'clsx'
import Link from 'next/link'

const View = async(searchParams:any) => {


    // const [dataList,setDataList] = useState<any>(null)
    // useEffect(()=>{
    //     const fn = async() => {
    //         const res = await EmployeeDataAction.FETCH.fetchAllEmployeeData();
    //         console.log(res)
    //         if(res.status === 200){
    //             setDataList(JSON.parse(res.data))
    //             console.log(res.data)
    //         }
    //     }
    //     fn();
    // },[])

    const page =
    typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
  const limit =
    typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 15

    const res=await EmployeeDataAction.FETCH.fetchAllEmployeeData(2,limit);
    const dataList=await JSON.parse(res.data)

  return (
    <>
        <div className='flex space-x-6'>
            <Link
              href={{
                pathname: '/hr/EmployeeData',
                query: {
              
                  page: page > 1 ? page - 1 : 1
                }
              }}
              className={clsx(
                'rounded border bg-gray-100 px-3 py-1 text-sm text-gray-800',
                page <= 1 && 'pointer-events-none opacity-50'
              )}
            >
              Previous
            </Link>
            <Link
              href={{
                pathname: '/hr/EmployeeData',
                query: {
                
                  page: page + 1
                }
              }}
              className='rounded border bg-gray-100 px-3 py-1 text-sm text-gray-800'
            >
              Next
            </Link>
          </div>

        {
            dataList && dataList.map((item:any)=>{
                return <DataComponent key={item._id} eleId={item._id} />
            })
        }
    </>
  )
}

export default View

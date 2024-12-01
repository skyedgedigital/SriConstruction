'use client'
import Create from '@/components/hr/edit';
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page = () => {
    const params = useSearchParams();
    const [name,setName] = useState(null)
    useEffect(()=>{
       const fn = () => {
        let name = params.get('name')
        setName(name)
       }
       fn();
    },[params])

  return (
    <>
        {
            name && (
                <>
                    <Create name={name} />
                </>
            )
        }
    </>
  )
}

export default Page

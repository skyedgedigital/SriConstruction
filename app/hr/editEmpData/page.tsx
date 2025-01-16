'use client';
import Create from '@/components/hr/edit';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const Page = () => {
  const params = useSearchParams();
  const [docId, setDocId] = useState(null);
  const [name, setName] = useState(null);
  useEffect(() => {
    const fn = () => {
      let params_id = params.get('docId');
      let props_name = params.get('name');
      setDocId(params_id);
      setName(props_name);
    };
    fn();
  }, [params]);

  return (
    <>
      {docId && name && (
        <>
          <Create docId={docId} name={name} />
        </>
      )}
    </>
  );
};

export default Page;

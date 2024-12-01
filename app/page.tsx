import { redirect } from 'next/navigation';
import getServerSideSession from '@/lib/serverSession';
import React from 'react';

const Home:React.FC<{}>=async()=> {
  const session=await getServerSideSession()
  if (!session) {
    redirect('/auth/login')
       }
else { redirect(`/${session?.user?.access?.toLowerCase()}/profile`) }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

    </main>
  );
}

export default Home;
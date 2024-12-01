// import React from 'react';
// import { redirect } from 'next/navigation';
// import getServerSideSession from '@/lib/serverSession';

// const layout = async ({ children }: { children: React.ReactNode }) => {
//     const session = await getServerSideSession();
//     // these checks are important to ensure that the user is authenticated and has the correct role. middleware.js is currently not working
//     if (!session) {
//         redirect('/api/auth/login');
//     } else if (session?.user?.access !== "FLEETMANAGER") {
//         redirect('/denied');
//     }
//     return (
//         <section className='flex-1 flex flex-col md:flex-row w-full  '>
//             {children}
//         </section>
//     );
// };

// export default layout;

import React from 'react';
import Sidebar from '@/components/Sidebar';
import getServerSideSession from '@/lib/serverSession';
import { redirect } from 'next/navigation';
import SidebarANDRestContainer from '@/components/ui/SidebarAndRestContainer';

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSideSession();
  // if (!session) {
  //     redirect('/api/auth/login');
  // } else
  if (session?.user?.access !== 'FLEETMANAGER') {
    redirect('/deniedaccess');
  }

  return <SidebarANDRestContainer>{children}</SidebarANDRestContainer>;
};

export default layout;

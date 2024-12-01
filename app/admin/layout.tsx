import React from 'react';
import Sidebar from '@/components/Sidebar';
import getServerSideSession from '@/lib/serverSession';
import { redirect } from 'next/navigation';
import SidebarANDRestContainer from '@/components/ui/SidebarAndRestContainer';
const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSideSession();

    if (session?.user?.access !== "ADMIN") {
        redirect('/deniedaccess');
    }
  return (
    
    // <div className='flex pt-16'>
      <SidebarANDRestContainer>{children}</SidebarANDRestContainer>
    // </div>
    
       
  );
};

export default layout;

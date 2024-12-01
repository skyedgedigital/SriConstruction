import React from 'react';
import { redirect } from 'next/navigation';
import getServerSideSession from '@/lib/serverSession';
import Sidebar from '@/components/Sidebar';
import SidebarANDRestContainer from '@/components/ui/SidebarAndRestContainer';


const layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await getServerSideSession();
    // these checks are important to ensure that the user is authenticated and has the correct role. middleware.js is currently not working
    // if (!session) {
    //     redirect('/api/auth/login');
    // } else
     if (session?.user?.access !== "DRIVER") {
        redirect('/deniedaccess');
    }
    return (
        <SidebarANDRestContainer>
            {children}
        </SidebarANDRestContainer>
        // <div className='flex pt-16'>
        // <Sidebar />
        //     <div className="py-8 w-full   ">{children}</div> 
        // </div>
    );
};

export default layout;

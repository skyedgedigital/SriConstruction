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
  if (session?.user?.access !== 'HR') {
    redirect('/deniedaccess');
  }
  return <SidebarANDRestContainer>{children}</SidebarANDRestContainer>;
};

export default layout;

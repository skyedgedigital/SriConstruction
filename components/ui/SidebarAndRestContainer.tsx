'use client';
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../Sidebar';
import toast from 'react-hot-toast';
import useConnectionStatus from '@/hooks/onlineandDatabaseConnection';

const SidebarANDRestContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(70);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { dbConnectionStatus, isOnline } = useConnectionStatus();

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  // useEffect(() => {
  //   const handleOnline = () => {
  //     toast.success('Back online!');
  //   };

  //   const handleOffline = () => {
  //     toast.error('No internet connection. Please check your connection.');
  //   };

  //   window.addEventListener('online', handleOnline);
  //   window.addEventListener('offline', handleOffline);

  //   // Initial check for online status
  //   if (!navigator.onLine) {
  //     handleOffline();
  //   }

  //   // Cleanup event listeners on component unmount
  //   return () => {
  //     window.removeEventListener('online', handleOnline);
  //     window.removeEventListener('offline', handleOffline);
  //   };
  // }, []);

  // useEffect(() => {
  //   const checkDBConnection = async () => {
  //     const res = await handleDBConnection();
  //     if (!res.success) {
  //       toast.error(`Database connection issue: ${res.message}`);
  //     }
  //   };

  //   // Initial check for database connection
  //   checkDBConnection();

  //   // Set an interval to check the database connection every 5 minutes
  //   const intervalId = setInterval(checkDBConnection, 2 * 60 * 1000);

  //   // Cleanup interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      setSidebarWidth(sidebarRef.current.offsetWidth + 12);
    }
  }, [isCollapsed]);

  return (
    <main>
      <Sidebar
        ref={sidebarRef}
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
      />
      <section
        className='p-2 pt-0 px-4 mt-16 w-ful'
        style={{ paddingLeft: sidebarWidth }}
      >
        {children}
      </section>
    </main>
  );
};

export default SidebarANDRestContainer;

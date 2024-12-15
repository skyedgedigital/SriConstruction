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

  useEffect(() => {
    const handleResize = () => {
      if (sidebarRef.current) {
        setSidebarWidth(sidebarRef.current.offsetWidth + 12);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (sidebarRef.current) {
      resizeObserver.observe(sidebarRef.current);
    }

    // Cleanup observer on component unmount
    return () => {
      if (sidebarRef.current) {
        resizeObserver.unobserve(sidebarRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <main>
      <Sidebar
        ref={sidebarRef}
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
      />
      <section
        className='p-2 pt-0 px-4 mt-16 w-full'
        style={{ paddingLeft: sidebarWidth }}
      >
        {children}
      </section>
    </main>
  );
};

export default SidebarANDRestContainer;

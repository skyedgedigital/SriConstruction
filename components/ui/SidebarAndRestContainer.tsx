'use client';
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../Sidebar';

const SidebarANDRestContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(70);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

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

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      if (event.detail) {
        if (isMobile) {
          setIsMobileOpen(event.detail.isOpen !== undefined ? event.detail.isOpen : !isMobileOpen);
        } else {
          setIsCollapsed(event.detail.isCollapsed !== undefined ? event.detail.isCollapsed : !isCollapsed);
        }
      }
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, [isMobile, isMobileOpen, isCollapsed]);

  // Calculate margin based on sidebar state
  const getMarginLeft = () => {
    if (isMobile) {
      return 'ml-0';
    }
    return isCollapsed ? 'ml-20' : 'ml-72';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={`transition-all duration-300 min-h-screen ${getMarginLeft()}`}>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
import React, { useState } from 'react';
import MemberSidebar from '../Sidebar/MemberSidebar';
import { useAuth } from '../../../context/AuthContext';
import { FaBell, FaUserCircle, FaSearch } from 'react-icons/fa';

const MemberLayout = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleCollapseChange = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <MemberSidebar onCollapseChange={handleCollapseChange} />

      {/* Main Content - Dynamic margin based on sidebar state */}
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3">
            {/* Left side - Page title */}
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
                Member Dashboard
              </h2>
              {/* Breadcrumb or page indicator */}
              <span className="text-xs text-gray-400 hidden lg:block">
                / {window.location.pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center gap-2 md:gap-3 ml-auto">
              {/* Search */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <FaSearch className="text-lg" />
              </button>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                <FaBell className="text-lg" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                  {user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'M'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700 leading-tight">
                    {user?.full_name || user?.username || 'Member'}
                  </p>
                  <p className="text-xs text-gray-400">Member</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;
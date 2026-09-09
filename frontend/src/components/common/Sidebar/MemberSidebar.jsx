import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.css';
import {
  FaChartLine,
  FaCalendarAlt,
  FaBookOpen,
  FaImages,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaHome,
  FaFileAlt,
  FaClipboardList,
  FaUser,
  FaChevronDown,
  FaChevronRight,
  FaLayerGroup,
  FaUserCog,
  FaCog,
  FaUsers,
  FaUserPlus,
  FaGraduationCap
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const MemberSidebar = ({ onCollapseChange }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({
    reports: false,
    events: false,
    members: false
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Notify parent when collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobile = () => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const memberName = user?.full_name || user?.username || 'Member';
  const memberPhoto = user?.photo || null;
  const memberRole = user?.role || 'Member';

  // Get user initials for avatar
  const getInitials = () => {
    if (!memberName) return 'M';
    const names = memberName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Get photo URL
  const getPhotoUrl = () => {
    if (!memberPhoto) return null;
    if (memberPhoto.startsWith('http://') || memberPhoto.startsWith('https://')) {
      return memberPhoto;
    }
    if (memberPhoto.startsWith('/uploads')) {
      return `http://localhost:5000${memberPhoto}`;
    }
    return `http://localhost:5000/uploads/members/${memberPhoto}`;
  };

  // Member menu items - with E-Learning added
  const menuItems = [
    {
      id: 'dashboard',
      path: '/member/dashboard',
      icon: MdDashboard,
      label: 'Dashboard',
      type: 'link'
    },
    {
      id: 'members',
      icon: FaUsers,
      label: 'Members',
      type: 'group',
      children: [
        { path: '/member/members', icon: FaUsers, label: 'View Members' },
        { path: '/member/add-member', icon: FaUserPlus, label: 'Add Member' },
      ]
    },
    {
      id: 'family-plans',
      path: '/member/family-plans',
      icon: FaClipboardList,
      label: 'Family Plans',
      type: 'link'
    },
    {
      path: '/member/e-learning',
      icon: FaGraduationCap,
      label: 'E-Learning',
      type: 'link'
    },
    {
      id: 'profile',
      path: '/member/profile',
      icon: FaUserCircle,
      label: 'My Profile',
      type: 'link'
    }
  ];

  // Render menu item
  const renderMenuItem = (item, index) => {
    // Group item
    if (item.type === 'group') {
      const isOpen = openDropdowns[item.id] !== undefined ? openDropdowns[item.id] : false;
      const hasActiveChild = item.children.some(child => isActive(child.path));

      // Collapsed mode - show as icon with tooltip
      if (!isMobile && isCollapsed) {
        return (
          <div key={index} className="relative group mb-1">
            <div
              className="flex items-center justify-center px-4 py-3 rounded-xl text-gray-400 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all duration-200"
              title={item.label}
            >
              <item.icon className="text-lg" />
            </div>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {item.label}
            </div>
          </div>
        );
      }

      return (
        <div key={index} className="mb-1">
          <button
            onClick={() => toggleDropdown(item.id)}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200 text-left ${
              hasActiveChild 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <item.icon className={`text-lg flex-shrink-0 ${hasActiveChild ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium flex-1">{item.label}</span>
            {isOpen ? (
              <FaChevronDown className={`text-xs ${hasActiveChild ? 'text-blue-500' : 'text-gray-400'}`} />
            ) : (
              <FaChevronRight className={`text-xs ${hasActiveChild ? 'text-blue-500' : 'text-gray-400'}`} />
            )}
          </button>

          {isOpen && (
            <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-blue-200 pl-2">
              {item.children.map((child, childIndex) => {
                const isChildActive = isActive(child.path);
                return (
                  <Link
                    key={childIndex}
                    to={child.path}
                    onClick={closeMobile}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isChildActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <child.icon className={`text-sm flex-shrink-0 ${isChildActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="truncate">{child.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Link item
    const isItemActive = isActive(item.path);

    // Collapsed mode
    if (!isMobile && isCollapsed) {
      return (
        <Link
          key={index}
          to={item.path}
          onClick={closeMobile}
          className={`flex items-center justify-center px-4 py-3 rounded-xl mb-1 transition-all duration-200 group relative ${
            isItemActive
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'
          }`}
          title={item.label}
        >
          <item.icon className="text-lg" />
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {item.label}
          </div>
        </Link>
      );
    }

    return (
      <Link
        key={index}
        to={item.path}
        onClick={closeMobile}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${
          isItemActive
            ? 'bg-blue-50 text-blue-600 shadow-sm'
            : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        <item.icon className={`text-lg flex-shrink-0 ${isItemActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <span className="text-sm font-medium truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 flex flex-col ${
          isMobile ? (
            isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
          ) : (
            isCollapsed ? 'w-20' : 'w-72'
          )
        }`}
      >
        {/* Logo Section */}
        <div className={`flex items-center px-4 h-20 border-b border-gray-100 ${
          !isMobile && isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          <Link to="/member/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 flex-shrink-0">
              ICS
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm leading-tight truncate text-gray-800">ICS PP Unity</span>
                <span className="text-xs text-gray-400 truncate">Member Panel</span>
              </div>
            )}
          </Link>

          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                !isCollapsed ? 'block' : 'hidden'
              }`}
            >
              <FaTimes className="text-gray-400 text-sm" />
            </button>
          )}
          {!isMobile && isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaBars className="text-gray-400 text-sm" />
            </button>
          )}
        </div>

        {/* User Profile - with photo support */}
        {(!isCollapsed || isMobile) && (
          <Link 
            to="/member/profile" 
            className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 hover:bg-blue-50/50 transition-colors group cursor-pointer"
          >
            {/* Profile Photo / Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
              {memberPhoto ? (
                <img 
                  src={getPhotoUrl()} 
                  alt={memberName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                getInitials()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate text-gray-800 group-hover:text-blue-600 transition-colors">
                {memberName}
              </div>
              <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                {memberRole}
              </div>
            </div>
            {/* Small edit icon on hover */}
            <FaCog className="text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        )}

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-gray-200">
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${
              !isMobile && isCollapsed ? 'justify-center' : ''
            }`}
            title={!isMobile && isCollapsed ? 'Logout' : ''}
          >
            <FaSignOutAlt className="text-lg flex-shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors"
        >
          <FaBars className="text-lg" />
        </button>
      )}
    </>
  );
};

export default MemberSidebar;
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import partyLogo from '../../../assets/ppimg.jpg';

// Import icons
import {
  FaChartLine,
  FaCity,
  FaUsers,
  FaUserFriends,
  FaUser,
  FaBriefcase,
  FaSitemap,
  FaCalendarAlt,
  FaNewspaper,
  FaFileAlt,
  FaImages,
  FaGlobe,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome,
  FaBook,
  FaCog,
  FaTachometerAlt,
  FaBuilding,
  FaChevronDown,
  FaChevronRight,
  FaLayerGroup,
  FaMap,
  FaUserTie,
  FaFileInvoice,
  FaShareAlt,
  FaGraduationCap,
  FaBookOpen,
  FaChartBar,
  FaMoneyBillWave
} from 'react-icons/fa';

const Sidebar = ({ onToggle, isMobileOpen: externalMobileOpen, isCollapsed: externalCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(externalMobileOpen || false);
  const [isCollapsed, setIsCollapsed] = useState(externalCollapsed || false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Dropdown states - all collapsed by default
  const [openDropdowns, setOpenDropdowns] = useState({
    organization: false,
    management: false,
    content: false,
    learning: false,
    leader_org: false,
    leader_content: false,
    leader2_org: false,
    leader2_content: false,
    member_content: false,
    family_leader_org: false,
    family_leader_activities: false,
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

  // Sync with external props
  useEffect(() => {
    if (externalMobileOpen !== undefined) {
      setIsMobileOpen(externalMobileOpen);
    }
  }, [externalMobileOpen]);

  useEffect(() => {
    if (externalCollapsed !== undefined) {
      setIsCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

  // Check if any item in a group is active
  const isGroupActive = (paths) => {
    return paths.some(path => location.pathname === path || location.pathname.startsWith(path));
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      const newState = !isMobileOpen;
      setIsMobileOpen(newState);
      if (onToggle) {
        onToggle({ isOpen: newState });
      }
      window.dispatchEvent(new CustomEvent('sidebarToggle', { 
        detail: { isOpen: newState }
      }));
    } else {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      if (onToggle) {
        onToggle({ isCollapsed: newState });
      }
      window.dispatchEvent(new CustomEvent('sidebarToggle', { 
        detail: { isCollapsed: newState }
      }));
    }
  };

  const closeMobile = () => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
      if (onToggle) {
        onToggle({ isOpen: false });
      }
      window.dispatchEvent(new CustomEvent('sidebarToggle', { 
        detail: { isOpen: false }
      }));
    }
  };

  // Get user role
  const userRole = user?.role || 'member';
  
  // Get menu items based on role
  const getMenuItems = () => {
    const allItems = [
      // Admin Items
      ...(userRole === 'admin' ? [
        { 
          id: 'organization',
          icon: FaLayerGroup,
          label: 'Organization',
          type: 'group',
          children: [
            { path: '/admin/districts', icon: FaMap, label: 'Districts' },
            { path: '/admin/cooperatives', icon: FaBuilding, label: 'Cooperatives' },
            { path: '/admin/families', icon: FaHome, label: 'Families' },
            { path: '/admin/members', icon: FaUser, label: 'Members' },
          ]
        },
        { 
          id: 'management',
          icon: FaUserTie,
          label: 'Management',
          type: 'group',
          children: [
            { path: '/admin/positions', icon: FaBriefcase, label: 'Positions' },
            { path: '/admin/hierarchy', icon: FaSitemap, label: 'Hierarchy' },
            { path: '/admin/evaluations', icon: FaChartBar, label: 'Evaluations' },
            { path: '/admin/payments', icon: FaMoneyBillWave, label: 'Financial Contributions' },
          ]
        },
        { 
          id: 'content',
          icon: FaFileInvoice,
          label: 'Content',
          type: 'group',
          children: [
            { path: '/admin/events', icon: FaCalendarAlt, label: 'Manage Events' },
            { path: '/admin/news', icon: FaNewspaper, label: 'Manage News' },
            { path: '/admin/plans', icon: FaFileAlt, label: 'Plans & Reports' },
            { path: '/admin/gallery', icon: FaImages, label: 'Gallery' },
            { path: '/admin/social', icon: FaShareAlt, label: 'Social Media' },
          ]
        },
        { 
          id: 'learning',
          icon: FaGraduationCap,
          label: 'E-Learning',
          type: 'group',
          children: [
            { path: '/admin/e-learning', icon: FaBookOpen, label: 'Manage E-Learning' },
            { path: '/admin/publications', icon: FaBook, label: 'Manage Publications' },
          ]
        },
        { path: '/admin/settings', icon: FaCog, label: 'Settings' },
      ] : []),

      // Leader 1 Items (cooperative_id = 1)
      ...(userRole === 'leader' && user?.cooperative_id === 1 ? [
        { 
          id: 'leader_org',
          icon: FaLayerGroup,
          label: 'Organization',
          type: 'group',
          children: [
            { path: '/leader/members', icon: FaUserFriends, label: 'Members' },
            { path: '/leader/hierarchy', icon: FaSitemap, label: 'Hierarchy' },
          ]
        },
        { 
          id: 'leader_content',
          icon: FaFileInvoice,
          label: 'Content',
          type: 'group',
          children: [
            { path: '/leader/plans', icon: FaFileAlt, label: 'Plans & Reports' },
            { path: '/leader/social', icon: FaShareAlt, label: 'Social Media' },
            { path: '/admin/evaluations', icon: FaChartBar, label: 'Evaluations' },
            { path: '/admin/payments', icon: FaMoneyBillWave, label: 'Financial Contributions' },
          ]
        },
      ] : []),

      // Leader 2 Items (cooperative_id = 2)
      ...(userRole === 'leader' && user?.cooperative_id === 2 ? [
        { 
          id: 'leader2_org',
          icon: FaLayerGroup,
          label: 'Organization',
          type: 'group',
          children: [
            { path: '/leader2/members', icon: FaUserFriends, label: 'Members' },
            { path: '/leader2/hierarchy', icon: FaSitemap, label: 'Hierarchy' },
          ]
        },
        { 
          id: 'leader2_content',
          icon: FaFileInvoice,
          label: 'Content',
          type: 'group',
          children: [
            { path: '/leader2/plans', icon: FaFileAlt, label: 'Plans & Reports' },
            { path: '/leader2/social', icon: FaShareAlt, label: 'Social Media' },
            { path: '/admin/evaluations', icon: FaChartBar, label: 'Evaluations' },
            { path: '/admin/payments', icon: FaMoneyBillWave, label: 'Financial Contributions' },
          ]
        },
      ] : []),

      // Family Leader Items
      ...(userRole === 'family_leader' ? [
        {
          id: 'family_leader_org',
          icon: FaLayerGroup,
          label: 'Organization',
          type: 'group',
          children: [
            { path: '/admin/members', icon: FaUser, label: 'Members' },
            { path: '/admin/families', icon: FaHome, label: 'Families' },
          ]
        },
        {
          id: 'family_leader_activities',
          icon: FaFileInvoice,
          label: 'Activities',
          type: 'group',
          children: [
            { path: '/admin/evaluations', icon: FaChartBar, label: 'Evaluations' },
            { path: '/admin/payments', icon: FaMoneyBillWave, label: 'Financial Contributions' },
          ]
        },
      ] : []),

      // Member Items
      ...(userRole === 'member' ? [
        { 
          id: 'member_content',
          icon: FaFileInvoice,
          label: 'Activities',
          type: 'group',
          children: [
            { path: '/member/events', icon: FaCalendarAlt, label: 'Events' },
            { path: '/member/family-plans', icon: FaBook, label: 'Family Plans' },
            { path: '/member/publications', icon: FaNewspaper, label: 'Publications' },
            { path: '/member/gallery', icon: FaImages, label: 'Gallery' },
            { path: '/member/e-learning', icon: FaGraduationCap, label: 'E-Learning' },
          ]
        },
        { path: '/member', icon: FaChartLine, label: 'Submit Plan & Report' },
      ] : []),
    ];

    // Add dashboard at the top for all roles
    if (userRole === 'admin') {
      allItems.unshift({ path: '/admin', icon: FaTachometerAlt, label: 'Dashboard' });
    } else if (userRole === 'leader') {
      allItems.unshift({ 
        path: user?.cooperative_id === 1 ? '/leader' : '/leader2', 
        icon: FaTachometerAlt, 
        label: 'Dashboard' 
      });
    } else if (userRole === 'family_leader') {
      allItems.unshift({ path: '/family-leader', icon: FaTachometerAlt, label: 'Dashboard' });
    } else {
      allItems.unshift({ path: '/member', icon: FaTachometerAlt, label: 'Dashboard' });
    }

    return allItems;
  };

  const menuItems = getMenuItems();

  // Render menu item (link or group)
  const renderMenuItem = (item, index) => {
    // If it's a group
    if (item.type === 'group') {
      const isActive = isGroupActive(item.children.map(child => child.path));
      const isOpen = openDropdowns[item.id] !== undefined ? openDropdowns[item.id] : false;
      
      // When collapsed on desktop, show as simple icon
      if (!isMobile && isCollapsed) {
        return (
          <div key={index} className="relative group">
            <div
              className="flex items-center justify-center px-4 py-3 rounded-xl mb-1 text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer transition-all duration-200"
              title={item.label}
            >
              <item.icon className="text-lg" />
            </div>
            {/* Tooltip on hover */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {item.label}
            </div>
          </div>
        );
      }

      return (
        <div key={index} className="mb-1">
          {/* Group Header */}
          <button
            onClick={() => toggleDropdown(item.id)}
            className={`
              flex items-center gap-3 w-full px-4 py-2.5 rounded-xl
              transition-all duration-200 text-left
              ${isActive 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }
            `}
          >
            <item.icon className={`text-lg flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium flex-1">{item.label}</span>
            {isOpen ? (
              <FaChevronDown className={`text-xs ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
            ) : (
              <FaChevronRight className={`text-xs ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
            )}
          </button>

          {/* Group Children */}
          {isOpen && (
            <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-blue-200 pl-2">
              {item.children.map((child, childIndex) => {
                const isChildActive = location.pathname === child.path || 
                                     (child.path !== '/' && location.pathname.startsWith(child.path));
                
                return (
                  <Link
                    key={childIndex}
                    to={child.path}
                    onClick={closeMobile}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg
                      transition-all duration-200 text-sm
                      ${isChildActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                      }
                    `}
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

    // Regular link item
    const isActive = location.pathname === item.path || 
                     (item.path !== '/' && location.pathname.startsWith(item.path));

    // When collapsed on desktop
    if (!isMobile && isCollapsed) {
      return (
        <Link
          key={index}
          to={item.path}
          onClick={closeMobile}
          className={`
            flex items-center justify-center px-4 py-3 rounded-xl mb-1
            transition-all duration-200 group relative
            ${isActive 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'
            }
          `}
          title={item.label}
        >
          <item.icon className={`text-lg ${isActive ? 'text-blue-500' : ''}`} />
          {/* Tooltip on hover */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-white text-gray-800 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
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
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl mb-1
          transition-all duration-200 group
          ${isActive 
            ? 'bg-blue-50 text-blue-600 shadow-sm' 
            : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
          }
        `}
      >
        <item.icon className={`text-lg flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <span className="text-sm font-medium truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-white shadow-2xl
          text-gray-800 z-50 transition-all duration-300 flex flex-col
          ${isMobile ? (
            isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
          ) : (
            isCollapsed ? 'w-20' : 'w-72'
          )}
        `}
      >
        {/* Logo Section - with toggle on same line */}
        <div className={`
          flex items-center px-4 h-20 border-b border-gray-100
          ${!isMobile && isCollapsed ? 'justify-center' : 'justify-between'}
        `}>
          <div className="flex items-center gap-3">
            <img 
              src={partyLogo} 
              alt="Party Logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-md flex-shrink-0"
            />
            {(!isCollapsed || isMobile) && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm leading-tight truncate text-gray-800">ICS PP Unity</span>
                <span className="text-xs text-gray-400 truncate">Immigration & Citizenship</span>
              </div>
            )}
          </div>
          
          {/* Toggle Button - On same line with logo */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className={`
                p-1.5 rounded-lg hover:bg-gray-100 transition-colors
                ${!isCollapsed ? 'block' : 'hidden'}
              `}
            >
              <FaTimes className="text-gray-400 text-sm" />
            </button>
          )}
          
          {/* Show bars icon when collapsed */}
          {!isMobile && isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaBars className="text-gray-400 text-sm" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-gray-200">
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-4 py-3 rounded-xl
              text-red-500 hover:bg-red-50 hover:text-red-600
              transition-all duration-200
              ${!isMobile && isCollapsed ? 'justify-center' : ''}
            `}
            title={!isMobile && isCollapsed ? 'Logout' : ''}
          >
            <FaSignOutAlt className="text-lg flex-shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Toggle Button - Floating */}
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

export default Sidebar;
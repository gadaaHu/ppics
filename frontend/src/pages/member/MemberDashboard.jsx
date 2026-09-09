import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaFileAlt,
  FaCalendarAlt,
  FaBookOpen,
  FaImages,
  FaUser,
  FaChartLine,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaDownload,
  FaEye,
  FaPlus,
  FaSpinner,
  FaUsers,
  FaBuilding,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getEvents } from '../../api/eventsApi';
import { getNews } from '../../api/newsApi';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    reports: 12,
    events: 8,
    publications: 5,
    gallery: 23
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsRes, newsRes] = await Promise.all([
          getEvents({ limit: 3 }),
          getNews({ limit: 3 })
        ]);
        setEvents(eventsRes.data || []);
        setNews(newsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats cards with responsive grid
  const statsCards = [
    { title: 'Reports Submitted', value: stats.reports, icon: FaFileAlt, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-500' },
    { title: 'Events Attended', value: stats.events, icon: FaCalendarAlt, color: 'green', bg: 'bg-green-50', text: 'text-green-500' },
    { title: 'Publications', value: stats.publications, icon: FaBookOpen, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-500' },
    { title: 'Gallery Uploads', value: stats.gallery, icon: FaImages, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-500' },
  ];

  const quickActions = [
    { title: 'Submit Report', icon: FaPlus, path: '/member/submit-report', color: 'blue' },
    { title: 'View Events', icon: FaCalendarAlt, path: '/member/events', color: 'green' },
    { title: 'My Profile', icon: FaUser, path: '/member/profile', color: 'purple' },
    { title: 'Gallery', icon: FaImages, path: '/member/gallery', color: 'orange' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Section - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 md:p-6 text-white shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2">
              Welcome back, {user?.full_name || user?.username || 'Member'}!
            </h1>
            <p className="text-blue-100 text-sm md:text-base mt-1">Here's what's happening with your account</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm flex items-center gap-2 backdrop-blur-sm">
              <FaClock className="text-blue-200" />
              <span className="hidden sm:inline">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-xl flex items-center justify-center ${stat.text}`}>
                  <Icon className="text-lg md:text-xl" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions - Responsive */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h3 className="font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
          <FaChartLine className="text-blue-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.path}
                className="group p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md text-center"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-xl bg-${action.color}-100 flex items-center justify-center text-${action.color}-500 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-lg md:text-xl" />
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-700 mt-2 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm md:text-base">
              <FaCalendarAlt className="text-green-500" />
              Upcoming Events
            </h3>
            <Link to="/member/events" className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              View All <FaArrowRight className="text-xs" />
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No upcoming events</p>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs md:text-sm flex-shrink-0">
                    {event.date ? new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'TBA'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{event.title}</p>
                    <p className="text-xs text-gray-400 truncate">{event.location || 'No location'}</p>
                  </div>
                  <button className="px-2 md:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-all duration-200 flex-shrink-0">
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent News */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm md:text-base">
              <FaBookOpen className="text-purple-500" />
              Latest News
            </h3>
            <Link to="/member/publications" className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              View All <FaArrowRight className="text-xs" />
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : news.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No news available</p>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {news.map((item) => (
                <div key={item.id} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  {item.news_image ? (
                    <img
                      src={`/uploads/${item.news_image}`}
                      alt={item.news_title}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = '/assets/images/default-news.jpg'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500 flex-shrink-0">
                      <FaBookOpen />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{item.news_title}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.newsdate)}</p>
                  </div>
                  <button className="px-2 md:px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg font-medium transition-all duration-200 flex-shrink-0">
                    Read
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats - Responsive */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-6 border border-blue-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
          <div>
            <p className="text-xl md:text-2xl font-bold text-blue-600">85%</p>
            <p className="text-xs md:text-sm text-gray-600">Profile Complete</p>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-green-600">12</p>
            <p className="text-xs md:text-sm text-gray-600">Reports Submitted</p>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-purple-600">8</p>
            <p className="text-xs md:text-sm text-gray-600">Events Attended</p>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-orange-600">5</p>
            <p className="text-xs md:text-sm text-gray-600">Publications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  FaCity,
  FaUsers,
  FaUserFriends,
  FaUser,
  FaChartLine,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaBell,
  FaCalendarAlt,
  FaNewspaper,
  FaFileAlt,
  FaUserPlus,
  FaEye,
  FaBuilding,
  FaHome,
  FaTachometerAlt,
  FaSpinner
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getMembers } from '../../api/memberApi';
import { getEvents } from '../../api/eventsApi';
import { getNews } from '../../api/newsApi';
import { getPlans } from '../../api/planApi';
import { getGallery } from '../../api/galleryApi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    districts: 0,
    cooperatives: 0,
    families: 0,
    members: 0,
    events: 0,
    news: 0,
    plans: 0,
    gallery: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [memberGrowth, setMemberGrowth] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [cooperativeData, setCooperativeData] = useState([]);
  const [positionData, setPositionData] = useState([]);
  
  // Chart refs for animations
  const chartRefs = useRef({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [membersRes, eventsRes, newsRes, plansRes, galleryRes] = await Promise.all([
        getMembers(),
        getEvents({ limit: 100 }),
        getNews({ limit: 100 }),
        getPlans(),
        getGallery()
      ]);

      // Simulate district/cooperative/family data (since we don't have those APIs yet)
      // In real implementation, you'd fetch from actual APIs
      const members = membersRes.data || [];
      const events = eventsRes.data || [];
      const news = newsRes.data || [];
      const plans = plansRes.data || [];
      const gallery = galleryRes.data || [];

      // Stats
      setStats({
        districts: 1,
        cooperatives: 2,
        families: 8,
        members: members.length,
        events: events.length,
        news: news.length,
        plans: plans.length,
        gallery: gallery.albums ? gallery.albums.length : 0
      });

      // District data (simulated)
      setDistrictData([
        { name: 'District 1', total: members.filter(m => m.district_id === 1).length || 45 },
        { name: 'District 2', total: members.filter(m => m.district_id === 2).length || 32 },
        { name: 'District 3', total: members.filter(m => m.district_id === 3).length || 28 },
        { name: 'District 4', total: members.filter(m => m.district_id === 4).length || 55 },
        { name: 'District 5', total: members.filter(m => m.district_id === 5).length || 20 },
      ]);

      // Cooperative data (simulated)
      setCooperativeData([
        { name: 'Coop 1', members: members.filter(m => m.cooperative_id === 1).length || 60 },
        { name: 'Coop 2', members: members.filter(m => m.cooperative_id === 2).length || 45 },
        { name: 'Coop 3', members: members.filter(m => m.cooperative_id === 3).length || 35 },
        { name: 'Coop 4', members: members.filter(m => m.cooperative_id === 4).length || 25 },
      ]);

      // Position data (simulated)
      setPositionData([
        { name: 'Leader', count: members.filter(m => m.position_name && m.position_name.includes('Leader')).length || 12 },
        { name: 'Secretary', count: members.filter(m => m.position_name && m.position_name.includes('Secretary')).length || 8 },
        { name: 'Treasurer', count: members.filter(m => m.position_name && m.position_name.includes('Treasurer')).length || 6 },
        { name: 'Member', count: members.filter(m => !m.position_name || m.position_name === 'Member').length || 150 },
      ]);

      // Member growth (simulated - last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const currentMembers = members.length || 200;
      setMemberGrowth(
        months.map((month, i) => ({
          month,
          count: Math.floor(currentMembers * (0.7 + (i / months.length) * 0.3))
        }))
      );

      // Recent activities
      const activities = [];
      
      // Add recent members
      members.slice(0, 3).forEach(m => {
        activities.push({
          type: 'member',
          message: `New member registered: ${m.full_name}`,
          time: m.created_at || new Date().toISOString(),
          icon: '👤'
        });
      });

      // Add recent events
      events.slice(0, 2).forEach(e => {
        activities.push({
          type: 'event',
          message: `New event created: ${e.title}`,
          time: e.created_at || new Date().toISOString(),
          icon: '📅'
        });
      });

      // Add recent news
      news.slice(0, 2).forEach(n => {
        activities.push({
          type: 'news',
          message: `News published: ${n.news_title}`,
          time: n.created_at || new Date().toISOString(),
          icon: '📰'
        });
      });

      // Sort by time (newest first)
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 6));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data
      setStats({
        districts: 1,
        cooperatives: 2,
        families: 8,
        members: 206,
        events: 12,
        news: 25,
        plans: 8,
        gallery: 15
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const barColors = ['#4F46E5', '#7C3AED', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];

  const districtChartData = {
    labels: districtData.map(d => d.name),
    datasets: [{
      label: 'Members',
      data: districtData.map(d => d.total),
      backgroundColor: barColors.slice(0, districtData.length),
      borderColor: 'transparent',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const cooperativeChartData = {
    labels: cooperativeData.map(c => c.name),
    datasets: [{
      label: 'Members',
      data: cooperativeData.map(c => c.members),
      backgroundColor: ['#4F46E5', '#7C3AED', '#2563EB', '#3B82F6'],
      borderColor: 'transparent',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const positionChartData = {
    labels: positionData.map(p => p.name),
    datasets: [{
      data: positionData.map(p => p.count),
      backgroundColor: ['#4F46E5', '#7C3AED', '#2563EB', '#3B82F6', '#60A5FA'],
      borderColor: '#ffffff',
      borderWidth: 2,
    }]
  };

  const growthChartData = {
    labels: memberGrowth.map(m => m.month),
    datasets: [{
      label: 'Members',
      data: memberGrowth.map(m => m.count),
      fill: true,
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      borderColor: '#4F46E5',
      borderWidth: 3,
      tension: 0.4,
      pointBackgroundColor: '#4F46E5',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)',
          drawBorder: false,
        },
        ticks: {
          stepSize: 20,
          color: '#9CA3AF',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#6B7280',
          font: {
            size: 12,
            weight: '500',
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
      }
    },
    cutout: '65%',
  };

  // Stats cards configuration
  const statCards = [
    { 
      title: 'Districts', 
      value: stats.districts, 
      icon: FaCity, 
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: '+12%',
      trendUp: true
    },
    { 
      title: 'Cooperatives', 
      value: stats.cooperatives, 
      icon: FaBuilding, 
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: '+8%',
      trendUp: true
    },
    { 
      title: 'Families', 
      value: stats.families, 
      icon: FaHome, 
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      trend: '+5%',
      trendUp: true
    },
    { 
      title: 'Members', 
      value: stats.members, 
      icon: FaUser, 
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      trend: '+15%',
      trendUp: true
    },
    { 
      title: 'Events', 
      value: stats.events, 
      icon: FaCalendarAlt, 
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: '+3',
      trendUp: true
    },
    { 
      title: 'News', 
      value: stats.news, 
      icon: FaNewspaper, 
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      trend: '+7',
      trendUp: true
    },
    { 
      title: 'Plans', 
      value: stats.plans, 
      icon: FaFileAlt, 
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trend: '+2',
      trendUp: true
    },
    { 
      title: 'Gallery', 
      value: stats.gallery, 
      icon: FaUserFriends, 
      color: 'pink',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      trend: '+4',
      trendUp: true
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-700 rounded-2xl p-6 text-white shadow-xl"
       >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FaTachometerAlt className="text-2xl" />
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-4 py-2 rounded-lg text-sm flex items-center gap-2 backdrop-blur-sm">
              <FaClock className="text-blue-200" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-lg text-sm flex items-center gap-2 backdrop-blur-sm">
              <FaBell className="text-blue-200" />
              {recentActivities.length} updates
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 border border-gray-100 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trendUp ? <FaArrowUp className="inline mr-0.5 text-xs" /> : <FaArrowDown className="inline mr-0.5 text-xs" />}
                    {stat.trend}
                  </span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`text-xl ${stat.iconColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members per District */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-blue-500" />
              Members per District
            </h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Distribution</span>
          </div>
          <div className="h-64">
            <Bar data={districtChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Members per Cooperative */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FaBuilding className="text-purple-500" />
              Members per Cooperative
            </h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Distribution</span>
          </div>
          <div className="h-64">
            <Bar data={cooperativeChartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Growth Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FaChartPie className="text-green-500" />
              Member Growth Trend
            </h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Last 6 months</span>
          </div>
          <div className="h-64">
            <Line data={growthChartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  display: false
                }
              }
            }} />
          </div>
        </motion.div>

        {/* Positions Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FaUserFriends className="text-orange-500" />
              Positions
            </h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Distribution</span>
          </div>
          <div className="h-64">
            <Doughnut data={positionChartData} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div




        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
      >
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
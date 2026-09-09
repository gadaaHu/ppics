// frontend/src/pages/admin/AttendancePage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaCalendarAlt,
  FaSearch,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaPrint,
  FaDownload,
  FaFileExport,
  FaSpinner,
  FaEye,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaQrcode,
  FaBarcode,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getEvents } from '../../api/eventApi';
import { getAttendanceByEvent, getAttendanceStats } from '../../api/attendanceApi';

const AttendancePage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [stats, setStats] = useState({
    total_events: 0,
    total_attendance: 0,
    events_with_attendance: 0
  });
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, statsRes] = await Promise.all([
        getEvents(),
        getAttendanceStats()
      ]);
      
      setEvents(eventsRes.data || []);
      setStats({
        total_events: eventsRes.total || 0,
        total_attendance: statsRes.data?.totals?.total_attendance_records || 0,
        events_with_attendance: statsRes.data?.totals?.total_events_with_attendance || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = async (eventId) => {
    try {
      setAttendanceLoading(true);
      const event = events.find(e => e.id === parseInt(eventId));
      setSelectedEvent(event);
      
      if (eventId) {
        const response = await getAttendanceByEvent(eventId);
        setAttendanceList(response.data?.attendance || []);
      } else {
        setAttendanceList([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create CSV
    const headers = ['#', 'Full Name', 'Phone', 'Email', 'Member ID', 'Scanned At'];
    const rows = attendanceList.map((record, index) => [
      index + 1,
      record.full_name,
      record.phone || '-',
      record.email || '-',
      record.member_id || '-',
      new Date(record.scan_time).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedEvent?.title || 'report'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Attendance exported successfully!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredAttendance = attendanceList.filter(record =>
    record.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.phone?.includes(searchTerm) ||
    record.member_no?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading attendance data...</p>
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
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaUsers className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Attendance Management</h3>
              <p className="text-green-100 text-sm">Track and manage event attendance</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <FaPrint /> Print
            </button>
            {attendanceList.length > 0 && (
              <button
                onClick={handleExport}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
              >
                <FaFileExport /> Export
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total Events', value: stats.total_events, icon: FaCalendarAlt, color: 'blue' },
          { title: 'Total Attendances', value: stats.total_attendance, icon: FaUserCheck, color: 'green' },
          { title: 'Events with Attendance', value: stats.events_with_attendance, icon: FaUsers, color: 'purple' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center text-${stat.color}-500`}>
                <stat.icon className="text-xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline mr-2" /> Select Event
            </label>
            <select
              onChange={(e) => handleEventSelect(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">-- Select an Event --</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} ({formatDate(event.date)})
                </option>
              ))}
            </select>
          </div>
          {selectedEvent && (
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
              <span className="text-sm text-gray-600">
                <strong>{selectedEvent.title}</strong>
                <span className="mx-2">•</span>
                {formatDate(selectedEvent.date)}
                <span className="mx-2">•</span>
                {attendanceList.length} attendees
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Attendance List */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <span className="text-sm text-gray-400">
                {filteredAttendance.length} of {attendanceList.length} attendees
              </span>
            </div>
          </div>

          {attendanceLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-3xl text-green-500" />
            </div>
          ) : attendanceList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">📋</div>
              <p className="text-gray-500 text-lg font-medium">No attendance recorded</p>
              <p className="text-gray-400 text-sm">Use the barcode scanner to mark attendance</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FaUser className="inline mr-1" /> Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FaPhone className="inline mr-1" /> Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FaIdCard className="inline mr-1" /> Member ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FaClock className="inline mr-1" /> Scanned At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAttendance.map((record, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-green-50/30 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">
                            {record.full_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-gray-800">{record.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.member_no || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaClock className="text-gray-400 text-xs" />
                          {formatTime(record.scan_time)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <FaCheckCircle className="text-xs" /> Present
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Stats */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-sm text-gray-500">
            <div>
              Total: {attendanceList.length} attendees
              {searchTerm && ` (filtered: ${filteredAttendance.length})`}
            </div>
            <button
              onClick={() => handleEventSelect(selectedEvent.id)}
              className="text-green-600 hover:text-green-700 font-medium transition"
            >
              Refresh
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AttendancePage;
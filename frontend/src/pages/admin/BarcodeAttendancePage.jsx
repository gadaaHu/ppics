// frontend/src/pages/admin/BarcodeAttendancePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FaBarcode,
  FaQrcode,
  FaCalendarAlt,
  FaUserCheck,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaUsers,
  FaIdCard,
  FaUser,
  FaClock,
  FaPrint
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getEvents } from '../../api/eventApi';
import { scanBarcode, getAttendanceByEvent } from '../../api/attendanceApi';

const BarcodeAttendancePage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState({ message: '', type: '', member: null });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const barcodeInputRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchEvents();
    // Focus on input on load
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 500);
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchAttendanceCount();
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      setEvents(response.data || []);
      // Auto-select first event if available
      if (response.data && response.data.length > 0) {
        setSelectedEvent(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceCount = async () => {
    if (!selectedEvent) return;
    try {
      const response = await getAttendanceByEvent(selectedEvent.id);
      setAttendanceCount(response.data?.attendance?.length || 0);
    } catch (error) {
      console.error('Error fetching attendance count:', error);
    }
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) {
      toast.error('Please select an event first');
      playSound('error');
      return;
    }

    if (!barcodeInput || barcodeInput.trim() === '') {
      toast.error('Please scan a barcode');
      playSound('error');
      return;
    }

    setScanning(true);
    setScanStatus({ message: '', type: '', member: null });

    try {
      const response = await scanBarcode({
        barcode: barcodeInput.trim(),
        event_id: selectedEvent.id
      });

      // Success
      setScanStatus({
        message: response.message || '✅ Attendance marked successfully!',
        type: 'success',
        member: response.data?.member
      });
      
      // Add to recent scans
      setRecentScans(prev => [
        {
          barcode: barcodeInput.trim(),
          member: response.data?.member,
          time: new Date().toLocaleTimeString(),
          status: 'success'
        },
        ...prev
      ].slice(0, 20));
      
      // Update attendance count
      setAttendanceCount(prev => prev + 1);
      
      // Play success sound
      playSound('success');
      
      // Clear input and refocus
      setBarcodeInput('');
      barcodeInputRef.current?.focus();

    } catch (error) {
      const errorMsg = error.response?.data?.message || '❌ Failed to mark attendance';
      
      setScanStatus({
        message: errorMsg,
        type: 'error',
        member: null
      });
      
      // Add to recent scans
      setRecentScans(prev => [
        {
          barcode: barcodeInput.trim(),
          member: null,
          time: new Date().toLocaleTimeString(),
          status: 'error'
        },
        ...prev
      ].slice(0, 20));
      
      // Play error sound
      playSound('error');
    } finally {
      setScanning(false);
    }
  };

  const playSound = (type) => {
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'success') {
        oscillator.frequency.value = 880; // A5
        gainNode.gain.value = 0.3;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 150);
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.frequency.value = 1100; // C#6
          gain2.gain.value = 0.3;
          osc2.start();
          setTimeout(() => osc2.stop(), 150);
        }, 200);
      } else {
        oscillator.frequency.value = 440; // A4
        gainNode.gain.value = 0.3;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 300);
      }
    } catch (e) {
      // Silently fail if audio not supported
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBg = (status) => {
    return status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
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
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaBarcode className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">USB Barcode Attendance</h3>
              <p className="text-blue-100 text-sm">Scan member barcodes to mark attendance</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/attendance"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <FaArrowLeft /> View All Attendance
            </Link>
            <button onClick={() => window.print()} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all">
              <FaPrint /> Print
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Scanner Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Event Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2 text-blue-500" />
              Select Event
            </label>
            <select
              value={selectedEvent?.id || ''}
              onChange={(e) => {
                const event = events.find(ev => ev.id === parseInt(e.target.value));
                setSelectedEvent(event);
                setBarcodeInput('');
                setScanStatus({ message: '', type: '', member: null });
                barcodeInputRef.current?.focus();
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="">-- Select Event --</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} ({formatDate(event.date)})
                </option>
              ))}
            </select>
            {selectedEvent && (
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span>📅 {formatDate(selectedEvent.date)}</span>
                <span>📍 {selectedEvent.location || 'No location'}</span>
                <span className="text-green-600 font-medium">✅ {attendanceCount} attendees</span>
              </div>
            )}
          </div>

          {/* Barcode Input */}
          <form onSubmit={handleBarcodeSubmit} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaIdCard className="inline mr-2 text-blue-500" />
              Scan User Barcode
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaBarcode className="text-xl" />
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode here..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-gray-50"
                  autoFocus
                  disabled={!selectedEvent}
                />
              </div>
              <button
                type="submit"
                disabled={scanning || !selectedEvent}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[160px]"
              >
                {scanning ? (
                  <>
                    <FaSpinner className="animate-spin" /> Scanning...
                  </>
                ) : (
                  <>
                    <FaQrcode /> Scan
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Use USB barcode scanner or type the member ID manually, then press Enter
            </p>
          </form>

          {/* Scan Status */}
          {scanStatus.message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-2 ${getStatusBg(scanStatus.type)} mb-4`}
            >
              <div className="flex items-start gap-3">
                {scanStatus.type === 'success' ? (
                  <FaCheckCircle className="text-green-500 text-xl mt-0.5" />
                ) : (
                  <FaTimesCircle className="text-red-500 text-xl mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${scanStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {scanStatus.message}
                  </p>
                  {scanStatus.member && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p><strong>Name:</strong> {scanStatus.member.full_name}</p>
                      <p><strong>Member ID:</strong> {scanStatus.member.member_no || scanStatus.member.member_id}</p>
                      <p><strong>Phone:</strong> {scanStatus.member.phone || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-600 font-medium">Total Events</p>
              <p className="text-2xl font-bold text-blue-800">{events.length}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-green-600 font-medium">This Event</p>
              <p className="text-2xl font-bold text-green-800">{attendanceCount}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-sm text-purple-600 font-medium">Today's Scans</p>
              <p className="text-2xl font-bold text-purple-800">{recentScans.length}</p>
            </div>
          </div>

          {/* Recent Scans */}
          {recentScans.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaClock className="text-blue-500" />
                Recent Scans
              </h4>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentScans.map((scan, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2 font-mono text-xs">{scan.barcode}</td>
                        <td className="px-3 py-2">{scan.member?.full_name || '—'}</td>
                        <td className="px-3 py-2 text-gray-500">{scan.time}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${getStatusColor(scan.status)}`}>
                            {scan.status === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                            {scan.status === 'success' ? 'Success' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
            <FaUserCheck className="text-sm" />
          </div>
          <div>
            <h5 className="font-semibold text-blue-800">How to use USB Barcode Scanner</h5>
            <ol className="text-sm text-blue-700 mt-1 space-y-1 list-decimal list-inside">
              <li>Select an event from the dropdown above</li>
              <li>Connect your USB barcode scanner</li>
              <li>Scan the member's barcode (or type the ID manually)</li>
              <li>Press Enter or click the Scan button</li>
              <li>Success/failure will be shown instantly with sound feedback</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeAttendancePage;
// frontend/src/pages/admin/EventsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaSave,
  FaMapMarkerAlt,
  FaImage,
  FaUsers,
  FaBarcode,
  FaQrcode,
  FaUserCheck,
  FaPrint,
  FaDownload,
  FaEye,
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaIdCard
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../api/eventApi';
import { getAttendanceByEvent, scanBarcode, markAttendance } from '../../api/attendanceApi';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanStatus, setScanStatus] = useState({ message: '', type: '' });
  const barcodeInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    photo: null
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    photo: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const response = await getEvents(params);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (eventId) => {
    try {
      const response = await getAttendanceByEvent(eventId);
      setAttendanceList(response.data?.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      toast.error('Title and date are required');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        photo: formData.photo ? formData.photo.name : null
      };

      const response = await createEvent(data);
      setEvents(prev => [response.data, ...prev]);
      toast.success(response.message || 'Event added successfully!');
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error(error.response?.data?.message || 'Failed to add event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setEditFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      location: event.location || '',
      photo: null
    });
    setEditImagePreview(event.photo ? `/uploads/${event.photo}` : null);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.title || !editFormData.date) {
      toast.error('Title and date are required');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        title: editFormData.title,
        description: editFormData.description,
        date: editFormData.date,
        location: editFormData.location,
        photo: editFormData.photo ? editFormData.photo.name : null
      };

      const response = await updateEvent(selectedEvent.id, data);
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? response.data : e));
      toast.success(response.message || 'Event updated successfully!');
      setIsEditModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) return;
    
    try {
      await deleteEvent(event.id);
      setEvents(prev => prev.filter(e => e.id !== event.id));
      toast.success(`Event "${event.title}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleScanBarcode = async (e) => {
    e.preventDefault();
    if (!selectedEvent) {
      toast.error('Please select an event first');
      return;
    }
    if (!barcodeInput) {
      toast.error('Please scan or enter a barcode');
      return;
    }

    setScanning(true);
    setScanStatus({ message: '', type: '' });

    try {
      const response = await scanBarcode({
        barcode: barcodeInput,
        event_id: selectedEvent.id
      });

      setScanStatus({
        message: response.message || 'Attendance marked successfully!',
        type: 'success'
      });
      
      // Refresh attendance list
      await fetchAttendance(selectedEvent.id);
      setBarcodeInput('');
      barcodeInputRef.current?.focus();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to mark attendance';
      setScanStatus({
        message: errorMsg,
        type: 'error'
      });
    } finally {
      setScanning(false);
    }
  };

  const handleViewAttendance = async (event) => {
    setSelectedEvent(event);
    await fetchAttendance(event.id);
    setIsAttendanceModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', date: '', location: '', photo: null });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetEditForm = () => {
    setEditFormData({ title: '', description: '', date: '', location: '', photo: null });
    setEditImagePreview(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
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

  const getImageUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `/uploads/${photo}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading events...</p>
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
              <FaCalendarAlt className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Manage Events</h3>
              <p className="text-blue-100 text-sm">Total: {events.length} events</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* ✅ View All Attendance Button */}
            <Link
              to="/admin/attendance"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <FaUsers /> View All Attendance
            </Link>
            <Link
            to="/admin/barcode"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
  <FaBarcode /> Scan Barcode
</Link>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              {showAddForm ? <FaTimes /> : <FaPlus />}
              {showAddForm ? 'Cancel' : 'Add Event'}
            </button>
            <button onClick={() => window.print()} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all">
              <FaPrint /> Print
            </button>
          </div>
        </div>
      </motion.div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaPlus className="text-blue-600" /> Add New Event
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaMapMarkerAlt className="inline mr-1" /> Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaImage className="inline mr-1" /> Photo
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="photo"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event description"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { resetForm(); setShowAddForm(false); }} className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50">
                    {submitting ? <><FaSpinner className="animate-spin" /> Adding...</> : <><FaSave /> Add Event</>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <span className="text-sm text-gray-400">{events.length} events</span>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl text-gray-300 mb-4">📅</div>
            <p className="text-gray-500 text-lg font-medium">No events found</p>
            <p className="text-gray-400 text-sm">Click "Add Event" to create your first one</p>
          </div>
        ) : (
          events.map((event) => (
            <motion.div
              key={event.id}
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {event.photo && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={getImageUrl(event.photo)}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => e.target.src = '/assets/images/event-placeholder.jpg'}
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-lg">{event.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <FaCalendarAlt className="text-blue-500" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleViewAttendance(event)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all"
                      title="View Attendance"
                    >
                      <FaUsers className="text-sm" />
                    </button>
                  </div>
                </div>
                {event.description && (
                  <p className="text-gray-600 text-sm mt-3 line-clamp-2">{event.description}</p>
                )}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-all"
                    title="Edit"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                    title="Delete"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleViewAttendance(event)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all ml-auto"
                    title="View Attendance"
                  >
                    <FaUsers className="text-sm" />
                    <span className="text-xs ml-1">Attendance</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-yellow-500" /> Edit Event
              </h4>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedEvent(null); resetEditForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={editFormData.title} onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                  <input type="date" name="date" value={editFormData.date} onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" name="location" value={editFormData.location} onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <input ref={editFileInputRef} type="file" name="photo" onChange={handleEditFileChange} accept="image/*" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              {editImagePreview && (
                <div className="mt-2">
                  <img src={editImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={editFormData.description} onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))} rows="3" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedEvent(null); resetEditForm(); }} className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50">
                  {submitting ? <><FaSpinner className="animate-spin" /> Updating...</> : <><FaCheck /> Update</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FaUsers className="text-green-500" /> Attendance
                </h4>
                <p className="text-sm text-gray-500">{selectedEvent.title} - {formatDate(selectedEvent.date)}</p>
              </div>
              <button onClick={() => { setIsAttendanceModalOpen(false); setSelectedEvent(null); setAttendanceList([]); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Barcode Scanner */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaBarcode className="text-blue-500" /> Scan Barcode
                </h5>
                <form onSubmit={handleScanBarcode} className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      ref={barcodeInputRef}
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Scan or enter member barcode..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={scanning}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {scanning ? <FaSpinner className="animate-spin" /> : <FaQrcode />}
                    Mark Attendance
                  </button>
                </form>
                {scanStatus.message && (
                  <div className={`mt-3 p-3 rounded-xl ${scanStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {scanStatus.message}
                  </div>
                )}
              </div>

              {/* Attendance List */}
              <div>
                <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaUserCheck className="text-green-500" /> Attendance List ({attendanceList.length})
                </h5>
                {attendanceList.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FaUsers className="text-4xl mx-auto mb-2 text-gray-300" />
                    No attendance recorded yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Scanned At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {attendanceList.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-600">{index + 1}</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-800">{record.full_name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{record.phone || '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {new Date(record.scan_time).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
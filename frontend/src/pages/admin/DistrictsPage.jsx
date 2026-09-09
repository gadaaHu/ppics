// frontend/src/pages/admin/DistrictsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCity,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaSave,
  FaBuilding,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaCalendarAlt,
  FaFilter,
  FaDownload,
  FaPrint,
  FaFileExport
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const DistrictsPage = () => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    district_name: '',
    description: ''
  });
  const [editFormData, setEditFormData] = useState({
    district_name: '',
    description: ''
  });

  // Simulated data - In production, fetch from API
  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      // Simulate API call - Replace with actual API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample data - Replace with actual API data
      const sampleData = [
        { district_id: 1, district_name: 'Addis Ababa', description: 'Capital city district', created_at: '2024-01-15' },
        { district_id: 2, district_name: 'Oromia', description: 'Central region of Ethiopia', created_at: '2024-01-20' },
        { district_id: 3, district_name: 'Amhara', description: 'Northern region', created_at: '2024-02-01' },
        { district_id: 4, district_name: 'Tigray', description: 'Northernmost region', created_at: '2024-02-15' },
        { district_id: 5, district_name: 'SNNPR', description: 'Southern Nations', created_at: '2024-03-01' },
      ];
      setDistricts(sampleData);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to load districts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.district_name.trim()) {
      toast.error('District name is required');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call - Replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDistrict = {
        district_id: districts.length + 1,
        district_name: formData.district_name,
        description: formData.description || '',
        created_at: new Date().toISOString()
      };
      
      setDistricts(prev => [newDistrict, ...prev]);
      toast.success(`District "${formData.district_name}" added successfully!`);
      setFormData({ district_name: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding district:', error);
      toast.error('Failed to add district');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (district) => {
    setSelectedDistrict(district);
    setEditFormData({
      district_name: district.district_name,
      description: district.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.district_name.trim()) {
      toast.error('District name is required');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call - Replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDistricts(prev => prev.map(d => 
        d.district_id === selectedDistrict.district_id
          ? { ...d, district_name: editFormData.district_name, description: editFormData.description }
          : d
      ));
      
      toast.success(`District updated successfully!`);
      setIsEditModalOpen(false);
      setSelectedDistrict(null);
    } catch (error) {
      console.error('Error updating district:', error);
      toast.error('Failed to update district');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (district) => {
    if (!window.confirm(`Are you sure you want to delete "${district.district_name}"?`)) return;
    
    try {
      // Simulate API call - Replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDistricts(prev => prev.filter(d => d.district_id !== district.district_id));
      toast.success(`District "${district.district_name}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting district:', error);
      toast.error('Failed to delete district');
    }
  };

  const filteredDistricts = districts.filter(district =>
    district.district_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (district.description && district.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
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
          <p className="mt-4 text-gray-600 font-medium">Loading districts...</p>
          <p className="text-sm text-gray-400">Please wait while we fetch the data</p>
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
        className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaCity className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Manage Districts</h3>
              <p className="text-blue-100 text-sm">Total: {districts.length} districts</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
            >
              {showAddForm ? <FaTimes /> : <FaPlus />}
              {showAddForm ? 'Cancel' : 'Add District'}
            </button>
            <button
              onClick={() => window.print()}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
            >
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
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaPlus className="text-indigo-600" /> Add New District
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district_name"
                      value={formData.district_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter district name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter description (optional)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Adding...
                      </>
                    ) : (
                      <>
                        <FaSave /> Add District
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search districts by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
            >
              <FaTimes /> Clear
            </button>
          )}
          <span className="text-sm text-gray-400">
            {filteredDistricts.length} of {districts.length} districts
          </span>
        </div>
      </div>

      {/* Districts Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaMapMarkerAlt className="inline mr-1" /> District Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaInfoCircle className="inline mr-1" /> Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaCalendarAlt className="inline mr-1" /> Created
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDistricts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="text-6xl text-gray-300 mb-4">🏛️</div>
                    <p className="text-gray-500 text-lg font-medium">No districts found</p>
                    <p className="text-gray-400 text-sm">Click "Add District" to create your first one</p>
                  </td>
                </tr>
              ) : (
                filteredDistricts.map((district, index) => (
                  <motion.tr
                    key={district.district_id}
                    variants={itemVariants}
                    className="hover:bg-indigo-50/30 transition-colors duration-200 group"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                          <FaBuilding className="text-sm" />
                        </div>
                        <span className="font-semibold text-gray-800">{district.district_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      {district.description || <span className="text-gray-400 italic">No description</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(district.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(district)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-all duration-200 hover:scale-110 group-hover:shadow-md"
                          title="Edit"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(district)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-110 group-hover:shadow-md"
                          title="Delete"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Stats */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-sm text-gray-500">
          <div>
            Showing {filteredDistricts.length} of {districts.length} districts
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {districts.length} Active
            </span>
            <button
              onClick={fetchDistricts}
              className="text-indigo-600 hover:text-indigo-700 font-medium transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DistrictsPage;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaSave,
  FaCity,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaCalendarAlt,
  FaFilter,
  FaPrint
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { 
  getCooperatives, 
  createCooperative, 
  updateCooperative, 
  deleteCooperative 
} from '../../api/cooperativeApi';
import { getDistricts } from '../../api/districtApi';

const CooperativesPage = () => {
  const [cooperatives, setCooperatives] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCooperative, setSelectedCooperative] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cooperative_name: '',
    district_id: '',
    description: ''
  });
  const [editFormData, setEditFormData] = useState({
    cooperative_name: '',
    district_id: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCooperatives();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedDistrict]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCooperatives(), fetchDistricts()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCooperatives = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedDistrict) params.district_id = selectedDistrict;
      
      const response = await getCooperatives(params);
      setCooperatives(response.data || []);
    } catch (error) {
      console.error('Error fetching cooperatives:', error);
      toast.error('Failed to load cooperatives');
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await getDistricts();
      setDistricts(response.data || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to load districts');
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
    if (!formData.cooperative_name.trim()) {
      toast.error('Cooperative name is required');
      return;
    }
    if (!formData.district_id) {
      toast.error('Please select a district');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createCooperative(formData);
      setCooperatives(prev => [response.data, ...prev]);
      toast.success(response.message || 'Cooperative added successfully!');
      setFormData({ cooperative_name: '', district_id: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding cooperative:', error);
      toast.error(error.response?.data?.message || 'Failed to add cooperative');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cooperative) => {
    setSelectedCooperative(cooperative);
    setEditFormData({
      cooperative_name: cooperative.cooperative_name,
      district_id: cooperative.district_id,
      description: cooperative.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.cooperative_name.trim()) {
      toast.error('Cooperative name is required');
      return;
    }
    if (!editFormData.district_id) {
      toast.error('Please select a district');
      return;
    }

    setSubmitting(true);
    try {
      const response = await updateCooperative(selectedCooperative.cooperative_id, editFormData);
      setCooperatives(prev => prev.map(c => 
        c.cooperative_id === selectedCooperative.cooperative_id ? response.data : c
      ));
      toast.success(response.message || 'Cooperative updated successfully!');
      setIsEditModalOpen(false);
      setSelectedCooperative(null);
    } catch (error) {
      console.error('Error updating cooperative:', error);
      toast.error(error.response?.data?.message || 'Failed to update cooperative');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cooperative) => {
    if (!window.confirm(`Are you sure you want to delete "${cooperative.cooperative_name}"?`)) return;
    
    try {
      await deleteCooperative(cooperative.cooperative_id);
      setCooperatives(prev => prev.filter(c => c.cooperative_id !== cooperative.cooperative_id));
      toast.success(`Cooperative "${cooperative.cooperative_name}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting cooperative:', error);
      toast.error(error.response?.data?.message || 'Failed to delete cooperative');
    }
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
          <p className="mt-4 text-gray-600 font-medium">Loading cooperatives...</p>
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
              <FaBuilding className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Manage Cooperatives</h3>
              <p className="text-green-100 text-sm">Total: {cooperatives.length} cooperatives</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              {showAddForm ? <FaTimes /> : <FaPlus />}
              {showAddForm ? 'Cancel' : 'Add Cooperative'}
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
                <FaPlus className="text-green-600" /> Add New Cooperative
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cooperative Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cooperative_name"
                      value={formData.cooperative_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter cooperative name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district_id"
                      value={formData.district_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select District</option>
                      {districts.map(d => (
                        <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter description (optional)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50">
                    {submitting ? <><FaSpinner className="animate-spin" /> Adding...</> : <><FaSave /> Add Cooperative</>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cooperatives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[150px]"
          >
            <option value="">All Districts</option>
            {districts.map(d => (
              <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
            ))}
          </select>
          {selectedDistrict && (
            <button onClick={() => setSelectedDistrict('')} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition flex items-center gap-2">
              <FaTimes /> Clear
            </button>
          )}
          <span className="text-sm text-gray-400">{cooperatives.length} cooperatives</span>
        </div>
      </div>

      {/* Cooperatives Table */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaCity className="inline mr-1" /> Cooperative Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaMapMarkerAlt className="inline mr-1" /> District
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaInfoCircle className="inline mr-1" /> Description
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cooperatives.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="text-6xl text-gray-300 mb-4">🏢</div>
                    <p className="text-gray-500 text-lg font-medium">No cooperatives found</p>
                    <p className="text-gray-400 text-sm">Click "Add Cooperative" to create your first one</p>
                  </td>
                </tr>
              ) : (
                cooperatives.map((coop, index) => (
                  <motion.tr key={coop.cooperative_id} variants={itemVariants} className="hover:bg-green-50/30 transition-colors duration-200 group">
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                          <FaBuilding className="text-sm" />
                        </div>
                        <span className="font-semibold text-gray-800">{coop.cooperative_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {coop.district_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      {coop.description || <span className="text-gray-400 italic">No description</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(coop)} className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-all hover:scale-110" title="Edit">
                          <FaEdit className="text-sm" />
                        </button>
                        <button onClick={() => handleDelete(coop)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all hover:scale-110" title="Delete">
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
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-sm text-gray-500">
          <div>Showing {cooperatives.length} cooperatives</div>
          <button onClick={fetchCooperatives} className="text-green-600 hover:text-green-700 font-medium transition">
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedCooperative && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-yellow-500" /> Edit Cooperative
              </h4>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedCooperative(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cooperative Name <span className="text-red-500">*</span></label>
                  <input type="text" name="cooperative_name" value={editFormData.cooperative_name} onChange={handleEditInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
                  <select name="district_id" value={editFormData.district_id} onChange={handleEditInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Select District</option>
                    {districts.map(d => (
                      <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" name="description" value={editFormData.description} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50">
                  {submitting ? <><FaSpinner className="animate-spin" /> Updating...</> : <><FaCheck /> Update</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CooperativesPage;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaSave,
  FaBuilding,
  FaCity,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaUsers,
  FaPrint
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getFamilies, createFamily, updateFamily, deleteFamily } from '../../api/familyApi';
import { getCooperatives } from '../../api/cooperativeApi';
import { getDistricts } from '../../api/districtApi';

const FamiliesPage = () => {
  const [families, setFamilies] = useState([]);
  const [cooperatives, setCooperatives] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCooperative, setSelectedCooperative] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    family_name: '',
    cooperative_id: '',
    description: ''
  });
  const [editFormData, setEditFormData] = useState({
    family_name: '',
    cooperative_id: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFamilies();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCooperative, selectedDistrict]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchFamilies(), fetchCooperatives(), fetchDistricts()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilies = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCooperative) params.cooperative_id = selectedCooperative;
      if (selectedDistrict) params.district_id = selectedDistrict;
      
      const response = await getFamilies(params);
      setFamilies(response.data || []);
    } catch (error) {
      console.error('Error fetching families:', error);
      toast.error('Failed to load families');
    }
  };

  const fetchCooperatives = async () => {
    try {
      const response = await getCooperatives();
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
    if (!formData.family_name.trim()) {
      toast.error('Family name is required');
      return;
    }
    if (!formData.cooperative_id) {
      toast.error('Please select a cooperative');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createFamily(formData);
      setFamilies(prev => [response.data, ...prev]);
      toast.success(response.message || 'Family added successfully!');
      setFormData({ family_name: '', cooperative_id: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding family:', error);
      toast.error(error.response?.data?.message || 'Failed to add family');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (family) => {
    setSelectedFamily(family);
    setEditFormData({
      family_name: family.family_name,
      cooperative_id: family.cooperative_id,
      description: family.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.family_name.trim()) {
      toast.error('Family name is required');
      return;
    }
    if (!editFormData.cooperative_id) {
      toast.error('Please select a cooperative');
      return;
    }

    setSubmitting(true);
    try {
      const response = await updateFamily(selectedFamily.family_id, editFormData);
      setFamilies(prev => prev.map(f => 
        f.family_id === selectedFamily.family_id ? response.data : f
      ));
      toast.success(response.message || 'Family updated successfully!');
      setIsEditModalOpen(false);
      setSelectedFamily(null);
    } catch (error) {
      console.error('Error updating family:', error);
      toast.error(error.response?.data?.message || 'Failed to update family');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (family) => {
    if (!window.confirm(`Are you sure you want to delete "${family.family_name}"?`)) return;
    
    try {
      await deleteFamily(family.family_id);
      setFamilies(prev => prev.filter(f => f.family_id !== family.family_id));
      toast.success(`Family "${family.family_name}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting family:', error);
      toast.error(error.response?.data?.message || 'Failed to delete family');
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
          <p className="mt-4 text-gray-600 font-medium">Loading families...</p>
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
        className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaHome className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Manage Families</h3>
              <p className="text-purple-100 text-sm">Total: {families.length} families</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              {showAddForm ? <FaTimes /> : <FaPlus />}
              {showAddForm ? 'Cancel' : 'Add Family'}
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
                <FaPlus className="text-purple-600" /> Add New Family
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Family Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="family_name"
                      value={formData.family_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter family name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cooperative <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="cooperative_id"
                      value={formData.cooperative_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Cooperative</option>
                      {cooperatives.map(c => (
                        <option key={c.cooperative_id} value={c.cooperative_id}>
                          {c.cooperative_name} — {c.district_name}
                        </option>
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter description (optional)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50">
                    {submitting ? <><FaSpinner className="animate-spin" /> Adding...</> : <><FaSave /> Add Family</>}
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
              placeholder="Search families..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[150px]"
          >
            <option value="">All Districts</option>
            {districts.map(d => (
              <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
            ))}
          </select>
          <select
            value={selectedCooperative}
            onChange={(e) => setSelectedCooperative(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[150px]"
          >
            <option value="">All Cooperatives</option>
            {cooperatives.map(c => (
              <option key={c.cooperative_id} value={c.cooperative_id}>{c.cooperative_name}</option>
            ))}
          </select>
          {selectedCooperative && (
            <button onClick={() => setSelectedCooperative('')} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition flex items-center gap-2">
              <FaTimes /> Clear
            </button>
          )}
          <span className="text-sm text-gray-400">{families.length} families</span>
        </div>
      </div>

      {/* Families Table */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaHome className="inline mr-1" /> Family Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaBuilding className="inline mr-1" /> Cooperative
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaCity className="inline mr-1" /> District
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaInfoCircle className="inline mr-1" /> Description
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {families.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="text-6xl text-gray-300 mb-4">🏠</div>
                    <p className="text-gray-500 text-lg font-medium">No families found</p>
                    <p className="text-gray-400 text-sm">Click "Add Family" to create your first one</p>
                  </td>
                </tr>
              ) : (
                families.map((family, index) => (
                  <motion.tr key={family.family_id} variants={itemVariants} className="hover:bg-purple-50/30 transition-colors duration-200 group">
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                          <FaHome className="text-sm" />
                        </div>
                        <span className="font-semibold text-gray-800">{family.family_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        {family.cooperative_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {family.district_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      {family.description || <span className="text-gray-400 italic">No description</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(family)} className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-all hover:scale-110" title="Edit">
                          <FaEdit className="text-sm" />
                        </button>
                        <button onClick={() => handleDelete(family)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all hover:scale-110" title="Delete">
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
          <div>Showing {families.length} families</div>
          <button onClick={fetchFamilies} className="text-purple-600 hover:text-purple-700 font-medium transition">
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedFamily && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-yellow-500" /> Edit Family
              </h4>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedFamily(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Family Name <span className="text-red-500">*</span></label>
                  <input type="text" name="family_name" value={editFormData.family_name} onChange={handleEditInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cooperative <span className="text-red-500">*</span></label>
                  <select name="cooperative_id" value={editFormData.cooperative_id} onChange={handleEditInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">Select Cooperative</option>
                    {cooperatives.map(c => (
                      <option key={c.cooperative_id} value={c.cooperative_id}>
                        {c.cooperative_name} — {c.district_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" name="description" value={editFormData.description} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50">
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

export default FamiliesPage;
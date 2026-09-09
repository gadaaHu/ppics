import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBriefcase,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaSave,
  FaLayerGroup,
  FaTags,
  FaFilter,
  FaPrint
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getPositions, createPosition, updatePosition, deletePosition } from '../../api/positionApi';

const PositionsPage = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    position_name: '',
    level: '',
    sector: ''
  });
  const [editFormData, setEditFormData] = useState({
    position_name: '',
    level: '',
    sector: ''
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPositions();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterLevel, filterSector]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterLevel) params.level = filterLevel;
      if (filterSector) params.sector = filterSector;
      
      const response = await getPositions(params);
      setPositions(response.data || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Failed to load positions');
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
    if (!formData.position_name.trim()) {
      toast.error('Position name is required');
      return;
    }
    if (!formData.level) {
      toast.error('Level is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createPosition(formData);
      setPositions(prev => [response.data, ...prev]);
      toast.success(response.message || 'Position added successfully!');
      setFormData({ position_name: '', level: '', sector: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error(error.response?.data?.message || 'Failed to add position');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (position) => {
    setSelectedPosition(position);
    setEditFormData({
      position_name: position.position_name,
      level: position.level,
      sector: position.sector || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.position_name.trim()) {
      toast.error('Position name is required');
      return;
    }
    if (!editFormData.level) {
      toast.error('Level is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await updatePosition(selectedPosition.position_id, editFormData);
      setPositions(prev => prev.map(p => 
        p.position_id === selectedPosition.position_id ? response.data : p
      ));
      toast.success(response.message || 'Position updated successfully!');
      setIsEditModalOpen(false);
      setSelectedPosition(null);
    } catch (error) {
      console.error('Error updating position:', error);
      toast.error(error.response?.data?.message || 'Failed to update position');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (position) => {
    if (!window.confirm(`Are you sure you want to delete "${position.position_name}"?`)) return;
    
    try {
      await deletePosition(position.position_id);
      setPositions(prev => prev.filter(p => p.position_id !== position.position_id));
      toast.success(`Position "${position.position_name}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error(error.response?.data?.message || 'Failed to delete position');
    }
  };

  const levelColors = {
    'District': 'bg-blue-100 text-blue-700',
    'Cooperative': 'bg-green-100 text-green-700',
    'Family': 'bg-purple-100 text-purple-700'
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
          <p className="mt-4 text-gray-600 font-medium">Loading positions...</p>
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
        className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaBriefcase className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Manage Positions</h3>
              <p className="text-orange-100 text-sm">Total: {positions.length} positions</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              {showAddForm ? <FaTimes /> : <FaPlus />}
              {showAddForm ? 'Cancel' : 'Add Position'}
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
                <FaPlus className="text-orange-600" /> Add New Position
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="position_name"
                      value={formData.position_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter position name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select Level</option>
                      <option value="District">District</option>
                      <option value="Cooperative">Cooperative</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                    <select
                      name="sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select Sector</option>
                      <option value="Leader">Leader</option>
                      <option value="Vice Leader (Politics)">Vice Leader (Politics)</option>
                      <option value="Structural">Structural</option>
                      <option value="Financial">Financial</option>
                      <option value="Poletics Sector">Poletics Sector</option>
                      <option value="Politics">Politics</option>
                      <option value="Structural Sector">Structural Sector</option>
                      <option value="Financial Sector">Financial Sector</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50">
                    {submitting ? <><FaSpinner className="animate-spin" /> Adding...</> : <><FaSave /> Add Position</>}
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
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[150px]"
          >
            <option value="">All Levels</option>
            <option value="District">District</option>
            <option value="Cooperative">Cooperative</option>
            <option value="Family">Family</option>
          </select>
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[150px]"
          >
            <option value="">All Sectors</option>
            <option value="Leader">Leader</option>
            <option value="Vice Leader (Politics)">Vice Leader (Politics)</option>
            <option value="Structural">Structural</option>
            <option value="Financial">Financial</option>
            <option value="Politics">Politics</option>
            <option value="Member">Member</option>
          </select>
          {(filterLevel || filterSector) && (
            <button onClick={() => { setFilterLevel(''); setFilterSector(''); }} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition flex items-center gap-2">
              <FaTimes /> Clear
            </button>
          )}
          <span className="text-sm text-gray-400">{positions.length} positions</span>
        </div>
      </div>

      {/* Positions Table */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaBriefcase className="inline mr-1" /> Position Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaLayerGroup className="inline mr-1" /> Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <FaTags className="inline mr-1" /> Sector
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="text-6xl text-gray-300 mb-4">👔</div>
                    <p className="text-gray-500 text-lg font-medium">No positions found</p>
                    <p className="text-gray-400 text-sm">Click "Add Position" to create your first one</p>
                  </td>
                </tr>
              ) : (
                positions.map((position, index) => (
                  <motion.tr key={position.position_id} variants={itemVariants} className="hover:bg-orange-50/30 transition-colors duration-200 group">
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                          <FaBriefcase className="text-sm" />
                        </div>
                        <span className="font-semibold text-gray-800">{position.position_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[position.level] || 'bg-gray-100 text-gray-700'}`}>
                        {position.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {position.sector || <span className="text-gray-400 italic">No sector</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(position)} className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-all hover:scale-110" title="Edit">
                          <FaEdit className="text-sm" />
                        </button>
                        <button onClick={() => handleDelete(position)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all hover:scale-110" title="Delete">
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
          <div>Showing {positions.length} positions</div>
          <button onClick={fetchPositions} className="text-orange-600 hover:text-orange-700 font-medium transition">
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedPosition && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-yellow-500" /> Edit Position
              </h4>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedPosition(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position Name <span className="text-red-500">*</span></label>
                  <input type="text" name="position_name" value={editFormData.position_name} onChange={handleEditInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level <span className="text-red-500">*</span></label>
                  <select name="level" value={editFormData.level} onChange={handleEditInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="">Select Level</option>
                    <option value="District">District</option>
                    <option value="Cooperative">Cooperative</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <select name="sector" value={editFormData.sector} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option value="">Select Sector</option>
                  <option value="Leader">Leader</option>
                  <option value="Vice Leader (Politics)">Vice Leader (Politics)</option>
                  <option value="Structural">Structural</option>
                  <option value="Financial">Financial</option>
                  <option value="Politics">Politics</option>
                  <option value="Member">Member</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50">
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

export default PositionsPage;
// frontend/src/pages/admin/PlansPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClipboardList,
  FaPlusCircle,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileExcel,
  FaFileAlt,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaFile,
  FaSave,
  FaFolderOpen,
  FaTrashAlt,
  FaFilter,
  FaSearch,
  FaGlobe,
  FaMap,
  FaBuilding,
  FaUsers,
  FaChevronRight,
  FaTag,
  FaUndo,
  FaEye as FaView,
  FaDownload as FaDownloadIcon
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { 
  getPlans, 
  createPlan, 
  updatePlan, 
  deletePlan, 
  removeAttachment,
  getDocumentTypes,
  getFilterData 
} from '../../api/planApi';

const PlansPage = () => {
  // State
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(true);
  const [showViewTable, setShowViewTable] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [filterData, setFilterData] = useState({
    districts: [],
    cooperatives: [],
    families: []
  });
  const [selectedDocType, setSelectedDocType] = useState('all');
  
  // Filters
  const [filters, setFilters] = useState({
    district_id: '',
    cooperative_id: '',
    family_id: '',
    filter: 'all',
    document_type_id: '',
    search: ''
  });
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    document_type_id: '',
    family_id: '',
    attachment: null
  });
  
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: '',
    title: ''
  });
  
  const fileInputRef = useRef(null);

  // Fetch data on load
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch plans when filters change
  useEffect(() => {
    fetchPlans();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [typesRes, filterRes] = await Promise.all([
        getDocumentTypes(),
        getFilterData()
      ]);
      
      setDocumentTypes(typesRes.data || []);
      setFilterData({
        districts: filterRes.data?.districts || [],
        cooperatives: filterRes.data?.cooperatives || [],
        families: filterRes.data?.families || []
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.district_id) params.district_id = filters.district_id;
      if (filters.cooperative_id) params.cooperative_id = filters.cooperative_id;
      if (filters.family_id) params.family_id = filters.family_id;
      if (filters.filter !== 'all') params.filter = filters.filter;
      if (filters.document_type_id) params.document_type_id = filters.document_type_id;
      if (filters.search) params.search = filters.search;
      
      const response = await getPlans(params);
      setPlans(response.data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchPlans();
  };

  const resetFilters = () => {
    setFilters({
      district_id: '',
      cooperative_id: '',
      family_id: '',
      filter: 'all',
      document_type_id: '',
      search: ''
    });
    setSelectedDocType('all');
  };

  const handleDocTypeFilter = (typeId) => {
    setSelectedDocType(typeId);
    setFilters(prev => ({ ...prev, document_type_id: typeId === 'all' ? '' : typeId }));
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment' && files) {
      setFormData(prev => ({ ...prev, attachment: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      document_type_id: '',
      family_id: '',
      attachment: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        document_type_id: formData.document_type_id,
        family_id: formData.family_id || null,
        attachment: formData.attachment ? formData.attachment.name : null
      };

      await createPlan(data);
      toast.success('Document added successfully!');
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error(error.response?.data?.message || 'Failed to add document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description || '',
      date: plan.date,
      document_type_id: plan.document_type_id || '',
      family_id: plan.family_id || '',
      attachment: null
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        document_type_id: formData.document_type_id,
        family_id: formData.family_id || null,
        attachment: formData.attachment ? formData.attachment.name : null
      };

      await updatePlan(selectedPlan.id, data);
      toast.success('Document updated successfully!');
      setIsEditModalOpen(false);
      fetchPlans();
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error(error.response?.data?.message || 'Failed to update document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deletePlan(id);
      toast.success('Document deleted successfully!');
      fetchPlans();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleRemoveAttachment = async (id) => {
    if (!window.confirm('Are you sure you want to remove the attachment?')) return;

    try {
      await removeAttachment(id);
      toast.success('Attachment removed successfully!');
      fetchPlans();
    } catch (error) {
      console.error('Error removing attachment:', error);
      toast.error('Failed to remove attachment');
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return { icon: FaFile, color: 'text-gray-400' };
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      pdf: { icon: FaFilePdf, color: 'text-red-500' },
      doc: { icon: FaFileWord, color: 'text-blue-500' },
      docx: { icon: FaFileWord, color: 'text-blue-500' },
      txt: { icon: FaFileAlt, color: 'text-gray-500' },
      jpg: { icon: FaFileImage, color: 'text-green-500' },
      jpeg: { icon: FaFileImage, color: 'text-green-500' },
      png: { icon: FaFileImage, color: 'text-green-500' },
      gif: { icon: FaFileImage, color: 'text-green-500' },
      xls: { icon: FaFileExcel, color: 'text-green-600' },
      xlsx: { icon: FaFileExcel, color: 'text-green-600' }
    };
    return icons[ext] || { icon: FaFile, color: 'text-gray-400' };
  };

  const truncateFileName = (filename, maxLength = 20) => {
    if (!filename) return '';
    if (filename.length <= maxLength) return filename;
    const ext = filename.split('.').pop();
    const name = filename.slice(0, maxLength - ext.length - 4);
    return `${name}...${ext}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLevelBadge = (plan) => {
    if (!plan.family_id) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          <FaBuilding className="text-xs" /> Cooperative
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
        <FaUsers className="text-xs" /> {plan.family_name || 'Family'}
      </span>
    );
  };

  const getBreadcrumb = () => {
    const items = [];
    
    // All Documents
    items.push({
      label: 'All Documents',
      icon: FaGlobe,
      active: !filters.district_id && !filters.cooperative_id && !filters.family_id && filters.filter === 'all'
    });

    // District
    if (filters.district_id) {
      const district = filterData.districts.find(d => d.district_id == filters.district_id);
      if (district) {
        items.push({
          label: district.district_name,
          icon: FaMap,
          active: true
        });
      }
    }

    // Cooperative
    if (filters.cooperative_id) {
      const coop = filterData.cooperatives.find(c => c.cooperative_id == filters.cooperative_id);
      if (coop) {
        items.push({
          label: coop.cooperative_name,
          icon: FaBuilding,
          active: true
        });
      }
    }

    // Family
    if (filters.family_id) {
      const family = filterData.families.find(f => f.family_id == filters.family_id);
      if (family) {
        items.push({
          label: family.family_name,
          icon: FaUsers,
          active: true
        });
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumb();

  // Loading state
  if (loading && plans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Blue Theme */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaClipboardList className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Manage Documents</h3>
              <p className="text-blue-100 text-sm">Total: {plans.length} documents</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowAddForm(true);
                setShowViewTable(false);
                resetForm();
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
            >
              <FaPlusCircle /> Add Document
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setShowViewTable(true);
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
            >
              <FaEye /> View Documents
            </button>
          </div>
        </div>
      </div>

      {/* Add Document Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaPlusCircle className="text-blue-600" /> Add New Document
            </h4>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter document title"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="document_type_id"
                    value={formData.document_type_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Document Type</option>
                    {documentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Association Level</label>
                  <select
                    name="family_id"
                    value={formData.family_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Cooperative Level (All Families)</option>
                    {filterData.families.map(family => (
                      <option key={family.family_id} value={family.family_id}>
                        {family.family_name} ({family.cooperative_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter document details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="attachment"
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Allowed: PDF, DOC, TXT, JPG, PNG, Excel files
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Documents Section */}
      {showViewTable && (
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-2">
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <FaChevronRight className="text-gray-300 text-xs" />
                  )}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm ${
                    item.active 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 cursor-pointer'
                  }`}>
                    <item.icon className="text-sm" />
                    {item.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <FaFilter className="text-gray-400" />
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              
              <select
                name="district_id"
                value={filters.district_id}
                onChange={handleFilterChange}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Districts</option>
                {filterData.districts.map(d => (
                  <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                ))}
              </select>

              <select
                name="cooperative_id"
                value={filters.cooperative_id}
                onChange={handleFilterChange}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Cooperatives</option>
                {filterData.cooperatives.map(c => (
                  <option key={c.cooperative_id} value={c.cooperative_id}>{c.cooperative_name}</option>
                ))}
              </select>

              <select
                name="family_id"
                value={filters.family_id}
                onChange={handleFilterChange}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Families</option>
                {filterData.families.map(f => (
                  <option key={f.family_id} value={f.family_id}>
                    {f.family_name} ({f.cooperative_name})
                  </option>
                ))}
              </select>

              <select
                name="filter"
                value={filters.filter}
                onChange={handleFilterChange}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="cooperative">Cooperative Only</option>
              </select>

              <button
                onClick={applyFilters}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1"
              >
                <FaSearch /> Apply
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition flex items-center gap-1"
              >
                <FaUndo /> Reset
              </button>
            </div>
          </div>

          {/* Document Type Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <FaTag className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700 mr-2">Type:</span>
              <button
                onClick={() => handleDocTypeFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedDocType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {documentTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleDocTypeFilter(type.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    selectedDocType === type.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Plans Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {plans.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        <FaFolderOpen className="text-4xl text-gray-300 mx-auto mb-2" />
                        No documents found for the current filter
                      </td>
                    </tr>
                  ) : (
                    plans.map((plan, index) => {
                      const { icon: FileIcon, color: fileColor } = getFileIcon(plan.attachment);
                      const isImage = plan.attachment && ['jpg', 'jpeg', 'png', 'gif'].includes(
                        plan.attachment.split('.').pop().toLowerCase()
                      );

                      return (
                        <tr key={plan.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{plan.title}</div>
                            <div className="mt-1">{getLevelBadge(plan)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {plan.document_type_name || 'Not Specified'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(plan.date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                            <div className="line-clamp-2">
                              {plan.description || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {plan.attachment ? (
                              <div className="flex items-center gap-2">
                                <FileIcon className={`text-lg ${fileColor}`} />
                                <span className="text-sm text-gray-600 truncate max-w-[100px]">
                                  {truncateFileName(plan.attachment)}
                                </span>
                                <div className="flex items-center gap-1">
                                  <a
                                    href={`/uploads/plans/${plan.attachment}`}
                                    download
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Download"
                                  >
                                    <FaDownloadIcon className="text-sm" />
                                  </a>
                                  {isImage && (
                                    <button
                                      onClick={() => setPreviewModal({
                                        isOpen: true,
                                        url: `/uploads/plans/${plan.attachment}`,
                                        title: plan.title
                                      })}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                      title="Preview"
                                    >
                                      <FaView className="text-sm" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleRemoveAttachment(plan.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Remove attachment"
                                  >
                                    <FaTrashAlt className="text-sm" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">No attachment</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(plan)}
                                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(plan.id, plan.title)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-yellow-500" /> Edit Document
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdate} className="space-y-6">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="document_type_id"
                    value={formData.document_type_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Document Type</option>
                    {documentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Change Attachment</label>
                  <input
                    type="file"
                    name="attachment"
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty to keep current file</p>
                  {selectedPlan?.attachment && (
                    <div className="mt-2 text-sm text-gray-600">
                      Current: <span className="font-medium">{selectedPlan.attachment}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Updating...
                      </>
                    ) : (
                      <>
                        <FaCheck /> Update Document
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b">
              <h4 className="font-semibold text-gray-800">{previewModal.title || 'File Preview'}</h4>
              <button
                onClick={() => setPreviewModal({ isOpen: false, url: '', title: '' })}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center min-h-[300px]">
              <img
                src={previewModal.url}
                alt={previewModal.title}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.target.src = '/assets/images/file-placeholder.png';
                }}
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <a
                href={previewModal.url}
                download
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
              >
                <FaDownloadIcon /> Download
              </a>
              <button
                onClick={() => setPreviewModal({ isOpen: false, url: '', title: '' })}
                className="ml-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
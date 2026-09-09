import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  FaFileAlt,
  FaUsers,
  FaBuilding,
  FaCrown,
  FaUser,
  FaPen,
  FaEye,
  FaGavel,
  FaHouseUser,
  FaFolderOpen,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
  FaEdit,
  FaDownload,
  FaPaperclip,
  FaFilter,
  FaSearch,
  FaRedo,
  FaArrowLeft,
  FaArrowRight,
  FaClock,
  FaInfoCircle,
  FaSpinner,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFile,
  FaChevronRight
} from 'react-icons/fa';
import {
  getDocumentTypes,
  getFamilies,
  getCooperativeDocuments,
  getFamilyDocuments,
  addFamilyDocument,
  updateFamilyDocument,
  deleteFamilyDocument,
  addCooperativeDocument,
  updateCooperativeDocument,
  deleteCooperativeDocument
} from '../../api/documentApi';

const FamilyPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [cooperativeDocs, setCooperativeDocs] = useState([]);
  const [familyDocs, setFamilyDocs] = useState([]);
  const [viewLevel, setViewLevel] = useState('cooperative');
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [selectedFamilyName, setSelectedFamilyName] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCoopModal, setShowAddCoopModal] = useState(false);
  const [showEditCoopModal, setShowEditCoopModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editingCoopDoc, setEditingCoopDoc] = useState(null);
  const [familyDocCounts, setFamilyDocCounts] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    document_type_id: '',
    attachment: null
  });
  const [coopFormData, setCoopFormData] = useState({
    title: '',
    description: '',
    date: '',
    document_type_id: '',
    attachment: null
  });

  // User info
  const isLeader = user?.role === 'leader' || user?.role === 'admin';
  const isMember = user?.is_member || user?.role === 'member';
  const memberName = user?.full_name || user?.username || 'Member';
  const cooperativeName = user?.cooperative_name || 'Cooperative';
  const userFamilyId = user?.family_id || null;
  const cooperativeId = user?.cooperative_id || null;

  // Check if user can edit
  const canEdit = isLeader || (isMember && selectedFamilyId === userFamilyId);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const level = params.get('level') || 'cooperative';
    const familyId = params.get('family_id');

    setViewLevel(level);
    if (familyId) {
      setSelectedFamilyId(parseInt(familyId));
    }

    fetchData(level, familyId);
  }, [location.search]);

  const fetchData = async (level, familyId) => {
    try {
      setLoading(true);

      // Get document types
      const typesRes = await getDocumentTypes();
      setDocTypes(typesRes.data || []);

      // Get families - for members, this will only return their family
      const familiesRes = await getFamilies(cooperativeId);
      setFamilies(familiesRes.data || []);

      // If member has only one family (their own), auto-select it
      if (isMember && familiesRes.data && familiesRes.data.length === 1) {
        const memberFamily = familiesRes.data[0];
        setSelectedFamilyId(memberFamily.family_id);
        setSelectedFamilyName(memberFamily.family_name);
        setViewLevel('family');
        
        // Fetch documents for this family
        const docsRes = await getFamilyDocuments(memberFamily.family_id);
        setFamilyDocs(docsRes.data || []);
        setFamilyDocCounts({
          [memberFamily.family_id]: docsRes.data?.length || 0
        });
        setLoading(false);
        return;
      }

      // For leaders, get document counts for all families
      const counts = {};
      if (familiesRes.data && isLeader) {
        for (const family of familiesRes.data) {
          try {
            const docsRes = await getFamilyDocuments(family.family_id);
            counts[family.family_id] = docsRes.data?.length || 0;
          } catch (error) {
            console.error(`Error fetching docs for family ${family.family_id}:`, error);
            counts[family.family_id] = 0;
          }
        }
      }
      setFamilyDocCounts(counts);

      // Get cooperative documents (leaders only)
      if (isLeader && cooperativeId) {
        try {
          const coopDocsRes = await getCooperativeDocuments(cooperativeId);
          setCooperativeDocs(coopDocsRes.data || []);
        } catch (error) {
          console.error('Error fetching cooperative documents:', error);
          setCooperativeDocs([]);
        }
      } else {
        setCooperativeDocs([]);
      }

      // If a specific family is selected, fetch its documents
      if (familyId && level === 'family') {
        try {
          const familyRes = await getFamilyDocuments(familyId);
          setFamilyDocs(familyRes.data || []);
          
          const family = familiesRes.data?.find(f => f.family_id === parseInt(familyId));
          if (family) {
            setSelectedFamilyName(family.family_name);
          }
        } catch (error) {
          console.error('Error fetching family documents:', error);
          setFamilyDocs([]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    try {
      const data = {
        family_id: selectedFamilyId,
        cooperative_id: cooperativeId,
        ...formData
      };
      const response = await addFamilyDocument(data);
      if (response.success) {
        const docsRes = await getFamilyDocuments(selectedFamilyId);
        setFamilyDocs(docsRes.data || []);
        setShowAddModal(false);
        setFormData({
          title: '',
          description: '',
          date: '',
          document_type_id: '',
          attachment: null
        });
        setFamilyDocCounts(prev => ({
          ...prev,
          [selectedFamilyId]: docsRes.data?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error adding document:', error);
      alert(error.response?.data?.message || 'Error adding document');
    }
  };

  const handleUpdateDocument = async (e) => {
    e.preventDefault();
    try {
      const data = {
        id: editingDoc?.id,
        ...formData
      };
      const response = await updateFamilyDocument(data);
      if (response.success) {
        const docsRes = await getFamilyDocuments(selectedFamilyId);
        setFamilyDocs(docsRes.data || []);
        setShowEditModal(false);
        setEditingDoc(null);
        setFormData({
          title: '',
          description: '',
          date: '',
          document_type_id: '',
          attachment: null
        });
      }
    } catch (error) {
      console.error('Error updating document:', error);
      alert(error.response?.data?.message || 'Error updating document');
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      const response = await deleteFamilyDocument(id);
      if (response.success) {
        const docsRes = await getFamilyDocuments(selectedFamilyId);
        setFamilyDocs(docsRes.data || []);
        setFamilyDocCounts(prev => ({
          ...prev,
          [selectedFamilyId]: docsRes.data?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(error.response?.data?.message || 'Error deleting document');
    }
  };

  const handleAddCoopDocument = async (e) => {
    e.preventDefault();
    try {
      const data = {
        cooperative_id: cooperativeId,
        ...coopFormData
      };
      const response = await addCooperativeDocument(data);
      if (response.success) {
        const docsRes = await getCooperativeDocuments(cooperativeId);
        setCooperativeDocs(docsRes.data || []);
        setShowAddCoopModal(false);
        setCoopFormData({
          title: '',
          description: '',
          date: '',
          document_type_id: '',
          attachment: null
        });
      }
    } catch (error) {
      console.error('Error adding cooperative document:', error);
      alert(error.response?.data?.message || 'Error adding cooperative document');
    }
  };

  const handleUpdateCoopDocument = async (e) => {
    e.preventDefault();
    try {
      const data = {
        id: editingCoopDoc?.id,
        ...coopFormData
      };
      const response = await updateCooperativeDocument(data);
      if (response.success) {
        const docsRes = await getCooperativeDocuments(cooperativeId);
        setCooperativeDocs(docsRes.data || []);
        setShowEditCoopModal(false);
        setEditingCoopDoc(null);
        setCoopFormData({
          title: '',
          description: '',
          date: '',
          document_type_id: '',
          attachment: null
        });
      }
    } catch (error) {
      console.error('Error updating cooperative document:', error);
      alert(error.response?.data?.message || 'Error updating cooperative document');
    }
  };

  const handleDeleteCoopDocument = async (id) => {
    if (!window.confirm('Delete this cooperative document?')) return;
    try {
      const response = await deleteCooperativeDocument(id);
      if (response.success) {
        const docsRes = await getCooperativeDocuments(cooperativeId);
        setCooperativeDocs(docsRes.data || []);
      }
    } catch (error) {
      console.error('Error deleting cooperative document:', error);
      alert(error.response?.data?.message || 'Error deleting cooperative document');
    }
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      description: doc.description || '',
      date: doc.date,
      document_type_id: doc.document_type_id,
      attachment: null
    });
    setShowEditModal(true);
  };

  const openEditCoopModal = (doc) => {
    setEditingCoopDoc(doc);
    setCoopFormData({
      title: doc.title,
      description: doc.description || '',
      date: doc.date,
      document_type_id: doc.document_type_id,
      attachment: null
    });
    setShowEditCoopModal(true);
  };

  const getFileIcon = (filename) => {
    if (!filename) return FaFile;
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return FaFilePdf;
    if (['doc', 'docx'].includes(ext)) return FaFileWord;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return FaFileImage;
    return FaFile;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPermissionBadge = () => {
    if (isLeader) {
      return { text: 'Leader Access - Can edit all families & add cooperative documents', icon: FaGavel, color: 'leader' };
    } else if (canEdit) {
      return { text: 'Edit Access - Your family', icon: FaPen, color: 'member' };
    } else {
      return { text: 'Read Only - View only', icon: FaEye, color: 'readonly' };
    }
  };

  const permission = getPermissionBadge();
  const PermissionIcon = permission.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  // If member has no family, show message
  if (isMember && families.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaFolderOpen className="text-gray-400 text-4xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700">No Family Assigned</h3>
        <p className="text-gray-500 mt-2">You don't have a family assigned yet. Please contact your cooperative leader.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${
              isLeader ? 'bg-amber-500' : 'bg-blue-500'
            }`}>
              {isLeader ? <FaCrown /> : <FaUser />}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{memberName}</h4>
              <p className="text-sm text-gray-500">
                <FaBuilding className="inline mr-1" /> {cooperativeName}
                <span className="mx-2">|</span>
                <strong>{isLeader ? 'Cooperative Leader' : 'Family Member'}</strong>
                {!isLeader && selectedFamilyName && (
                  <span className="ml-2 text-blue-600">- {selectedFamilyName}</span>
                )}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            permission.color === 'leader' ? 'bg-amber-50 text-amber-600' :
            permission.color === 'member' ? 'bg-green-50 text-green-600' :
            'bg-gray-50 text-gray-500'
          }`}>
            <PermissionIcon className="inline mr-1" />
            {permission.text}
          </div>
        </div>
      </motion.div>

      {/* Breadcrumb - Only show for leaders or if multiple families */}
      {(isLeader || families.length > 1) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="?level=cooperative"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                viewLevel === 'cooperative'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <FaBuilding /> {cooperativeName}
            </Link>
            
            {viewLevel === 'family' && selectedFamilyId && (
              <>
                <FaChevronRight className="text-gray-300 text-xs" />
                <Link
                  to={`?level=family&family_id=${selectedFamilyId}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-medium"
                >
                  <FaUsers /> {selectedFamilyName}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cooperative Level View - Only for Leaders */}
      {viewLevel === 'cooperative' && isLeader && (
        <>
          {/* Families Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaUsers className="text-blue-500" />
                Families in {cooperativeName}
                <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {families.length} Total
                </span>
              </h4>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {families.map((family) => {
                  const isMyFamily = isMember && family.family_id === userFamilyId;
                  const docCount = familyDocCounts[family.family_id] || 0;
                  
                  return (
                    <Link
                      key={family.family_id}
                      to={`?level=family&family_id=${family.family_id}`}
                      className="group bg-gray-50 rounded-xl p-5 hover:bg-blue-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-blue-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${
                          isLeader ? 'bg-amber-500' :
                          isMyFamily ? 'bg-green-500' :
                          'bg-blue-500'
                        }`}>
                          {isLeader ? <FaCrown /> : isMyFamily ? <FaHouseUser /> : <FaUsers />}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isLeader ? 'bg-amber-100 text-amber-600' :
                          isMyFamily ? 'bg-green-100 text-green-600' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {isLeader ? 'Leader Edit' : isMyFamily ? 'Your Family' : 'Read Only'}
                        </span>
                      </div>
                      <h5 className="text-lg font-semibold text-gray-800 mt-3">{family.family_name}</h5>
                      <p className="text-sm text-gray-500">
                        <FaFileAlt className="inline mr-1" /> {docCount} Documents
                      </p>
                      <div className="mt-3 text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                        Click to view documents <FaArrowRight className="inline ml-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {families.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFolderOpen className="text-gray-400 text-3xl" />
                  </div>
                  <h5 className="text-gray-500 font-medium">No Families Found</h5>
                  <p className="text-gray-400 text-sm">No families registered in this cooperative yet.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Cooperative Documents Section (Leaders Only) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <FaBuilding /> {cooperativeName} - Cooperative Level Documents
                </h4>
                <button
                  onClick={() => setShowAddCoopModal(true)}
                  className="bg-white text-amber-600 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <FaPlus /> Add Cooperative Document
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Filter */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <FaFilter /> Filter:
                </span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="all">All Document Types</option>
                  {docTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setFilterType('all')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
                >
                  <FaRedo /> Reset
                </button>
              </div>

              {/* Documents Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Attachment</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cooperativeDocs
                      .filter(doc => filterType === 'all' || doc.document_type_id === parseInt(filterType))
                      .map((doc, index) => {
                        const FileIcon = getFileIcon(doc.attachment);
                        return (
                          <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-800">{doc.title}</div>
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full inline-block mt-1">
                                <FaBuilding className="inline mr-1 text-xs" /> Cooperative Level
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                                {doc.document_type_name || 'General'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{formatDate(doc.date)}</td>
                            <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                              {doc.description ? doc.description.substring(0, 50) + '...' : '-'}
                            </td>
                            <td className="py-3 px-4">
                              {doc.attachment ? (
                                <a
                                  href={`/uploads/plans/${doc.attachment}`}
                                  download
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <FileIcon /> {doc.attachment.substring(0, 15)}...
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">No file</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditCoopModal(doc)}
                                  className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition-colors"
                                  title="Edit"
                                >
                                  <FaEdit className="text-sm" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoopDocument(doc.id)}
                                  className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors"
                                  title="Delete"
                                >
                                  <FaTrash className="text-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {cooperativeDocs.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaFileAlt className="text-gray-400 text-2xl" />
                  </div>
                  <h5 className="text-gray-500 font-medium">No Cooperative Documents</h5>
                  <p className="text-gray-400 text-sm">Click "Add Cooperative Document" to upload.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Family Level View - For both members and leaders */}
      {viewLevel === 'family' && selectedFamilyId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaFileAlt className="text-blue-500" />
                Family Documents - {selectedFamilyName}
                <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {familyDocs.length} Total
                </span>
              </h4>
              {canEdit && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors ${
                    isLeader ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <FaPlus /> Add Family Document
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            {/* Filter */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <FaFilter /> Filter:
              </span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Document Types</option>
                {docTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <button
                onClick={() => setFilterType('all')}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
              >
                <FaRedo /> Reset
              </button>
            </div>

            {/* Documents Table */}
            {familyDocs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Attachment</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyDocs
                      .filter(doc => filterType === 'all' || doc.document_type_id === parseInt(filterType))
                      .map((doc, index) => {
                        const FileIcon = getFileIcon(doc.attachment);
                        return (
                          <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                            <td className="py-3 px-4 font-medium text-gray-800">{doc.title}</td>
                            <td className="py-3 px-4">
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                                {doc.document_type_name || 'General'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{formatDate(doc.date)}</td>
                            <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                              {doc.description ? doc.description.substring(0, 50) + '...' : '-'}
                            </td>
                            <td className="py-3 px-4">
                              {doc.attachment ? (
                                <a
                                  href={`/uploads/plans/${doc.attachment}`}
                                  download
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <FileIcon /> {doc.attachment.substring(0, 15)}...
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">No file</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {canEdit ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openEditModal(doc)}
                                    className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition-colors"
                                    title="Edit"
                                  >
                                    <FaEdit className="text-sm" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors"
                                    title="Delete"
                                  >
                                    <FaTrash className="text-sm" />
                                  </button>
                                </div>
                              ) : (
                                doc.attachment && (
                                  <a
                                    href={`/uploads/plans/${doc.attachment}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-blue-50 text-blue-500 rounded hover:bg-blue-100 transition-colors inline-block"
                                    title="View"
                                  >
                                    <FaEye className="text-sm" />
                                  </a>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileAlt className="text-gray-400 text-3xl" />
                </div>
                <h5 className="text-gray-500 font-medium">No Documents Yet</h5>
                <p className="text-gray-400 text-sm">
                  {canEdit ? 'Click "Add Family Document" to upload.' : 'No documents for this family.'}
                </p>
                {canEdit && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className={`mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 mx-auto transition-colors ${
                      isLeader ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    <FaPlus /> Add Family Document
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Back to Cooperative Button - Only for leaders or if multiple families */}
      {viewLevel === 'family' && (isLeader || families.length > 1) && (
        <div className="text-center">
          <Link
            to="?level=cooperative"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft /> Back to Cooperative
          </Link>
        </div>
      )}

      {/* Add Family Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h5 className="text-lg font-semibold flex items-center gap-2">
                <FaPlus className="text-blue-500" />
                Add Family Document - {selectedFamilyName}
              </h5>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddDocument} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.document_type_id}
                    onChange={(e) => setFormData({ ...formData, document_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    {docTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachment
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, attachment: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors ${
                    isLeader ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <FaSave /> Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Family Document Modal */}
      {showEditModal && editingDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h5 className="text-lg font-semibold flex items-center gap-2">
                <FaEdit className="text-amber-500" />
                Edit Family Document
              </h5>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateDocument} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.document_type_id}
                    onChange={(e) => setFormData({ ...formData, document_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    {docTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Attachment (optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, attachment: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty to keep current file</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors ${
                    isLeader ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <FaSave /> Update Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Cooperative Document Modal (Leaders Only) */}
      {showAddCoopModal && isLeader && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50">
              <h5 className="text-lg font-semibold flex items-center gap-2 text-amber-700">
                <FaBuilding /> Add Cooperative Level Document - {cooperativeName}
              </h5>
              <button
                onClick={() => setShowAddCoopModal(false)}
                className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-amber-500" />
              </button>
            </div>
            <form onSubmit={handleAddCoopDocument} className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2 text-amber-700 text-sm">
                <FaInfoCircle className="mt-0.5" />
                <span>This document will be available to all families in the cooperative.</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={coopFormData.title}
                    onChange={(e) => setCoopFormData({ ...coopFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={coopFormData.document_type_id}
                    onChange={(e) => setCoopFormData({ ...coopFormData, document_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    {docTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={coopFormData.date}
                    onChange={(e) => setCoopFormData({ ...coopFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachment
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setCoopFormData({ ...coopFormData, attachment: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={coopFormData.description}
                    onChange={(e) => setCoopFormData({ ...coopFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCoopModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaSave /> Save Cooperative Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Cooperative Document Modal (Leaders Only) */}
      {showEditCoopModal && editingCoopDoc && isLeader && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50">
              <h5 className="text-lg font-semibold flex items-center gap-2 text-amber-700">
                <FaEdit /> Edit Cooperative Document
              </h5>
              <button
                onClick={() => setShowEditCoopModal(false)}
                className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-amber-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateCoopDocument} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={coopFormData.title}
                    onChange={(e) => setCoopFormData({ ...coopFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={coopFormData.document_type_id}
                    onChange={(e) => setCoopFormData({ ...coopFormData, document_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    {docTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={coopFormData.date}
                    onChange={(e) => setCoopFormData({ ...coopFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Attachment (optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setCoopFormData({ ...coopFormData, attachment: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty to keep current file</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={coopFormData.description}
                    onChange={(e) => setCoopFormData({ ...coopFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditCoopModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaSave /> Update Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyPlans;
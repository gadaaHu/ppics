import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaFilePdf,
    FaFileVideo,
    FaFileAudio,
    FaSpinner,
    FaSearch,
    FaFilter,
    FaTimes,
    FaSave,
    FaBookOpen,
    FaLanguage,
    FaCheck,
    FaClock,
    FaEyeSlash,
    FaGraduationCap,
    FaUserTie,
    FaEye,
    FaLevelUpAlt,
    FaTag,
    FaVideo,
    FaFile,
    FaToggleOn,
    FaToggleOff
} from 'react-icons/fa';
import {
    getELearningMaterials,
    getELearningMaterialById,
    createELearningMaterial,
    updateELearningMaterial,
    deleteELearningMaterial,
    getELearningCategories
} from '../../api/eLearningApi';

const AdminELearningPage = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [categories, setCategories] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [types, setTypes] = useState([]);
    const [levels, setLevels] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        language: 'am',
        material_type: 'document',
        status: 'draft',
        duration: '',
        level: 'beginner',
        author: '',
        tags: '',
        video_url: '',
        file: null,
        thumbnail: null
    });
    const [filePreview, setFilePreview] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const fileInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    useEffect(() => {
        fetchCategories();
        fetchMaterials();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await getELearningCategories();
            if (response.success) {
                setCategories(response.data.categories || []);
                setLanguages(response.data.languages || []);
                setTypes(response.data.types || []);
                setLevels(response.data.levels || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchMaterials = async (params = {}) => {
        try {
            setLoading(true);
            const response = await getELearningMaterials({
                ...params,
                search: params.search || search,
                category: params.category || selectedCategory,
                language: params.language || selectedLanguage,
                type: params.type || selectedType,
                level: params.level || selectedLevel
            });
            if (response.success) {
                setMaterials(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
            toast.error('Failed to load learning materials');
        } finally {
            setLoading(false);
        }
    };

    // =============================================
    // HANDLE SUBMIT
    // =============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!formData.title || formData.title.trim() === '') {
                toast.error('Title is required');
                setSubmitting(false);
                return;
            }

            if (!formData.file || !(formData.file instanceof File)) {
                toast.error('Please select a file to upload');
                setSubmitting(false);
                return;
            }

            const formDataToSend = new FormData();
            
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('category', formData.category || 'general');
            formDataToSend.append('language', formData.language || 'am');
            formDataToSend.append('material_type', formData.material_type || 'document');
            formDataToSend.append('status', formData.status || 'draft');
            formDataToSend.append('duration', formData.duration || '');
            formDataToSend.append('level', formData.level || 'beginner');
            formDataToSend.append('author', formData.author || '');
            formDataToSend.append('tags', formData.tags || '');
            formDataToSend.append('video_url', formData.video_url || '');

            formDataToSend.append('file', formData.file);

            if (formData.thumbnail && formData.thumbnail instanceof File) {
                formDataToSend.append('thumbnail', formData.thumbnail);
            }

            const response = await createELearningMaterial(formDataToSend);
            if (response.success) {
                toast.success('Learning material added successfully!');
                resetForm();
                setShowAddModal(false);
                fetchMaterials();
            }
        } catch (error) {
            console.error('Error creating material:', error);
            toast.error(error.response?.data?.message || 'Failed to create learning material');
        } finally {
            setSubmitting(false);
        }
    };

    // =============================================
    // HANDLE UPDATE
    // =============================================
    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!formData.title || formData.title.trim() === '') {
                toast.error('Title is required');
                setSubmitting(false);
                return;
            }

            const formDataToSend = new FormData();
            
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('category', formData.category || 'general');
            formDataToSend.append('language', formData.language || 'am');
            formDataToSend.append('material_type', formData.material_type || 'document');
            formDataToSend.append('status', formData.status || 'draft');
            formDataToSend.append('duration', formData.duration || '');
            formDataToSend.append('level', formData.level || 'beginner');
            formDataToSend.append('author', formData.author || '');
            formDataToSend.append('tags', formData.tags || '');
            formDataToSend.append('video_url', formData.video_url || '');

            if (formData.file && formData.file instanceof File) {
                formDataToSend.append('file', formData.file);
            }

            if (formData.thumbnail && formData.thumbnail instanceof File) {
                formDataToSend.append('thumbnail', formData.thumbnail);
            }

            const response = await updateELearningMaterial(selectedMaterial.id, formDataToSend);
            if (response.success) {
                toast.success('Learning material updated successfully!');
                resetForm();
                setShowEditModal(false);
                fetchMaterials();
            }
        } catch (error) {
            console.error('Error updating material:', error);
            toast.error(error.response?.data?.message || 'Failed to update learning material');
        } finally {
            setSubmitting(false);
        }
    };

    // =============================================
    // TOGGLE PUBLISH STATUS
    // =============================================
    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        const confirmMessage = currentStatus === 'published' 
            ? 'Are you sure you want to unpublish this material?'
            : 'Are you sure you want to publish this material?';
        
        if (!window.confirm(confirmMessage)) return;

        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('status', newStatus);
            
            const response = await updateELearningMaterial(id, formData);
            if (response.success) {
                toast.success(`Material ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
                fetchMaterials();
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            const response = await deleteELearningMaterial(id);
            if (response.success) {
                toast.success('Learning material deleted successfully!');
                fetchMaterials();
            }
        } catch (error) {
            console.error('Error deleting material:', error);
            toast.error('Failed to delete learning material');
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await getELearningMaterialById(id);
            if (response.success) {
                setSelectedMaterial(response.data);
                setFormData({
                    title: response.data.title || '',
                    description: response.data.description || '',
                    category: response.data.category || 'general',
                    language: response.data.language || 'am',
                    material_type: response.data.material_type || 'document',
                    status: response.data.status || 'draft',
                    duration: response.data.duration || '',
                    level: response.data.level || 'beginner',
                    author: response.data.author || '',
                    tags: response.data.tags || '',
                    video_url: response.data.video_url || '',
                    file: null,
                    thumbnail: null
                });
                setFilePreview(response.data.file_url || null);
                setThumbnailPreview(response.data.thumbnail_url || null);
                setShowEditModal(true);
            }
        } catch (error) {
            console.error('Error fetching material:', error);
            toast.error('Failed to load learning material');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'general',
            language: 'am',
            material_type: 'document',
            status: 'draft',
            duration: '',
            level: 'beginner',
            author: '',
            tags: '',
            video_url: '',
            file: null,
            thumbnail: null
        });
        setFilePreview(null);
        setThumbnailPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = '';
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file: file });
            const reader = new FileReader();
            reader.onload = (event) => {
                setFilePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, thumbnail: file });
            const reader = new FileReader();
            reader.onload = (event) => {
                setThumbnailPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'published': { color: 'bg-green-100 text-green-600', icon: FaCheck, label: 'Published' },
            'draft': { color: 'bg-yellow-100 text-yellow-600', icon: FaClock, label: 'Draft' },
            'archived': { color: 'bg-gray-100 text-gray-600', icon: FaEyeSlash, label: 'Archived' }
        };
        const statusInfo = statusMap[status] || statusMap['draft'];
        const Icon = statusInfo.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                <Icon className="text-xs" /> {statusInfo.label}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        const icons = {
            'document': FaFile,
            'video': FaVideo,
            'audio': FaFileAudio,
            'pdf': FaFilePdf
        };
        return icons[type] || FaFile;
    };

    const getLanguageLabel = (lang) => {
        const labels = {
            'am': 'አማርኛ',
            'or': 'Afaan Oromoo',
            'ti': 'ትግርኛ',
            'so': 'Af-Soomaali',
            'en': 'English'
        };
        return labels[lang] || lang;
    };

    const getLevelLabel = (level) => {
        const labels = {
            'beginner': 'Beginner',
            'intermediate': 'Intermediate',
            'advanced': 'Advanced',
            'expert': 'Expert'
        };
        return labels[level] || level;
    };

    if (loading && materials.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500">Loading learning materials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <FaGraduationCap className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">E-Learning Management</h3>
                            <p className="text-purple-100 text-sm">Add, edit, and manage learning materials</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
                    >
                        <FaPlus /> Add Learning Material
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by title, author, or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => fetchMaterials({ search })}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                    >
                        Search
                    </button>
                    {(search || selectedCategory || selectedLanguage || selectedType || selectedLevel) && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setSelectedCategory('');
                                setSelectedLanguage('');
                                setSelectedType('');
                                setSelectedLevel('');
                                fetchMaterials({});
                            }}
                            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                        >
                            <FaTimes /> Clear All
                        </button>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap gap-4">
                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <FaFilter className="text-sm" /> Category:
                            </span>
                            <button
                                onClick={() => {
                                    setSelectedCategory('');
                                    fetchMaterials({ category: '' });
                                }}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                    !selectedCategory ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.category}
                                    onClick={() => {
                                        setSelectedCategory(cat.category);
                                        fetchMaterials({ category: cat.category });
                                    }}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        selectedCategory === cat.category 
                                            ? 'bg-purple-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat.category} ({cat.count})
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Type Filter */}
                    {types.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <FaBookOpen className="text-sm" /> Type:
                            </span>
                            <button
                                onClick={() => {
                                    setSelectedType('');
                                    fetchMaterials({ type: '' });
                                }}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                    !selectedType ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {types.map((type) => (
                                <button
                                    key={type.material_type}
                                    onClick={() => {
                                        setSelectedType(type.material_type);
                                        fetchMaterials({ type: type.material_type });
                                    }}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        selectedType === type.material_type 
                                            ? 'bg-purple-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {type.material_type} ({type.count})
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Level Filter */}
                    {levels.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <FaLevelUpAlt className="text-sm" /> Level:
                            </span>
                            <button
                                onClick={() => {
                                    setSelectedLevel('');
                                    fetchMaterials({ level: '' });
                                }}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                    !selectedLevel ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {levels.map((level) => (
                                <button
                                    key={level.level}
                                    onClick={() => {
                                        setSelectedLevel(level.level);
                                        fetchMaterials({ level: level.level });
                                    }}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        selectedLevel === level.level 
                                            ? 'bg-purple-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {getLevelLabel(level.level)} ({level.count})
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Language Filter */}
                    {languages.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <FaLanguage className="text-sm" /> Language:
                            </span>
                            <button
                                onClick={() => {
                                    setSelectedLanguage('');
                                    fetchMaterials({ language: '' });
                                }}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                    !selectedLanguage ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {languages.map((lang) => (
                                <button
                                    key={lang.language}
                                    onClick={() => {
                                        setSelectedLanguage(lang.language);
                                        fetchMaterials({ language: lang.language });
                                    }}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        selectedLanguage === lang.language 
                                            ? 'bg-purple-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {getLanguageLabel(lang.language)} ({lang.count})
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Materials Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {materials.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        <FaGraduationCap className="text-4xl text-gray-300 mx-auto mb-2" />
                                        No learning materials found
                                    </td>
                                </tr>
                            ) : (
                                materials.map((material, index) => {
                                    const TypeIcon = getTypeIcon(material.material_type);
                                    return (
                                        <tr key={material.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <TypeIcon className="text-lg text-purple-500" />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-800">{material.title}</span>
                                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                                            {material.material_type}
                                                            {material.duration && (
                                                                <span className="ml-1">• {material.duration}</span>
                                                            )}
                                                            {material.author && (
                                                                <span className="ml-1">• by {material.author}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                                                    {material.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    material.level === 'beginner' ? 'bg-green-100 text-green-600' :
                                                    material.level === 'intermediate' ? 'bg-blue-100 text-blue-600' :
                                                    material.level === 'advanced' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-purple-100 text-purple-600'
                                                }`}>
                                                    {getLevelLabel(material.level)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {material.views || 0}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(material.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    {material.file_url && (
                                                        <a
                                                            href={material.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                                            title="View"
                                                        >
                                                            <FaEye />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(material.id)}
                                                        className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(material.id, material.status)}
                                                        className={`p-1.5 rounded-lg transition ${
                                                            material.status === 'published' 
                                                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                                                : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                                        }`}
                                                        title={material.status === 'published' ? 'Unpublish' : 'Publish'}
                                                    >
                                                        {material.status === 'published' ? <FaCheck /> : <FaClock />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(material.id, material.title)}
                                                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
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

            {/* ============ ADD MODAL ============ */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaGraduationCap className="text-purple-500" /> Add Learning Material
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter learning material title"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="Enter description"
                                    />
                                </div>

                                {/* Row 1: Category, Language, Type */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="general">General</option>
                                            <option value="constitution">Constitution</option>
                                            <option value="policy">Policy</option>
                                            <option value="training">Training</option>
                                            <option value="guideline">Guideline</option>
                                            <option value="course">Course</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Language
                                        </label>
                                        <select
                                            value={formData.language}
                                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="am">አማርኛ</option>
                                            <option value="or">Afaan Oromoo</option>
                                            <option value="ti">ትግርኛ</option>
                                            <option value="so">Af-Soomaali</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Material Type
                                        </label>
                                        <select
                                            value={formData.material_type}
                                            onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="document">Document</option>
                                            <option value="pdf">PDF</option>
                                            <option value="video">Video</option>
                                            <option value="audio">Audio</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 2: Level, Duration, Author */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Level
                                        </label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duration
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 30 min, 2 hours"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Author
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Author name"
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Tags, Video URL */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tags
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., leadership, management"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Video URL (for video type)
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={formData.video_url}
                                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Row 4: Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>

                                {/* File Uploads */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            File <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            required
                                            accept=".pdf,.doc,.docx,.mp4,.mp3,.avi,.mov,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Thumbnail (Optional)
                                        </label>
                                        <input
                                            ref={thumbnailInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* File Previews */}
                                {filePreview && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">File Preview:</p>
                                        {formData.file && formData.file.type && formData.file.type.startsWith('image/') ? (
                                            <img src={filePreview} alt="Preview" className="max-h-48 rounded-lg border" />
                                        ) : formData.file && formData.file.type === 'application/pdf' ? (
                                            <embed src={filePreview} type="application/pdf" className="w-full h-64 rounded-lg border" />
                                        ) : (
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                <FaFilePdf className="text-red-500 text-2xl" />
                                                <span className="text-sm text-gray-600">{formData.file?.name}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {thumbnailPreview && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">Thumbnail Preview:</p>
                                        <img src={thumbnailPreview} alt="Thumbnail" className="max-h-32 rounded-lg border" />
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <FaSpinner className="animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave /> Save Material
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============ EDIT MODAL ============ */}
            {showEditModal && selectedMaterial && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaEdit className="text-yellow-500" /> Edit Learning Material
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6">
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows="3"
                                    />
                                </div>

                                {/* Row 1 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="general">General</option>
                                            <option value="constitution">Constitution</option>
                                            <option value="policy">Policy</option>
                                            <option value="training">Training</option>
                                            <option value="guideline">Guideline</option>
                                            <option value="course">Course</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Language
                                        </label>
                                        <select
                                            value={formData.language}
                                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="am">አማርኛ</option>
                                            <option value="or">Afaan Oromoo</option>
                                            <option value="ti">ትግርኛ</option>
                                            <option value="so">Af-Soomaali</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Material Type
                                        </label>
                                        <select
                                            value={formData.material_type}
                                            onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="document">Document</option>
                                            <option value="pdf">PDF</option>
                                            <option value="video">Video</option>
                                            <option value="audio">Audio</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Level
                                        </label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duration
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 30 min, 2 hours"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Author
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Author name"
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tags
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., leadership, management"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Video URL
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={formData.video_url}
                                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>

                                {/* File Uploads */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            File (optional)
                                        </label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.doc,.docx,.mp4,.mp3,.avi,.mov,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Leave empty to keep current file</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Thumbnail (optional)
                                        </label>
                                        <input
                                            ref={thumbnailInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Previews */}
                                {filePreview && formData.file && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">New File Preview:</p>
                                        {formData.file.type && formData.file.type.startsWith('image/') ? (
                                            <img src={filePreview} alt="Preview" className="max-h-48 rounded-lg border" />
                                        ) : formData.file.type === 'application/pdf' ? (
                                            <embed src={filePreview} type="application/pdf" className="w-full h-64 rounded-lg border" />
                                        ) : (
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                                <FaFilePdf className="text-red-500 text-2xl" />
                                                <span className="text-sm text-gray-600">{formData.file?.name}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {selectedMaterial.file_url && !formData.file && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">Current File:</p>
                                        <a
                                            href={selectedMaterial.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
                                        >
                                            <FaFilePdf /> {selectedMaterial.file_path}
                                        </a>
                                    </div>
                                )}
                                {thumbnailPreview && formData.thumbnail && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">New Thumbnail Preview:</p>
                                        <img src={thumbnailPreview} alt="Thumbnail" className="max-h-32 rounded-lg border" />
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <FaSpinner className="animate-spin" /> Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave /> Update Material
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminELearningPage;
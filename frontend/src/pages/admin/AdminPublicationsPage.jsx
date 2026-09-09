import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaFilePdf,
    FaDownload,
    FaEye,
    FaSpinner,
    FaSearch,
    FaFilter,
    FaTimes,
    FaSave,
    FaBookOpen,
    FaLanguage,
    FaCheck,
    FaClock,
    FaEyeSlash
} from 'react-icons/fa';
import {
    getPublications,
    getPublicationById,
    createPublication,
    updatePublication,
    deletePublication,
    getPublicationCategories
} from '../../api/publicationApi';

const AdminPublicationsPage = () => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [categories, setCategories] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPub, setSelectedPub] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        language: 'am',
        status: 'draft',
        file: null
    });
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchCategories();
        fetchPublications();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await getPublicationCategories();
            if (response.success) {
                setCategories(response.data.categories || []);
                setLanguages(response.data.languages || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchPublications = async (params = {}) => {
        try {
            setLoading(true);
            const response = await getPublications({
                ...params,
                search: params.search || search,
                category: params.category || selectedCategory,
                language: params.language || selectedLanguage
            });
            if (response.success) {
                setPublications(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching publications:', error);
            toast.error('Failed to load publications');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await createPublication(formDataToSend);
            if (response.success) {
                toast.success('Publication added successfully!');
                resetForm();
                setShowAddModal(false);
                fetchPublications();
            }
        } catch (error) {
            console.error('Error creating publication:', error);
            toast.error(error.response?.data?.message || 'Failed to create publication');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await updatePublication(selectedPub.id, formDataToSend);
            if (response.success) {
                toast.success('Publication updated successfully!');
                resetForm();
                setShowEditModal(false);
                fetchPublications();
            }
        } catch (error) {
            console.error('Error updating publication:', error);
            toast.error(error.response?.data?.message || 'Failed to update publication');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            const response = await deletePublication(id);
            if (response.success) {
                toast.success('Publication deleted successfully!');
                fetchPublications();
            }
        } catch (error) {
            console.error('Error deleting publication:', error);
            toast.error('Failed to delete publication');
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await getPublicationById(id);
            if (response.success) {
                setSelectedPub(response.data);
                setFormData({
                    title: response.data.title || '',
                    description: response.data.description || '',
                    category: response.data.category || 'general',
                    language: response.data.language || 'am',
                    status: response.data.status || 'draft',
                    file: null
                });
                setFilePreview(response.data.file_url || null);
                setShowEditModal(true);
            }
        } catch (error) {
            console.error('Error fetching publication:', error);
            toast.error('Failed to load publication');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'general',
            language: 'am',
            status: 'draft',
            file: null
        });
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file });
            const reader = new FileReader();
            reader.onload = (event) => {
                setFilePreview(event.target.result);
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

    if (loading && publications.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500">Loading publications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <FaBookOpen className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Manage Publications</h3>
                            <p className="text-blue-100 text-sm">Add, edit, and manage all publications</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
                    >
                        <FaPlus /> Add Publication
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
                                placeholder="Search publications..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => fetchPublications({ search })}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                        Search
                    </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-4">
                    {categories.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <FaFilter className="text-sm" /> Category:
                            </span>
                            <button
                                onClick={() => {
                                    setSelectedCategory('');
                                    fetchPublications({ category: '' });
                                }}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                    !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.category}
                                    onClick={() => {
                                        setSelectedCategory(cat.category);
                                        fetchPublications({ category: cat.category });
                                    }}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        selectedCategory === cat.category 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat.category} ({cat.count})
                                </button>
                            ))}
                        </div>
                    )}

                    {languages.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <FaLanguage className="text-sm" /> Language:
                            </span>
                            <button
                                onClick={() => {
                                    setSelectedLanguage('');
                                    fetchPublications({ language: '' });
                                }}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                    !selectedLanguage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {languages.map((lang) => (
                                <button
                                    key={lang.language}
                                    onClick={() => {
                                        setSelectedLanguage(lang.language);
                                        fetchPublications({ language: lang.language });
                                    }}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        selectedLanguage === lang.language 
                                            ? 'bg-blue-600 text-white' 
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

            {/* Publications Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {publications.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        <FaBookOpen className="text-4xl text-gray-300 mx-auto mb-2" />
                                        No publications found
                                    </td>
                                </tr>
                            ) : (
                                publications.map((pub, index) => (
                                    <tr key={pub.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FaFilePdf className="text-red-500" />
                                                <span className="text-sm font-medium text-gray-800">{pub.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                                                {pub.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {getLanguageLabel(pub.language)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(pub.status)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {pub.formatted_date || new Date(pub.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {pub.file_url && (
                                                    <a
                                                        href={pub.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(pub.id)}
                                                    className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pub.id, pub.title)}
                                                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modals - Simplified for brevity, but you can add them */}
        </div>
    );
};

export default AdminPublicationsPage;
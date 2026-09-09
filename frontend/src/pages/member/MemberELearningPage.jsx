import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaGraduationCap,
    FaBookOpen,
    FaFilePdf,
    FaFileVideo,
    FaFileAudio,
    FaDownload,
    FaEye,
    FaSpinner,
    FaSearch,
    FaFilter,
    FaTimes,
    FaUserTie,
    FaClock,
    FaLevelUpAlt,
    FaLanguage,
    FaTag,
    FaPlay,
    FaUser,
    FaCalendarAlt,
    FaEye as FaView,
    FaTimesCircle
} from 'react-icons/fa';
import { getELearningMaterials, getELearningCategories } from '../../api/eLearningApi';
import { useAuth } from '../../context/AuthContext';

// Helper function to get file URL
const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    if (filePath.startsWith('/uploads')) {
        return `${import.meta.env.VITE_API_URL || 'http://ppics.mecrvs.gov.et:5001'}${filePath}`;
    }
    return `${import.meta.env.VITE_API_URL || 'http://ppics.mecrvs.gov.et:5001'}/uploads/e-learning/${filePath}`;
};

const MemberELearningPage = () => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [categories, setCategories] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [types, setTypes] = useState([]);
    const [levels, setLevels] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showViewer, setShowViewer] = useState(false);

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
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            'document': FaFilePdf,
            'video': FaFileVideo,
            'audio': FaFileAudio,
            'pdf': FaFilePdf
        };
        return icons[type] || FaFilePdf;
    };

    const getTypeColor = (type) => {
        const colors = {
            'document': 'text-blue-500 bg-blue-50 border-blue-200',
            'video': 'text-red-500 bg-red-50 border-red-200',
            'audio': 'text-green-500 bg-green-50 border-green-200',
            'pdf': 'text-red-600 bg-red-50 border-red-200'
        };
        return colors[type] || 'text-gray-500 bg-gray-50 border-gray-200';
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

    const getLevelColor = (level) => {
        const colors = {
            'beginner': 'bg-green-100 text-green-600',
            'intermediate': 'bg-blue-100 text-blue-600',
            'advanced': 'bg-orange-100 text-orange-600',
            'expert': 'bg-purple-100 text-purple-600'
        };
        return colors[level] || 'bg-gray-100 text-gray-600';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ✅ Open file in the same page viewer
    const handleViewDocument = (material) => {
        setSelectedMaterial(material);
        setShowViewer(true);
        // Prevent body scroll when viewer is open
        document.body.style.overflow = 'hidden';
    };

    // ✅ Close the viewer
    const closeViewer = () => {
        setShowViewer(false);
        setSelectedMaterial(null);
        document.body.style.overflow = 'auto';
    };

    // Get the file URL for viewing
    const getFileUrlForView = (material) => {
        if (material.file_url) return material.file_url;
        return getFileUrl(material.file_path);
    };

    // Determine if file is a PDF
    const isPdf = (material) => {
        const url = getFileUrlForView(material);
        if (!url) return false;
        return url.toLowerCase().endsWith('.pdf');
    };

    // Determine if file is an image
    const isImage = (material) => {
        const url = getFileUrlForView(material);
        if (!url) return false;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

    // Determine if file is a video
    const isVideo = (material) => {
        const url = getFileUrlForView(material);
        if (!url) return false;
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
        return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

    if (loading && materials.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500">Loading learning materials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                                <FaGraduationCap className="text-purple-600" />
                                E-Learning
                            </h1>
                            <p className="text-gray-500 mt-2">Access learning materials, courses, and resources</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                                {materials.length} materials available
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8"
                >
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
                </motion.div>

                {/* Materials Grid */}
                {materials.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <FaBookOpen className="text-gray-300 text-5xl mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600">No Learning Materials Found</h3>
                        <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map((material) => {
                            const TypeIcon = getTypeIcon(material.material_type);
                            const typeColor = getTypeColor(material.material_type);
                            const fileUrl = material.file_url || getFileUrl(material.file_path);
                            
                            return (
                                <motion.div
                                    key={material.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100 group"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative h-48 bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                                        {material.thumbnail_url ? (
                                            <img 
                                                src={material.thumbnail_url} 
                                                alt={material.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <TypeIcon className="text-6xl text-purple-400" />
                                                <p className="text-sm text-gray-400 mt-2">{material.material_type}</p>
                                            </div>
                                        )}
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <button 
                                                onClick={() => handleViewDocument(material)}
                                                className="bg-white text-purple-600 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-purple-50 transition-colors"
                                            >
                                                <FaPlay /> Start Learning
                                            </button>
                                        </div>
                                        {/* Badges */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColor}`}>
                                                {material.material_type}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                                                {getLanguageLabel(material.language)}
                                            </span>
                                            {material.level && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(material.level)} backdrop-blur-sm`}>
                                                    {getLevelLabel(material.level)}
                                                </span>
                                            )}
                                        </div>
                                        {material.duration && (
                                            <div className="absolute bottom-3 right-3">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm flex items-center gap-1">
                                                    <FaClock className="text-xs" /> {material.duration}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1">
                                                {material.title}
                                            </h4>
                                            <span className="text-xs text-gray-400 flex items-center gap-1 ml-2 whitespace-nowrap">
                                                <FaView className="text-xs" /> {material.views || 0}
                                            </span>
                                        </div>
                                        
                                        {material.description && (
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {material.description}
                                            </p>
                                        )}
                                        
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            {material.author && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                                                    <FaUserTie className="text-xs" /> {material.author}
                                                </span>
                                            )}
                                            {material.tags && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                                                    <FaTag className="text-xs" /> {material.tags}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                            <span>📅 {formatDate(material.created_at)}</span>
                                            {material.uploaded_by_name && (
                                                <span>• 👤 {material.uploaded_by_name}</span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewDocument(material)}
                                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                <FaEye /> View
                                            </button>
                                            {fileUrl && (
                                                <a
                                                    href={fileUrl}
                                                    download
                                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <FaDownload /> Download
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>© 2026 ICS E-Learning Platform - All Rights Reserved</p>
                </footer>
            </div>

            {/* ============================================= */}
            {/* ✅ IN-PAGE DOCUMENT VIEWER MODAL */}
            {/* ============================================= */}
            {showViewer && selectedMaterial && (
                <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col">
                    {/* Viewer Header */}
                    <div className="bg-gray-900 text-white p-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <FaBookOpen className="text-purple-400" />
                            <div>
                                <h3 className="font-semibold text-lg">{selectedMaterial.title}</h3>
                                <p className="text-xs text-gray-400">
                                    {selectedMaterial.material_type} • {getLanguageLabel(selectedMaterial.language)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Download button in viewer */}
                            <a
                                href={getFileUrlForView(selectedMaterial)}
                                download
                                className="text-white/70 hover:text-white transition-colors p-2"
                                title="Download"
                            >
                                <FaDownload className="text-xl" />
                            </a>
                            <button
                                onClick={closeViewer}
                                className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                title="Close"
                            >
                                <FaTimesCircle className="text-2xl" />
                            </button>
                        </div>
                    </div>

                    {/* Viewer Content */}
                    <div className="flex-1 overflow-auto bg-gray-800 p-4 flex items-start justify-center">
                        {isPdf(selectedMaterial) && (
                            <div className="w-full max-w-6xl h-full bg-white rounded-lg overflow-hidden">
                                <iframe
                                    src={`${getFileUrlForView(selectedMaterial)}#toolbar=1&navpanes=1&scrollbar=1`}
                                    className="w-full h-full border-0"
                                    title={selectedMaterial.title}
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {isImage(selectedMaterial) && (
                            <div className="flex items-center justify-center w-full h-full">
                                <img
                                    src={getFileUrlForView(selectedMaterial)}
                                    alt={selectedMaterial.title}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                />
                            </div>
                        )}

                        {isVideo(selectedMaterial) && (
                            <div className="w-full max-w-6xl bg-black rounded-lg overflow-hidden">
                                <video
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                    style={{ maxHeight: '80vh' }}
                                >
                                    <source src={getFileUrlForView(selectedMaterial)} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}

                        {!isPdf(selectedMaterial) && !isImage(selectedMaterial) && !isVideo(selectedMaterial) && (
                            <div className="bg-white rounded-lg p-8 max-w-4xl w-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaFilePdf className="text-6xl text-red-500" />
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-800">{selectedMaterial.title}</h4>
                                        <p className="text-gray-500">File type: {selectedMaterial.material_type}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <a
                                        href={getFileUrlForView(selectedMaterial)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                                    >
                                        <FaEye /> Open in New Tab
                                    </a>
                                    <a
                                        href={getFileUrlForView(selectedMaterial)}
                                        download
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                                    >
                                        <FaDownload /> Download
                                    </a>
                                </div>
                                <p className="text-gray-500 text-sm mt-4">
                                    This file type cannot be previewed in the browser. Please download or open in a new tab.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberELearningPage;
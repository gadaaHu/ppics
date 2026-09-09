import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaFilePdf,
    FaDownload,
    FaSearch,
    FaFilter,
    FaTimes,
    FaSpinner,
    FaBookOpen,
    FaLanguage,
    FaEye
} from 'react-icons/fa';
import { getPublications, getPublicationCategories } from '../../api/publicationApi';

const PublicationsPage = () => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [categories, setCategories] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [selectedPub, setSelectedPub] = useState(null);

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
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPublications({ search });
    };

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category === selectedCategory ? '' : category);
        fetchPublications({ category: category === selectedCategory ? '' : category, search });
    };

    const handleLanguageFilter = (language) => {
        setSelectedLanguage(language === selectedLanguage ? '' : language);
        fetchPublications({ language: language === selectedLanguage ? '' : language, search });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedLanguage('');
        fetchPublications({});
    };

    const getFileUrl = (filePath) => {
        if (!filePath) return '#';
        return `/uploads/publications/${filePath}`;
    };

    const getPreviewUrl = (filePath) => {
        if (!filePath) return '#';
        return `/uploads/publications/${filePath}#toolbar=0`;
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    if (loading && publications.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500">Loading publications...</p>
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
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                        <FaBookOpen className="text-blue-600" />
                        Publications
                    </h1>
                    <p className="text-gray-500 mt-2">Browse and download official publications and documents</p>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8"
                >
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
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
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Search
                        </button>
                        {(search || selectedCategory || selectedLanguage) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                                <FaTimes /> Clear Filters
                            </button>
                        )}
                    </form>

                    {/* Category Filters */}
                    {categories.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <FaFilter className="text-sm" /> Category:
                            </span>
                            <button
                                onClick={() => handleCategoryFilter('')}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                    !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.category}
                                    onClick={() => handleCategoryFilter(cat.category)}
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

                    {/* Language Filters */}
                    {languages.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <FaLanguage className="text-sm" /> Language:
                            </span>
                            <button
                                onClick={() => handleLanguageFilter('')}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                    !selectedLanguage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {languages.map((lang) => (
                                <button
                                    key={lang.language}
                                    onClick={() => handleLanguageFilter(lang.language)}
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
                </motion.div>

                {/* Publications Grid */}
                {publications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <FaBookOpen className="text-gray-300 text-5xl mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600">No Publications Found</h3>
                        <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {publications.map((pub) => (
                            <motion.div
                                key={pub.id}
                                variants={cardVariants}
                                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100"
                            >
                                {/* PDF Preview */}
                                <div className="h-56 bg-gray-100 relative overflow-hidden">
                                    {pub.file_path && pub.file_path.endsWith('.pdf') ? (
                                        <iframe
                                            src={getPreviewUrl(pub.file_path)}
                                            className="w-full h-full border-0"
                                            title={pub.title}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                                            <FaFilePdf className="text-6xl text-blue-500" />
                                        </div>
                                    )}
                                    {/* Language Badge */}
                                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                                        {getLanguageLabel(pub.language)}
                                    </div>
                                    {/* Category Badge */}
                                    <div className="absolute bottom-3 left-3 bg-blue-600/90 text-white text-xs px-3 py-1 rounded-full">
                                        {pub.category}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                                        {pub.title}
                                    </h4>
                                    {pub.description && (
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {pub.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                        <span>📅 {pub.formatted_date || new Date(pub.created_at).toLocaleDateString()}</span>
                                        {pub.uploaded_by_name && (
                                            <span>• 👤 {pub.uploaded_by_name}</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={getFileUrl(pub.file_path)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <FaEye /> View
                                        </a>
                                        <a
                                            href={getFileUrl(pub.file_path)}
                                            download
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <FaDownload /> Download
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Footer */}
                <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>© 2026 ICS Digital Transformation - All Rights Reserved</p>
                </footer>
            </div>
        </div>
    );
};

export default PublicationsPage;
// frontend/src/pages/admin/NewsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaNewspaper,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaSave,
  FaImage,
  FaCalendarAlt,
  FaPrint,
  FaEye,
  FaClock,
  FaFileAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getNews, createNews, updateNews, deleteNews } from '../../api/newsApi';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  
  const [formData, setFormData] = useState({
    news_title: '',
    news_des: '',
    newsdate: '',
    news_image: null
  });
  const [editFormData, setEditFormData] = useState({
    news_title: '',
    news_des: '',
    newsdate: '',
    news_image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchNews();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchNews = async (page = 1) => {
    try {
      setLoading(true);
      const params = { 
        limit: pagination.limit, 
        page: page 
      };
      if (searchTerm) params.search = searchTerm;
      
      const response = await getNews(params);
      setNews(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, news_image: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData(prev => ({ ...prev, news_image: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.news_title || !formData.news_des || !formData.newsdate) {
      toast.error('Title, description and date are required');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('news_title', formData.news_title);
      data.append('news_des', formData.news_des);
      data.append('newsdate', formData.newsdate);
      if (formData.news_image) {
        data.append('news_image', formData.news_image);
      }

      const response = await createNews(data);
      setNews(prev => [response.data, ...prev]);
      toast.success(response.message || 'News added successfully!');
      resetForm();
      setShowAddForm(false);
      fetchNews();
    } catch (error) {
      console.error('Error adding news:', error);
      toast.error(error.response?.data?.message || 'Failed to add news');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (newsItem) => {
    setSelectedNews(newsItem);
    const formattedDate = newsItem.newsdate ? new Date(newsItem.newsdate).toISOString().split('T')[0] : '';
    setEditFormData({
      news_title: newsItem.news_title,
      news_des: newsItem.news_des || '',
      newsdate: formattedDate,
      news_image: null
    });
    setEditImagePreview(newsItem.news_image ? `/uploads/${newsItem.news_image}` : null);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.news_title || !editFormData.news_des || !editFormData.newsdate) {
      toast.error('Title, description and date are required');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('news_title', editFormData.news_title);
      data.append('news_des', editFormData.news_des);
      data.append('newsdate', editFormData.newsdate);
      if (editFormData.news_image) {
        data.append('news_image', editFormData.news_image);
      }

      const response = await updateNews(selectedNews.id, data);
      setNews(prev => prev.map(n => n.id === selectedNews.id ? response.data : n));
      toast.success(response.message || 'News updated successfully!');
      setIsEditModalOpen(false);
      setSelectedNews(null);
      fetchNews();
    } catch (error) {
      console.error('Error updating news:', error);
      toast.error(error.response?.data?.message || 'Failed to update news');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (newsItem) => {
    if (!window.confirm(`Are you sure you want to delete "${newsItem.news_title}"?`)) return;
    
    try {
      await deleteNews(newsItem.id);
      setNews(prev => prev.filter(n => n.id !== newsItem.id));
      toast.success(`News "${newsItem.news_title}" deleted successfully!`);
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error(error.response?.data?.message || 'Failed to delete news');
    }
  };

  const resetForm = () => {
    setFormData({ news_title: '', news_des: '', newsdate: '', news_image: null });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetEditForm = () => {
    setEditFormData({ news_title: '', news_des: '', newsdate: '', news_image: null });
    setEditImagePreview(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `/uploads/${image}`;
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
          <p className="mt-4 text-gray-600 font-medium">Loading news...</p>
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
              <FaNewspaper className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Manage News</h3>
              <p className="text-purple-100 text-sm">Total: {pagination.total} news articles</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              {showAddForm ? <FaTimes /> : <FaPlus />}
              {showAddForm ? 'Cancel' : 'Add News'}
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
                <FaPlus className="text-purple-600" /> Add New News
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      News Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="news_title"
                      value={formData.news_title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter news title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      News Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="newsdate"
                      value={formData.newsdate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaImage className="inline mr-1" /> News Image
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="news_image"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    News Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="news_des"
                    value={formData.news_des}
                    onChange={handleInputChange}
                    rows="5"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter news description"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { resetForm(); setShowAddForm(false); }} className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50">
                    {submitting ? <><FaSpinner className="animate-spin" /> Adding...</> : <><FaSave /> Add News</>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <span className="text-sm text-gray-400">{pagination.total} articles</span>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl text-gray-300 mb-4">📰</div>
            <p className="text-gray-500 text-lg font-medium">No news found</p>
            <p className="text-gray-400 text-sm">Click "Add News" to create your first article</p>
          </div>
        ) : (
          news.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {item.news_image && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={getImageUrl(item.news_image)}
                    alt={item.news_title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => e.target.src = '/assets/images/news-placeholder.jpg'}
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-lg line-clamp-2">{item.news_title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <FaCalendarAlt className="text-purple-500" />
                      <span>{formatDate(item.newsdate)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                  {truncateText(item.news_des, 120)}
                </p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-all"
                    title="Edit"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                    title="Delete"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                  <button
                    onClick={() => window.open(`/news/${item.id}`, '_blank')}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all ml-auto"
                    title="View"
                  >
                    <FaEye className="text-sm" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchNews(page)}
              className={`px-4 py-2 rounded-lg transition ${
                page === pagination.page
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedNews && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-yellow-500" /> Edit News
              </h4>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedNews(null); resetEditForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">News Title <span className="text-red-500">*</span></label>
                  <input type="text" name="news_title" value={editFormData.news_title} onChange={(e) => setEditFormData(prev => ({ ...prev, news_title: e.target.value }))} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">News Date <span className="text-red-500">*</span></label>
                  <input type="date" name="newsdate" value={editFormData.newsdate} onChange={(e) => setEditFormData(prev => ({ ...prev, newsdate: e.target.value }))} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Change Image</label>
                <input ref={editFileInputRef} type="file" name="news_image" onChange={handleEditFileChange} accept="image/*" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                <small className="text-gray-400 text-xs">Leave empty to keep current image</small>
              </div>
              {editImagePreview && (
                <div className="mt-2">
                  <img src={editImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">News Description <span className="text-red-500">*</span></label>
                <textarea name="news_des" value={editFormData.news_des} onChange={(e) => setEditFormData(prev => ({ ...prev, news_des: e.target.value }))} rows="5" required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedNews(null); resetEditForm(); }} className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
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

export default NewsPage;
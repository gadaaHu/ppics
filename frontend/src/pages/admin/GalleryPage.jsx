// frontend/src/pages/admin/GalleryPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaImages,
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaSearch,
  FaTimes,
  FaUpload,
  FaDownload,
  FaCalendarAlt,
  FaSpinner,
  FaCheck,
  FaFilter,
  FaUndo,
  FaFileImage,
  FaImage,
  FaTrashAlt,
  FaFolderOpen
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { 
  getGallery, 
  uploadGallery, 
  deleteGallery, 
  deleteGalleryByDate,
  updateGallery 
} from '../../api/galleryApi';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    images: []
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    event_date: ''
  });
  
  const fileInputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await getGallery();
      setImages(response.data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterDate) filters.date = filterDate;
      const response = await getGallery(filters);
      setImages(response.data || []);
    } catch (error) {
      console.error('Error searching gallery:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    fetchGallery();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length === 0) {
      toast.error('Please select valid image files (JPG, PNG, GIF, WEBP)');
      return;
    }

    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setSubmitting(true);
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('event_date', formData.event_date);
    formData.images.forEach(file => {
      uploadData.append('images', file);
    });

    try {
      await uploadGallery(uploadData);
      toast.success(`${formData.images.length} image(s) uploaded successfully!`);
      resetForm();
      fetchGallery();
      setShowUploadForm(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', event_date: '', images: [] });
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteGallery(id);
      toast.success('Image deleted successfully!');
      fetchGallery();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleDeleteByDate = async (date) => {
    if (!window.confirm(`Delete ALL images from ${date}?`)) return;
    try {
      const response = await deleteGalleryByDate(date);
      toast.success(response.message || 'Images deleted successfully!');
      fetchGallery();
    } catch (error) {
      console.error('Delete by date error:', error);
      toast.error('Failed to delete images');
    }
  };

  const handleViewImage = (image) => {
    setSelectedImage(image);
    setIsViewModalOpen(true);
  };

  const handleEdit = (image) => {
    setSelectedImage(image);
    setEditFormData({
      title: image.title,
      event_date: image.event_date
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateGallery(selectedImage.id, editFormData);
      toast.success('Image updated successfully!');
      setIsEditModalOpen(false);
      fetchGallery();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update image');
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return '';
    if (imageName.startsWith('http')) return imageName;
    return `/uploads/gallery/${imageName}`;
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

  // Group images by date
  const groupedImages = images.reduce((groups, image) => {
    const date = image.event_date || 'No Date';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(image);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedImages).sort((a, b) => {
    if (a === 'No Date') return 1;
    if (b === 'No Date') return -1;
    return new Date(b) - new Date(a);
  });

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaImages className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Gallery Management</h3>
              <p className="text-purple-100 text-sm">Total: {images.length} images</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowUploadForm(!showUploadForm);
              if (!showUploadForm) resetForm();
            }}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
          >
            <FaPlus /> {showUploadForm ? 'Cancel' : 'Upload Images'}
          </button>
        </div>
      </div>

      {/* Upload Form */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaUpload className="text-purple-600" /> Upload New Images
            </h4>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition cursor-pointer">
                  <FaFileImage className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Drag & drop images here, or click to browse</p>
                  <p className="text-sm text-gray-400 mt-1">Supports: JPG, PNG, GIF, WEBP (Max 5MB each)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Choose Files
                  </button>
                </div>
              </div>

              {/* Preview */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowUploadForm(false);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.images.length === 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload /> Upload {formData.images.length > 0 ? `(${formData.images.length})` : ''}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Search
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-1"
          >
            <FaUndo /> Reset
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="space-y-8">
        {sortedDates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FaFolderOpen className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No images found</p>
            <p className="text-gray-400 text-sm mt-2">Upload your first image to get started</p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 flex flex-wrap items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-purple-500" />
                  <span className="font-semibold text-gray-700">
                    {date === 'No Date' ? 'No Date' : formatDate(date)}
                  </span>
                  <span className="text-sm text-gray-500">({groupedImages[date].length} images)</span>
                </div>
                {date !== 'No Date' && (
                  <button
                    onClick={() => handleDeleteByDate(date)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                  >
                    <FaTrashAlt className="inline mr-1" /> Delete All
                  </button>
                )}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {groupedImages[date].map((image) => (
                    <div
                      key={image.id}
                      className="group relative bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <img
                        src={getImageUrl(image.image)}
                        alt={image.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = '/assets/images/image-placeholder.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <p className="text-sm font-medium truncate">{image.title}</p>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleViewImage(image)}
                          className="w-8 h-8 bg-white/90 text-gray-700 rounded-full flex items-center justify-center hover:bg-white transition"
                          title="View"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleEdit(image)}
                          className="w-8 h-8 bg-yellow-400/90 text-white rounded-full flex items-center justify-center hover:bg-yellow-500 transition"
                          title="Edit"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(image.id, image.title)}
                          className="w-8 h-8 bg-red-500/90 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                          title="Delete"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-full">
                          {image.event_date ? formatDate(image.event_date) : 'No date'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b">
              <div>
                <h4 className="font-semibold text-gray-800">{selectedImage.title}</h4>
                <p className="text-sm text-gray-500">{formatDate(selectedImage.event_date)}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center min-h-[400px] bg-gray-50">
              <img
                src={getImageUrl(selectedImage.image)}
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.target.src = '/assets/images/image-placeholder.png';
                }}
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <a
                href={getImageUrl(selectedImage.image)}
                download
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
              >
                <FaDownload /> Download
              </a>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="ml-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-800">Edit Image</h4>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  type="date"
                  value={editFormData.event_date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, event_date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
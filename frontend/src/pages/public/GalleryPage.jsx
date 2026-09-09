// frontend/src/pages/public/GalleryPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaImages,
  FaSearch,
  FaTimes,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaDownload
} from 'react-icons/fa';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import { getGallery } from '../../api/galleryApi';

const PublicGalleryPage = ({ isEmbedded = false }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    fetchGallery();
  };

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const navigateLightbox = (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex < 0) {
      setCurrentIndex(images.length - 1);
      setSelectedImage(images[images.length - 1]);
    } else if (newIndex >= images.length) {
      setCurrentIndex(0);
      setSelectedImage(images[0]);
    } else {
      setCurrentIndex(newIndex);
      setSelectedImage(images[newIndex]);
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
      month: 'long',
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

  if (loading) {
    return (
      <div className={`min-h-screen ${isEmbedded ? 'bg-transparent' : 'bg-gray-50'}`}>
        {!isEmbedded && <Header />}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        </div>
        {!isEmbedded && <Footer />}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isEmbedded ? 'bg-transparent' : 'bg-gray-50'}`}>
      {!isEmbedded && <Header />}
      
      <div className={`${isEmbedded ? 'py-2' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            <span className="text-blue-600">Gallery</span>
          </h1>
          <p className="text-gray-500 mt-2">Explore our collection of images and memories</p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-1"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {sortedDates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FaImages className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No images found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-blue-500" />
                    <span className="font-semibold text-gray-700">
                      {date === 'No Date' ? 'No Date' : formatDate(date)}
                    </span>
                    <span className="text-sm text-gray-500">({groupedImages[date].length} images)</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {groupedImages[date].map((image, index) => (
                      <motion.div
                        key={image.id}
                        whileHover={{ scale: 1.03 }}
                        className="group relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                        onClick={() => {
                          const globalIndex = images.indexOf(image);
                          openLightbox(image, globalIndex);
                        }}
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
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-8 h-8 bg-white/90 text-gray-700 rounded-full flex items-center justify-center hover:bg-white transition">
                            <FaExpand className="text-sm" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl z-10 transition"
            >
              <FaTimes />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              className="absolute left-4 text-white/60 hover:text-white text-4xl z-10 transition hover:scale-110"
            >
              <FaChevronLeft />
            </button>

            <div className="max-w-5xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
              <img
                src={getImageUrl(selectedImage.image)}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="text-center text-white mt-4">
                <p className="text-lg font-semibold">{selectedImage.title}</p>
                <p className="text-sm text-white/60">{formatDate(selectedImage.event_date)}</p>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              className="absolute right-4 text-white/60 hover:text-white text-4xl z-10 transition hover:scale-110"
            >
              <FaChevronRight />
            </button>

            <a
              href={getImageUrl(selectedImage.image)}
              download
              className="absolute bottom-4 right-4 text-white/60 hover:text-white z-10 transition"
              onClick={(e) => e.stopPropagation()}
            >
              <FaDownload className="text-2xl" />
            </a>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isEmbedded && <Footer />}
    </div>
  );
};

export default PublicGalleryPage;
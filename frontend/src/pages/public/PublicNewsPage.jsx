import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaNewspaper, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import { getNews, getNewsById } from '../../api/newsApi';

const PublicNewsPage = ({ isEmbedded = false }) => {
  const { id } = useParams();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await getNewsById(id);
          if (response.data) {
            setSelectedNews(response.data);
          }
        }
        
        // Fetch all news for the list
        const listResponse = await getNews({ limit: 100 });
        setNewsList(listResponse.data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  const getImageUrl = (imageName) => {
    if (!imageName) return '/assets/images/default-news.jpg';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
    if (imageName.startsWith('uploads/')) return `/${imageName}`;
    return `/uploads/${encodeURIComponent(imageName)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isEmbedded ? 'bg-transparent' : 'bg-gray-50'} flex flex-col`}>
        {!isEmbedded && <Header />}
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isEmbedded ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-900'} transition-colors duration-300`}>
      {!isEmbedded && <Header />}
      <div className={`${isEmbedded ? 'py-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}`}>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Latest <span className="text-blue-600">News</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Stay updated with our latest announcements and updates.</p>
        </div>

        {newsList.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <FaNewspaper className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">No news available at the moment</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 cursor-pointer"
                onClick={() => setSelectedNews(item)}
              >
                <div className="relative h-48">
                  <img 
                    src={getImageUrl(item.news_image)} 
                    alt={item.news_title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/images/default-news.jpg'; }}
                  />
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    {formatDate(item.newsdate)}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {item.news_title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {item.news_des || 'No description available.'}
                  </p>
                  <button className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-2 text-sm">
                    Read More <FaArrowRight />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* News Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-3 right-3 sm:top-5 sm:right-5 w-9 h-9 sm:w-11 sm:h-11 bg-blue-600 text-white border-none rounded-full text-xl sm:text-2xl cursor-pointer z-10 transition-all duration-300 hover:bg-blue-700 hover:rotate-90 shadow-lg shadow-black/20 flex items-center justify-center"
                onClick={() => {
                  setSelectedNews(null);
                  if (id) {
                    // Remove id from URL if we were on a specific news page
                    window.history.pushState({}, '', '/news');
                  }
                }}
              >
                ×
              </button>
              
              <div className="w-full h-48 sm:h-64 md:h-80 overflow-hidden">
                <img 
                  src={getImageUrl(selectedNews.news_image)} 
                  alt={selectedNews.news_title} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/assets/images/default-news.jpg'; }}
                />
              </div>
              
              <div className="p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-12rem)] sm:max-h-[calc(90vh-16rem)] md:max-h-[calc(90vh-20rem)]">
                <div className="mb-3 sm:mb-4">
                  <div className="text-blue-600 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1 sm:mb-2">
                    {formatDate(selectedNews.newsdate)}
                  </div>
                  <h2 className="text-gray-800 dark:text-white text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                    {selectedNews.news_title}
                  </h2>
                </div>
                
                <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed space-y-3">
                  {selectedNews.news_des?.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicNewsPage;

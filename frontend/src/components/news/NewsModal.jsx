// frontend/src/components/news/NewsModal.jsx
import React, { useEffect } from 'react';

const NewsModal = ({ news, onClose }) => {
  const { news_title, news_des, news_image, formatted_date } = news;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const imagePath = news_image ? `/uploads/${news_image}` : '/assets/images/default-news.jpg';

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-5 right-5 w-11 h-11 bg-icspp-blue text-white border-none rounded-full text-2xl cursor-pointer z-10 transition-all duration-300 hover:bg-blue-700 hover:rotate-90 shadow-lg shadow-black/20 flex items-center justify-center"
          onClick={onClose}
        >
          ×
        </button>
        
        <div className="w-full h-72 md:h-96 overflow-hidden">
          <img 
            src={imagePath} 
            alt={news_title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6 md:p-10 overflow-y-auto max-h-[calc(90vh-18rem)] md:max-h-[calc(90vh-24rem)]">
          <div className="mb-6">
            {formatted_date && (
              <div className="text-icspp-blue text-sm font-semibold uppercase tracking-wider mb-3">
                {formatted_date}
              </div>
            )}
            <h2 className="text-gray-800 text-2xl md:text-3xl font-bold leading-tight">
              {news_title}
            </h2>
          </div>
          
          <div className="text-gray-700 text-base md:text-lg leading-relaxed space-y-4">
            {news_des?.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
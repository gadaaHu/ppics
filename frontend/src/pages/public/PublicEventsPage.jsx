import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import Header from '../../components/common/Header/Header';
import { getEvents } from '../../api/eventsApi';

const PublicEventsPage = ({ isEmbedded = false }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents({});
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getImageUrl = (imageName) => {
    if (!imageName) return '/uploads/meeting.jpg';
    if (imageName.startsWith('http')) return imageName;
    return `/uploads/${imageName}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
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
            Upcoming <span className="text-blue-600">Events</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Join us in our upcoming community activities and meetings.</p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <FaCalendarAlt className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">No events currently scheduled</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="relative h-48">
                  <img 
                    src={getImageUrl(event.photo)} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/uploads/meeting.jpg'; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <span className="text-white text-sm font-semibold flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-400" />
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {event.description || 'No description available.'}
                  </p>
                  <button className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-2 text-sm">
                    Learn More <FaArrowRight />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicEventsPage;

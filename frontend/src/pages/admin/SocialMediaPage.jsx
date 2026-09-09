import React from 'react';
import { motion } from 'framer-motion';
import { FaShareAlt, FaTools } from 'react-icons/fa';

const SocialMediaPage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaShareAlt className="text-blue-600" />
            Social Media Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your social media integration and sharing settings
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
      >
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaTools className="text-4xl text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Under Construction</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          The Social Media Management module is currently being developed. 
          Check back later for updates on this feature.
        </p>
      </motion.div>
    </div>
  );
};

export default SocialMediaPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaSave, FaSpinner, FaGlobe, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaTrash, FaPlus, FaListUl } from 'react-icons/fa';
import { getSettings, updateSettings } from '../../api/settingsApi';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    site_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    facebook_url: '',
    twitter_url: '',
    evaluation_criteria: '[]'
  });
  const [evaluationCriteria, setEvaluationCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettings();
      if (res.success && res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
        if (res.data.evaluation_criteria) {
          try {
            setEvaluationCriteria(JSON.parse(res.data.evaluation_criteria));
          } catch (e) {
            console.error('Failed to parse evaluation criteria', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCriteriaChange = (index, field, value) => {
    const updated = [...evaluationCriteria];
    updated[index][field] = field === 'max_score' ? parseInt(value) || 0 : value;
    // Auto-generate id if name is changed and id is empty
    if (field === 'name' && !updated[index].id) {
      updated[index].id = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    setEvaluationCriteria(updated);
  };

  const addCriteria = () => {
    setEvaluationCriteria([...evaluationCriteria, { id: '', name: '', max_score: 0 }]);
  };

  const removeCriteria = (index) => {
    setEvaluationCriteria(evaluationCriteria.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const payload = {
        ...settings,
        evaluation_criteria: JSON.stringify(evaluationCriteria)
      };

      const res = await updateSettings(payload);
      if (res.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCog className="text-blue-600" />
            System Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your application and system preferences
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-8">

          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">General Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaGlobe className="text-gray-400" />
                Site Name
              </label>
              <input
                type="text"
                name="site_name"
                value={settings.site_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter Site Name"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaEnvelope className="text-gray-400" />
                Contact Email
              </label>
              <input
                type="email"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="info@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaPhone className="text-gray-400" />
                Contact Phone
              </label>
              <input
                type="text"
                name="contact_phone"
                value={settings.contact_phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="+251 ..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                Address
              </label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Physical address"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Social Media Links</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaFacebook className="text-blue-600" />
                Facebook URL
              </label>
              <input
                type="url"
                name="facebook_url"
                value={settings.facebook_url}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaTwitter className="text-blue-400" />
                Twitter / X URL
              </label>
              <input
                type="url"
                name="twitter_url"
                value={settings.twitter_url}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <FaListUl className="text-purple-600" />
            Evaluation Criteria
          </h3>

          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-4">
              Configure the checklist used when evaluating members. The total score will be automatically calculated based on the maximum scores provided here.
            </p>

            <div className="space-y-4">
              {evaluationCriteria.map((criterion, index) => (
                <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="w-full md:w-1/3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">ID (Internal)</label>
                    <input
                      type="text"
                      value={criterion.id}
                      onChange={(e) => handleCriteriaChange(index, 'id', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="e.g., attendance"
                      required
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Criterion Name</label>
                    <input
                      type="text"
                      value={criterion.name}
                      onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="e.g., Event Attendance"
                      required
                    />
                  </div>
                  <div className="w-full md:w-1/4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Max Score</label>
                    <input
                      type="number"
                      value={criterion.max_score}
                      onChange={(e) => handleCriteriaChange(index, 'max_score', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      min="1"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCriteria(index)}
                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors h-[34px] flex items-center justify-center"
                    title="Remove Criterion"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCriteria}
              className="mt-4 px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <FaPlus /> Add Criterion
            </button>

            <div className="mt-4 flex justify-end">
              <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
                Total Possible Score: {evaluationCriteria.reduce((sum, c) => sum + (parseInt(c.max_score) || 0), 0)}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default SettingsPage;

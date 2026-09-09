import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FaUserPlus,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBuilding,
  FaImage,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaUserCircle,
  FaLink,
  FaHome,
  FaArrowLeft
} from 'react-icons/fa';
import { 
  createMember, 
  getDropdownData,
  getCooperativesByDistrict,
  getFamiliesByCooperative
} from '../../api/memberApi';
import { useAuth } from '../../context/AuthContext';

const AddMemberPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [dropdownData, setDropdownData] = useState({
    districts: [],
    cooperatives: [],
    families: [],
    positions: []
  });
  const [filteredCoops, setFilteredCoops] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    phone: '',
    email: '',
    district_id: '',
    cooperative_id: user?.cooperative_id || '',
    family_id: '',
    position_id: '',
    nation: '',
    education_level: '',
    field_of_study: '',
    birth_region: '',
    birth_zone: '',
    birth_woreda_kebele: '',
    current_region: '',
    current_zone: '',
    current_woreda_kebele: '',
    membership_year: new Date().getFullYear().toString(),
    leader_status: '',
    key_strength: '',
    key_weakness: '',
    grade: '',
    membership_fee: '',
    training_center: '',
    training_type: '',
    training_round: '',
    training_year: '',
    training_result: '',
    social_link1: '',
    social_link2: '',
    additional_info: '',
    status: 'Active',
    photo: null
  });

  useEffect(() => {
    fetchDropdownData();
    // If user has cooperative, pre-select it
    if (user?.cooperative_id) {
      setFormData(prev => ({ ...prev, cooperative_id: user.cooperative_id }));
      fetchFamilies(user.cooperative_id);
    }
  }, [user]);

  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      const response = await getDropdownData();
      setDropdownData({
        districts: response.data.districts || [],
        cooperatives: response.data.cooperatives || [],
        families: response.data.families || [],
        positions: response.data.positions || []
      });
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCooperatives = async (districtId) => {
    if (!districtId) {
      setFilteredCoops([]);
      return;
    }
    try {
      const response = await getCooperativesByDistrict(districtId);
      setFilteredCoops(response.data || []);
    } catch (error) {
      console.error('Error fetching cooperatives:', error);
    }
  };

  const fetchFamilies = async (cooperativeId) => {
    if (!cooperativeId) {
      setFilteredFamilies([]);
      return;
    }
    try {
      const response = await getFamiliesByCooperative(cooperativeId);
      setFilteredFamilies(response.data || []);
    } catch (error) {
      console.error('Error fetching families:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Handle cascading dropdowns
    if (name === 'district_id') {
      fetchCooperatives(value);
      setFormData(prev => ({ ...prev, cooperative_id: '', family_id: '' }));
      setFilteredFamilies([]);
    }
    if (name === 'cooperative_id') {
      fetchFamilies(value);
      setFormData(prev => ({ ...prev, family_id: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setFormData(prev => ({ ...prev, photo: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.full_name || !formData.gender) {
        toast.error('Full name and gender are required');
        setSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await createMember(formDataToSend);
      toast.success('Member added successfully!');
      resetForm();
      navigate('/member/members');
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      gender: '',
      phone: '',
      email: '',
      district_id: '',
      cooperative_id: user?.cooperative_id || '',
      family_id: '',
      position_id: '',
      nation: '',
      education_level: '',
      field_of_study: '',
      birth_region: '',
      birth_zone: '',
      birth_woreda_kebele: '',
      current_region: '',
      current_zone: '',
      current_woreda_kebele: '',
      membership_year: new Date().getFullYear().toString(),
      leader_status: '',
      key_strength: '',
      key_weakness: '',
      grade: '',
      membership_fee: '',
      training_center: '',
      training_type: '',
      training_round: '',
      training_year: '',
      training_result: '',
      social_link1: '',
      social_link2: '',
      additional_info: '',
      status: 'Active',
      photo: null
    });
    setImagePreview(null);
    setFilteredCoops([]);
    setFilteredFamilies([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
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
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaUserPlus className="text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Add New Member</h3>
              <p className="text-blue-100 text-sm">Add a new member to your cooperative</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/member/members')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
          >
            <FaArrowLeft /> Back to Members
          </button>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-500" /> Personal Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="inline mr-1" /> Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEnvelope className="inline mr-1" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nation</label>
                <input
                  type="text"
                  name="nation"
                  value={formData.nation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-500" /> Birth & Current Address
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Region</label>
                <input
                  type="text"
                  name="birth_region"
                  value={formData.birth_region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Zone</label>
                <input
                  type="text"
                  name="birth_zone"
                  value={formData.birth_zone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Woreda/Kebele</label>
                <input
                  type="text"
                  name="birth_woreda_kebele"
                  value={formData.birth_woreda_kebele}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Region</label>
                <input
                  type="text"
                  name="current_region"
                  value={formData.current_region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Zone</label>
                <input
                  type="text"
                  name="current_zone"
                  value={formData.current_zone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Woreda/Kebele</label>
                <input
                  type="text"
                  name="current_woreda_kebele"
                  value={formData.current_woreda_kebele}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Education & Membership */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-purple-500" /> Education & Membership
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                <select
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Level</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelors">Bachelors</option>
                  <option value="Masters">Masters</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <input
                  type="text"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Year</label>
                <input
                  type="number"
                  name="membership_year"
                  value={formData.membership_year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leader Status</label>
                <select
                  name="leader_status"
                  value={formData.leader_status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Status</option>
                  <option value="ስራ አስፈፃሚ ኮሚቴ">ስራ አስፈፃሚ ኮሚቴ</option>
                  <option value="ማዕከላዊ ኮሚቴ">ማዕከላዊ ኮሚቴ</option>
                  <option value="አባል">አባል</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Fee</label>
                <input
                  type="number"
                  step="0.01"
                  name="membership_fee"
                  value={formData.membership_fee}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Training */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-orange-500" /> Leader Training
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Center</label>
                <input
                  type="text"
                  name="training_center"
                  value={formData.training_center}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Type</label>
                <select
                  name="training_type"
                  value={formData.training_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Type</option>
                  <option value="Basic">Basic</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Special">Special</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Round</label>
                <input
                  type="text"
                  name="training_round"
                  value={formData.training_round}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Year</label>
                <input
                  type="number"
                  name="training_year"
                  value={formData.training_year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Result (CGPA)</label>
                <input
                  type="text"
                  name="training_result"
                  value={formData.training_result}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaLink className="text-blue-500" /> Social Links
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Social Link 1</label>
                <input
                  type="text"
                  name="social_link1"
                  value={formData.social_link1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Social Link 2</label>
                <input
                  type="text"
                  name="social_link2"
                  value={formData.social_link2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Organization & Photo */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaBuilding className="text-indigo-500" /> Organization & Photo
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select District</option>
                  {dropdownData.districts.map(d => (
                    <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cooperative</label>
                <select
                  name="cooperative_id"
                  value={formData.cooperative_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Cooperative</option>
                  {filteredCoops.map(c => (
                    <option key={c.cooperative_id} value={c.cooperative_id}>{c.cooperative_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family</label>
                <select
                  name="family_id"
                  value={formData.family_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Family</option>
                  {filteredFamilies.map(f => (
                    <option key={f.family_id} value={f.family_id}>{f.family_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  name="position_id"
                  value={formData.position_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Position</option>
                  {dropdownData.positions.map(p => (
                    <option key={p.position_id} value={p.position_id}>
                      {p.position_name} ({p.level}, {p.sector})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
                <textarea
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="2"
                />
              </div>
              {user?.role === 'member' || user?.is_member ? (
                <div className="col-span-1 md:col-span-2">
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <FaSpinner className="text-yellow-600" />
                    <span className="text-sm font-medium">Status will default to "Pending" until approved by your Family Leader.</span>
                  </div>
                </div>
              ) : (
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <div className="inline-block">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 mb-2"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 mb-2 mx-auto">
                    <FaUserCircle className="text-4xl text-gray-400" />
                  </div>
                )}
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition inline-block text-sm">
                  <FaImage className="inline mr-2" /> Upload Photo
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-4 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/member/members')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <FaCheck /> Add Member
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddMemberPage;
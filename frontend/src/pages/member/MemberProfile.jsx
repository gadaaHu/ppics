import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    FaUser,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaGlobe,
    FaGraduationCap,
    FaBook,
    FaCamera,
    FaSave,
    FaTimes,
    FaEye,
    FaEyeSlash,
    FaSpinner,
    FaUserCircle,
    FaBuilding,
    FaUsers,
    FaFileAlt,
    FaCalendarCheck,
    FaKey,
    FaEdit,
    FaPrint,
    FaGift,
    FaMoneyBillWave,
    FaAward,
    FaMedal
} from 'react-icons/fa';
import { getMemberPayments } from '../../api/paymentApi';
import {
    getMemberProfile,
    updateMemberProfile,
    changeMemberPassword,
    uploadProfilePhoto
} from '../../api/memberProfileApi';

const MemberProfile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [editForm, setEditForm] = useState({});
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    
    // Payments & Receipts
    const [payments, setPayments] = useState([]);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [showGiftAnimation, setShowGiftAnimation] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchMyPayments();
    }, []);

    const fetchMyPayments = async () => {
        try {
            const res = await getMemberPayments();
            if (res.success) {
                setPayments(res.data);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const openGiftReceipt = (payment) => {
        setSelectedReceipt(payment);
        setShowGiftAnimation(true);
        setShowReceiptModal(true);
        setTimeout(() => setShowGiftAnimation(false), 3000); // Stop confetti after 3s
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getMemberProfile();
            if (response.success) {
                setProfile(response.data);
                setEditForm(response.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setPhotoFile(file);

        // Upload
        try {
            const response = await uploadProfilePhoto(file);
            if (response.success) {
                setProfile(prev => ({
                    ...prev,
                    photo: response.data.photo,
                    photo_url: response.data.photo_url
                }));
                // Update user context
                updateUser({ ...user, photo: response.data.photo });
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await updateMemberProfile(editForm);
            if (response.success) {
                setProfile(response.data);
                setShowEditModal(false);
                // Update user context
                updateUser({ ...user, ...response.data });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        try {
            const response = await changeMemberPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (response.success) {
                setPasswordSuccess('Password changed successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess('');
                }, 2000);
            }
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Error changing password');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <FaSpinner className="animate-spin text-blue-500 text-4xl" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <FaUserCircle className="text-gray-300 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Profile Not Found</h3>
                <p className="text-gray-500 mt-2">Unable to load profile information.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white"
            >
                <div className="flex flex-wrap items-center gap-6">
                    {/* Profile Photo */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/50">
                            {profile.photo_url ? (
                                <img
                                    src={profile.photo_url}
                                    alt={profile.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaUserCircle className="text-5xl text-white/80" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                            <FaCamera className="text-white text-sm" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                        <p className="text-blue-100 flex items-center gap-2 mt-1">
                            <FaBuilding className="text-sm" />
                            {profile.cooperative_name || 'No Cooperative'}
                            <span className="mx-2">|</span>
                            <FaUsers className="text-sm" />
                            {profile.family_name || 'No Family'}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-blue-100">
                            <span className="flex items-center gap-1">
                                <FaPhone /> {profile.phone || 'No phone'}
                            </span>
                            <span className="flex items-center gap-1">
                                <FaEnvelope /> {profile.email || 'No email'}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 bg-white/10 rounded-xl p-4">
                        <div className="text-center">
                            <div className="text-xl font-bold">{profile.total_attendance || 0}</div>
                            <div className="text-xs text-blue-100">Attendance</div>
                        </div>
                        <div className="w-px bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-xl font-bold">{profile.total_documents || 0}</div>
                            <div className="text-xs text-blue-100">Documents</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                    <FaEdit /> Edit Profile
                </button>
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                >
                    <FaKey /> Change Password
                </button>
                {profile && (profile.member_id || user?.member_id) && (
                    <button
                        onClick={() => window.open(`/print-member/${profile.member_id || user.member_id}`, '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <FaPrint /> Print ID Card
                    </button>
                )}
            </div>

            {/* Profile Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Profile Details</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                            <p className="text-gray-800">{profile.full_name}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Gender</label>
                            <p className="text-gray-800">{profile.gender || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                            <p className="text-gray-800">{profile.phone || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                            <p className="text-gray-800">{profile.email || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                            <p className="text-gray-800">{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Address</label>
                            <p className="text-gray-800">{profile.address || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Nation</label>
                            <p className="text-gray-800">{profile.nation || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Education Level</label>
                            <p className="text-gray-800">{profile.education_level || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Field of Study</label>
                            <p className="text-gray-800">{profile.field_of_study || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Current Region</label>
                            <p className="text-gray-800">{profile.current_region || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Positions</label>
                            <p className="text-gray-800">{profile.positions || 'No positions'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Member Since</label>
                            <p className="text-gray-800">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* My Receipts Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-amber-50">
                    <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                        <FaAward className="text-amber-500 text-xl" />
                        My Official Payment Certificates
                    </h3>
                </div>
                <div className="p-6">
                    {payments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-3" />
                            <p>No payment certificates available yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {payments.map(payment => (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    key={payment.payment_id}
                                    onClick={() => openGiftReceipt(payment)}
                                    className="relative overflow-hidden cursor-pointer bg-gradient-to-br from-yellow-100 via-white to-amber-100 border border-amber-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FaMedal className="text-9xl text-amber-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <FaGift className="text-3xl text-amber-500 animate-pulse" />
                                            <span className="text-xs font-bold bg-amber-500 text-white px-2 py-1 rounded-full shadow-sm">
                                                {payment.payment_year}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-lg mb-1">{payment.payment_month}</h4>
                                        <p className="text-sm font-medium text-amber-700">{payment.amount} Birr</p>
                                        <div className="mt-4 pt-3 border-t border-amber-200/50 flex justify-between items-center text-xs text-gray-500">
                                            <span>Click to open gift</span>
                                            <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h5 className="text-lg font-semibold flex items-center gap-2">
                                <FaEdit className="text-blue-500" />
                                Edit Profile
                            </h5>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.full_name || ''}
                                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender
                                    </label>
                                    <select
                                        value={editForm.gender || ''}
                                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={editForm.phone || ''}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editForm.email || ''}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.date_of_birth || ''}
                                        onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.address || ''}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nation
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.nation || ''}
                                        onChange={(e) => setEditForm({ ...editForm, nation: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Education Level
                                    </label>
                                    <select
                                        value={editForm.education_level || ''}
                                        onChange={(e) => setEditForm({ ...editForm, education_level: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select</option>
                                        <option value="Primary">Primary</option>
                                        <option value="Secondary">Secondary</option>
                                        <option value="Diploma">Diploma</option>
                                        <option value="Bachelor">Bachelor</option>
                                        <option value="Master">Master</option>
                                        <option value="PhD">PhD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Field of Study
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.field_of_study || ''}
                                        onChange={(e) => setEditForm({ ...editForm, field_of_study: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Region
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.current_region || ''}
                                        onChange={(e) => setEditForm({ ...editForm, current_region: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h5 className="text-lg font-semibold flex items-center gap-2">
                                <FaKey className="text-amber-500" />
                                Change Password
                            </h5>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordError('');
                                    setPasswordSuccess('');
                                    setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    });
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordChange} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            required
                                            minLength={6}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="Enter new password (min 6 chars)"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                {passwordError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                                        {passwordError}
                                    </div>
                                )}
                                {passwordSuccess && (
                                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-lg text-sm">
                                        {passwordSuccess}
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordError('');
                                        setPasswordSuccess('');
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <FaKey /> Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Gift-Decorated Printable Receipt Modal */}
            {showReceiptModal && selectedReceipt && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:block overflow-y-auto">
                    
                    {/* Confetti Animation Effect (only visible on screen, not print) */}
                    {showGiftAnimation && (
                        <div className="fixed inset-0 pointer-events-none z-50 flex justify-center items-center overflow-hidden print:hidden">
                            {[...Array(50)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: -50, x: 0, opacity: 1, scale: Math.random() * 1.5 }}
                                    animate={{ 
                                        y: window.innerHeight + 50, 
                                        x: (Math.random() - 0.5) * window.innerWidth,
                                        rotate: Math.random() * 360
                                    }}
                                    transition={{ duration: 2 + Math.random() * 2, ease: "linear" }}
                                    className={`absolute w-3 h-6 ${['bg-red-500', 'bg-blue-500', 'bg-yellow-400', 'bg-green-500', 'bg-purple-500'][Math.floor(Math.random() * 5)]}`}
                                    style={{ left: `${Math.random() * 100}vw`, top: '-5vh' }}
                                />
                            ))}
                        </div>
                    )}

                    <motion.div 
                        initial={{ scale: 0.5, rotate: -5, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="bg-white rounded-xl max-w-3xl w-full p-2 print:w-full print:max-w-none print:p-0 shadow-2xl relative my-8"
                    >
                        {/* Action buttons (hidden when printing) */}
                        <div className="absolute -top-12 right-0 flex gap-2 print:hidden z-10">
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-white text-gray-800 rounded-full shadow-lg hover:bg-gray-100 flex items-center gap-2 font-bold"
                            >
                                <FaPrint /> Print Certificate
                            </button>
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Outer Decorative Gold Border */}
                        <div className="border-[8px] border-amber-300 p-2 rounded-lg bg-yellow-50">
                            {/* Inner Decorative Border */}
                            <div className="border-4 border-double border-amber-400 p-8 md:p-12 rounded bg-white relative overflow-hidden shadow-inner">
                                
                                {/* Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                    <FaAward className="text-[400px] text-amber-500" />
                                </div>
                                
                                {/* Corner Ribbons */}
                                <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-amber-500"></div>
                                <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-amber-500"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-amber-500"></div>
                                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-amber-500"></div>
                                
                                <div className="text-center pb-6 mb-8 relative border-b-2 border-amber-200">
                                    <FaStar className="text-amber-400 text-4xl absolute left-1/2 -top-4 -translate-x-1/2 -translate-y-full bg-white px-2" />
                                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-800 uppercase tracking-widest mt-6">
                                        Certificate of Payment
                                    </h1>
                                    <h2 className="text-lg md:text-xl text-amber-600 mt-3 font-serif italic font-medium">
                                        Prosperity Party Cooperative
                                    </h2>
                                </div>
                                
                                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 text-center md:text-left">
                                    <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                                        <p className="text-xs text-amber-600 uppercase tracking-widest font-bold mb-1">Receipt Number</p>
                                        <p className="text-lg font-mono font-bold text-gray-800">{selectedReceipt.receipt_number}</p>
                                    </div>
                                    <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 text-center md:text-right">
                                        <p className="text-xs text-amber-600 uppercase tracking-widest font-bold mb-1">Date of Issue</p>
                                        <p className="text-lg font-medium text-gray-800">{new Date(selectedReceipt.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="text-center my-12 relative z-10">
                                    <p className="text-gray-500 italic mb-4 text-lg">This acknowledges with profound gratitude that</p>
                                    <p className="text-3xl md:text-4xl font-bold text-gray-800 font-serif border-b border-dashed border-gray-400 inline-block px-8 pb-2 mb-6">
                                        {selectedReceipt.member_name}
                                    </p>
                                    
                                    <p className="text-gray-500 italic mb-4 text-lg">has successfully fulfilled their monthly obligation of</p>
                                    <p className="text-4xl font-bold text-amber-600 mb-6 drop-shadow-sm">
                                        {selectedReceipt.amount} Birr
                                    </p>
                                    
                                    <p className="text-gray-500 italic mb-2 text-lg">for the designated period of</p>
                                    <p className="text-2xl font-bold text-gray-800 uppercase tracking-wider bg-amber-100 inline-block px-6 py-2 rounded-full border border-amber-200">
                                        {selectedReceipt.payment_month} {selectedReceipt.payment_year}
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-end mt-16 pt-8 gap-12 md:gap-4 relative z-10">
                                    {/* Golden Seal */}
                                    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex items-center justify-center pointer-events-none opacity-80 print:opacity-100 hidden md:flex">
                                        <div className="w-24 h-24 bg-amber-400 rounded-full border-4 border-dashed border-white shadow-[0_0_0_4px_#fbbf24] flex items-center justify-center transform rotate-12">
                                            <span className="text-white font-bold text-xs text-center uppercase">Official<br/>Seal</span>
                                        </div>
                                    </div>

                                    <div className="text-center w-full md:w-auto">
                                        <div className="w-48 border-b-2 border-gray-400 mb-2 mx-auto"></div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Member Signature</p>
                                    </div>
                                    <div className="text-center w-full md:w-auto">
                                        <div className="w-48 border-b-2 border-amber-600 mb-2 mx-auto flex items-end justify-center h-12">
                                            <span className="font-handwriting text-3xl text-amber-900 transform -rotate-6">{selectedReceipt.approver_name}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Authorized Official</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MemberProfile;
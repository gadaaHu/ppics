import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaUserPlus, FaSearch, FaEye, FaPrint, FaSpinner, FaUserCircle } from 'react-icons/fa';
import { getMembers } from '../../api/memberApi';
import { useAuth } from '../../context/AuthContext';

const MemberMembersPage = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        male: 0,
        female: 0
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            // Members will only see their cooperative members (filtered by backend)
            const response = await getMembers({ search });
            if (response.success) {
                setMembers(response.data);
                // Calculate stats
                const total = response.data.length;
                const male = response.data.filter(m => m.gender === 'Male').length;
                const female = response.data.filter(m => m.gender === 'Female').length;
                setStats({ total, male, female });
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMembers();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <FaSpinner className="animate-spin text-blue-500 text-4xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUsers className="text-blue-500" />
                        My Cooperative Members
                    </h2>
                    <p className="text-gray-500 text-sm">
                        View members in your cooperative
                    </p>
                </div>
                <Link
                    to="/member/add-member"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                    <FaUserPlus /> Add Member
                </Link>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Members</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaUsers className="text-blue-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Male</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.male}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaUserCircle className="text-blue-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Female</p>
                            <p className="text-2xl font-bold text-pink-600">{stats.female}</p>
                        </div>
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <FaUserCircle className="text-pink-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search members by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <FaSearch /> Search
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                fetchMembers();
                            }}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Gender</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Family</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member, index) => (
                                <tr key={member.member_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                                {member.full_name?.charAt(0).toUpperCase() || 'M'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">{member.full_name}</div>
                                                {member.position_name && (
                                                    <div className="text-xs text-gray-400">{member.position_name}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{member.phone || '-'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            member.gender === 'Male' ? 'bg-blue-100 text-blue-600' : 
                                            member.gender === 'Female' ? 'bg-pink-100 text-pink-600' : 
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                            {member.gender || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{member.family_name || '-'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            member.status === 'active' ? 'bg-green-100 text-green-600' : 
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {member.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                className="p-1.5 bg-blue-50 text-blue-500 rounded hover:bg-blue-100 transition-colors" 
                                                title="View Details"
                                            >
                                                <FaEye className="text-sm" />
                                            </button>
                                            <button 
                                                onClick={() => window.open(`/print-member/${member.member_id}`, '_blank')}
                                                className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors" 
                                                title="Print ID Card"
                                            >
                                                <FaPrint className="text-sm" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {members.length === 0 && (
                    <div className="text-center py-12">
                        <FaUsers className="text-gray-300 text-4xl mx-auto mb-3" />
                        <h5 className="text-gray-500 font-medium">No Members Found</h5>
                        <p className="text-gray-400 text-sm">
                            {search ? 'No members match your search criteria.' : 'No members in your cooperative yet.'}
                        </p>
                        {!search && (
                            <Link
                                to="/member/add-member"
                                className="inline-block mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                <FaUserPlus className="inline mr-2" /> Add First Member
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberMembersPage;
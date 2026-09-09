import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaUserPlus, FaSearch, FaEdit, FaTrash, FaEye, FaSpinner } from 'react-icons/fa';
import { getMembers } from '../../api/memberApi';

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await getMembers({ search });
            if (response.success) {
                setMembers(response.data);
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
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUsers className="text-blue-500" />
                        Members
                    </h2>
                    <p className="text-gray-500 text-sm">View and manage members</p>
                </div>
                <Link
                    to="/member/add-member"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                    <FaUserPlus /> Add Member
                </Link>
            </motion.div>

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
                </form>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Cooperative</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Family</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member, index) => (
                                <tr key={member.member_id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-gray-800">{member.full_name}</div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{member.phone || '-'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{member.cooperative_name || '-'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{member.family_name || '-'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            member.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {member.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <button className="p-1.5 bg-blue-50 text-blue-500 rounded hover:bg-blue-100 transition-colors" title="View">
                                                <FaEye className="text-sm" />
                                            </button>
                                            <button className="p-1.5 bg-amber-50 text-amber-500 rounded hover:bg-amber-100 transition-colors" title="Edit">
                                                <FaEdit className="text-sm" />
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
                        <p className="text-gray-400 text-sm">Click "Add Member" to add a new member.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembersPage;
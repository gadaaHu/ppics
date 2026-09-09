import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMembers } from '../../api/memberApi';
import { FaUsers, FaUserCircle, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FamilyLeaderDashboard = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await getMembers();
            if (response.success) {
                setMembers(response.data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <FaSpinner className="animate-spin text-blue-500 text-4xl" />
            </div>
        );
    }

    const maleCount = members.filter(m => m.gender === 'Male').length;
    const femaleCount = members.filter(m => m.gender === 'Female').length;

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Family Leader Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome to your family dashboard, {user.full_name}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Family Members</p>
                            <p className="text-2xl font-bold text-gray-800">{members.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <FaUsers className="text-2xl" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Male Members</p>
                            <p className="text-2xl font-bold text-blue-600">{maleCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                            <FaUserCircle className="text-2xl" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Female Members</p>
                            <p className="text-2xl font-bold text-pink-600">{femaleCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
                            <FaUserCircle className="text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Recent Family Members</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-6 text-gray-600 font-medium">Name</th>
                                <th className="text-left py-3 px-6 text-gray-600 font-medium">Gender</th>
                                <th className="text-left py-3 px-6 text-gray-600 font-medium">Phone</th>
                                <th className="text-left py-3 px-6 text-gray-600 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.slice(0, 5).map((member) => (
                                <tr key={member.member_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-6 font-medium text-gray-800">{member.full_name}</td>
                                    <td className="py-3 px-6 text-gray-600">{member.gender}</td>
                                    <td className="py-3 px-6 text-gray-600">{member.phone || '-'}</td>
                                    <td className="py-3 px-6">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {member.status || 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-6 text-center text-gray-500">
                                        No members found in your family.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FamilyLeaderDashboard;

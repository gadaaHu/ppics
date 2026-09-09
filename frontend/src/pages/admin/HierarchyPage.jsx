import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSitemap,
    FaPrint,
    FaMap,
    FaUsers,
    FaUser,
    FaHome,
    FaChevronDown,
    FaChevronRight,
    FaBuilding,
    FaCrown,
    FaExpand,
    FaCompress,
    FaSearch,
    FaFilter,
    FaSpinner,
    FaTimes
} from 'react-icons/fa';
import { getHierarchy } from '../../api/hierarchyApi';

const HierarchyPage = () => {
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedAll, setExpandedAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedDistricts, setExpandedDistricts] = useState({});
    const [expandedCooperatives, setExpandedCooperatives] = useState({});
    const [expandedFamilies, setExpandedFamilies] = useState({});

    useEffect(() => {
        fetchHierarchy();
    }, []);

    const fetchHierarchy = async () => {
        try {
            setLoading(true);
            const response = await getHierarchy();
            setHierarchy(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching hierarchy:', err);
            setError('Failed to load hierarchy data');
        } finally {
            setLoading(false);
        }
    };

    const toggleDistrict = (districtId) => {
        setExpandedDistricts(prev => ({
            ...prev,
            [districtId]: !prev[districtId]
        }));
    };

    const toggleCooperative = (cooperativeId) => {
        setExpandedCooperatives(prev => ({
            ...prev,
            [cooperativeId]: !prev[cooperativeId]
        }));
    };

    const toggleFamily = (familyId) => {
        setExpandedFamilies(prev => ({
            ...prev,
            [familyId]: !prev[familyId]
        }));
    };

    const toggleAll = () => {
        const newState = !expandedAll;
        setExpandedAll(newState);
        
        const newDistrictState = {};
        hierarchy.forEach(district => {
            newDistrictState[district.district_id] = newState;
        });
        setExpandedDistricts(newDistrictState);
        
        const newCoopState = {};
        hierarchy.forEach(district => {
            district.cooperatives?.forEach(coop => {
                newCoopState[coop.cooperative_id] = newState;
            });
        });
        setExpandedCooperatives(newCoopState);
        
        const newFamilyState = {};
        hierarchy.forEach(district => {
            district.cooperatives?.forEach(coop => {
                coop.families?.forEach(family => {
                    newFamilyState[family.family_id] = newState;
                });
            });
        });
        setExpandedFamilies(newFamilyState);
    };

    const getImageUrl = (photo) => {
        if (!photo) return '/assets/images/default.png';
        if (photo.startsWith('http')) return photo;
        if (photo.startsWith('uploads/')) return `/${photo}`;
        if (photo.startsWith('/uploads/')) return photo;
        return `/uploads/${photo}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    const leaderCardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 400, damping: 25 }
        },
        hover: {
            y: -4,
            boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
            transition: { duration: 0.2 }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading hierarchy structure...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                <FaTimes className="text-red-500" />
                {error}
            </div>
        );
    }

    if (hierarchy.length === 0) {
        return (
            <div className="text-center py-16">
                <FaSitemap className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No hierarchy data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl"
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <FaSitemap className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">ICS PP Hierarchy</h3>
                            <p className="text-blue-100 text-sm">View the complete organizational structure</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={toggleAll}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
                        >
                            {expandedAll ? <FaCompress /> : <FaExpand />}
                            {expandedAll ? 'Collapse All' : 'Expand All'}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all backdrop-blur-sm"
                        >
                            <FaPrint />
                            Print
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
            >
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search districts, cooperatives, families, or members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                </div>
            </motion.div>

            {/* Hierarchy Tree */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
                id="hierarchySection"
            >
                {hierarchy.map((district) => (
                    <motion.div
                        key={district.district_id}
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                        {/* District Header */}
                        <button
                            onClick={() => toggleDistrict(district.district_id)}
                            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                    <FaMap className="text-lg" />
                                </div>
                                <div className="text-left">
                                    <span className="font-bold text-lg text-gray-800">
                                        {district.district_name}
                                    </span>
                                    <span className="ml-3 text-sm text-gray-500">
                                        {district.cooperatives?.length || 0} Cooperatives
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">District</span>
                                {expandedDistricts[district.district_id] ? (
                                    <FaChevronDown className="text-gray-400" />
                                ) : (
                                    <FaChevronRight className="text-gray-400" />
                                )}
                            </div>
                        </button>

                        {/* District Content */}
                        <AnimatePresence>
                            {expandedDistricts[district.district_id] && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-6 space-y-4 bg-white"
                                >
                                    {district.cooperatives?.map((cooperative) => (
                                        <div key={cooperative.cooperative_id} className="bg-gray-50 rounded-xl overflow-hidden">
                                            {/* Cooperative Header */}
                                            <button
                                                onClick={() => toggleCooperative(cooperative.cooperative_id)}
                                                className="w-full px-5 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                                                        <FaBuilding className="text-sm" />
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="font-semibold text-gray-700">
                                                            {cooperative.cooperative_name}
                                                        </span>
                                                        <span className="ml-3 text-xs text-gray-500">
                                                            {cooperative.families?.length || 0} Families
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">Cooperative</span>
                                                    {expandedCooperatives[cooperative.cooperative_id] ? (
                                                        <FaChevronDown className="text-gray-400" />
                                                    ) : (
                                                        <FaChevronRight className="text-gray-400" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Cooperative Content */}
                                            {expandedCooperatives[cooperative.cooperative_id] && (
                                                <div className="p-5 space-y-5">
                                                    {/* 1. Cooperative Leader */}
                                                    {cooperative.leaders && cooperative.leaders.length > 0 && (
                                                        <div className="text-center">
                                                            <h5 className="font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
                                                                <FaCrown className="text-yellow-500" />
                                                                Cooperative Leader
                                                            </h5>
                                                            <div className="flex flex-wrap justify-center gap-6">
                                                                {cooperative.leaders.map((leader) => (
                                                                    <motion.div
                                                                        key={leader.member_id}
                                                                        variants={leaderCardVariants}
                                                                        initial="hidden"
                                                                        animate="visible"
                                                                        whileHover="hover"
                                                                        className="bg-white rounded-xl p-5 shadow-sm min-w-[160px]"
                                                                    >
                                                                        <img
                                                                            src={getImageUrl(leader.photo)}
                                                                            alt={leader.full_name}
                                                                            className="w-24 h-24 rounded-full object-cover mx-auto"
                                                                            onError={(e) => { e.target.src = '/assets/images/default.png'; }}
                                                                        />
                                                                        <h6 className="font-semibold mt-3 text-center text-gray-800">{leader.full_name}</h6>
                                                                        <p className="text-sm text-center text-gray-500">{leader.position_name}</p>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 2. Sector Leaders - Horizontal Rows */}
                                                    {cooperative.sectors && cooperative.sectors.length > 0 && (
                                                        <div>
                                                            <h6 className="font-semibold text-gray-700 mb-4">Sector Leaders</h6>
                                                            <div className="space-y-4">
                                                                {cooperative.sectors.map((sector, idx) => (
                                                                    <motion.div
                                                                        key={idx}
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ delay: idx * 0.1 }}
                                                                        className="bg-white rounded-xl p-4 shadow-sm"
                                                                    >
                                                                        <div className="flex items-center gap-3 mb-3">
                                                                            <span className="text-sm font-semibold text-gray-700">
                                                                                {sector.sector}
                                                                            </span>
                                                                            <span className="text-xs text-gray-400">
                                                                                ({sector.leaders.length} leaders)
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        <div className="flex flex-wrap gap-3">
                                                                            {sector.leaders.map((leader) => (
                                                                                <motion.div
                                                                                    key={leader.member_id}
                                                                                    variants={leaderCardVariants}
                                                                                    initial="hidden"
                                                                                    animate="visible"
                                                                                    whileHover="hover"
                                                                                    className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 min-w-[180px] flex-1 max-w-[220px]"
                                                                                >
                                                                                    <img
                                                                                        src={getImageUrl(leader.photo)}
                                                                                        alt={leader.full_name}
                                                                                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                                                                        onError={(e) => { e.target.src = '/assets/images/default.png'; }}
                                                                                    />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-medium text-gray-800 truncate">{leader.full_name}</p>
                                                                                        <p className="text-xs text-gray-500 truncate">{leader.position_name}</p>
                                                                                    </div>
                                                                                </motion.div>
                                                                            ))}
                                                                        </div>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 3. Families */}
                                                    {cooperative.families && cooperative.families.length > 0 && (
                                                        <div className="space-y-3">
                                                            <h6 className="font-semibold text-gray-700">Families</h6>
                                                            {cooperative.families.map((family) => (
                                                                <div key={family.family_id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                                                                    {/* Family Header */}
                                                                    <button
                                                                        onClick={() => toggleFamily(family.family_id)}
                                                                        className="w-full px-4 py-2.5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-7 h-7 bg-yellow-600 rounded-lg flex items-center justify-center text-white">
                                                                                <FaHome className="text-xs" />
                                                                            </div>
                                                                            <div className="text-left">
                                                                                <span className="font-medium text-gray-700">
                                                                                    {family.family_name}
                                                                                </span>
                                                                                <span className="ml-3 text-xs text-gray-500">
                                                                                    {family.members?.length || 0} Members
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-gray-400">Family</span>
                                                                            {expandedFamilies[family.family_id] ? (
                                                                                <FaChevronDown className="text-gray-400" />
                                                                            ) : (
                                                                                <FaChevronRight className="text-gray-400" />
                                                                            )}
                                                                        </div>
                                                                    </button>

                                                                    {/* Family Content */}
                                                                    {expandedFamilies[family.family_id] && (
                                                                        <div className="p-4 space-y-4">
                                                                            {/* Family Leader */}
                                                                            {family.leader && (
                                                                                <div className="text-center">
                                                                                    <h6 className="font-semibold text-gray-600 text-sm mb-3">Family Leader</h6>
                                                                                    <div className="inline-block bg-gray-50 rounded-xl p-4">
                                                                                        <img
                                                                                            src={getImageUrl(family.leader.photo)}
                                                                                            alt={family.leader.full_name}
                                                                                            className="w-20 h-20 rounded-full object-cover mx-auto"
                                                                                            onError={(e) => { e.target.src = '/assets/images/default.png'; }}
                                                                                        />
                                                                                        <p className="font-medium mt-2 text-gray-800">{family.leader.full_name}</p>
                                                                                        <p className="text-xs text-gray-500">{family.leader.position_name}</p>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Family Sector Leaders */}
                                                                            {family.sectorLeaders && family.sectorLeaders.length > 0 && (
                                                                                <div>
                                                                                    <h6 className="font-semibold text-gray-600 text-sm mb-2">Sector Leaders</h6>
                                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                                                        {family.sectorLeaders.map((leader) => (
                                                                                            <div key={leader.member_id} className="text-center bg-gray-50 rounded-lg p-3">
                                                                                                <img
                                                                                                    src={getImageUrl(leader.photo)}
                                                                                                    alt={leader.full_name}
                                                                                                    className="w-16 h-16 rounded-full object-cover mx-auto"
                                                                                                    onError={(e) => { e.target.src = '/assets/images/default.png'; }}
                                                                                                />
                                                                                                <p className="text-sm font-medium mt-1 truncate">{leader.full_name}</p>
                                                                                                <p className="text-xs text-gray-500 truncate">{leader.position_name}</p>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Family Members */}
                                                                            {family.members && family.members.length > 0 && (
                                                                                <div>
                                                                                    <h6 className="font-semibold text-gray-600 text-sm mb-2">Members</h6>
                                                                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                                                                        {family.members.map((member) => (
                                                                                            <div key={member.member_id} className="text-center bg-gray-50 rounded-lg p-2">
                                                                                                <img
                                                                                                    src={getImageUrl(member.photo)}
                                                                                                    alt={member.full_name}
                                                                                                    className="w-12 h-12 rounded-full object-cover mx-auto"
                                                                                                    onError={(e) => { e.target.src = '/assets/images/default.png'; }}
                                                                                                />
                                                                                                <p className="text-xs font-medium mt-1 truncate">{member.full_name}</p>
                                                                                                <p className="text-[10px] text-gray-400">Member</p>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </motion.div>

         

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-gray-400 py-4 border-t border-gray-100"
            >
                <p>© 2026 ICS PP Unity - All Rights Reserved</p>
            </motion.footer>
        </div>
    );
};

export default HierarchyPage;
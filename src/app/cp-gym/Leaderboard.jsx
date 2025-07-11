import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    User,
    ChevronUp,
    ChevronDown,
    Loader2,
    AlertCircle,
    Hash,
    Zap,
    Target,
    Star,
    Crown
} from 'lucide-react';

// Codeforces rank colors mapping
const getRankClass = (rating) => {
    if (!rating) return 'text-gray-400';

    if (rating >= 3000) return 'text-red-500'; // Legendary Grandmaster
    if (rating >= 2600) return 'text-red-500'; // International Grandmaster
    if (rating >= 2400) return 'text-red-500'; // Grandmaster
    if (rating >= 2300) return 'text-orange-500'; // International Master
    if (rating >= 2100) return 'text-orange-500'; // Master
    if (rating >= 1900) return 'text-purple-500'; // Candidate Master
    if (rating >= 1600) return 'text-blue-500'; // Expert
    if (rating >= 1400) return 'text-cyan-400'; // Specialist
    if (rating >= 1200) return 'text-green-500'; // Pupil
    return 'text-gray-400'; // Newbie
};

// Get gradient for user card
const getRankGradient = (rating) => {
    if (!rating) return 'from-gray-900/40 to-gray-800/50';

    if (rating >= 3000) return 'from-red-500/20 to-red-900/30';
    if (rating >= 2600) return 'from-red-500/20 to-red-800/30';
    if (rating >= 2400) return 'from-red-500/20 to-red-700/30';
    if (rating >= 2300) return 'from-orange-500/20 to-orange-700/30';
    if (rating >= 2100) return 'from-orange-500/20 to-orange-600/30';
    if (rating >= 1900) return 'from-purple-500/20 to-purple-600/30';
    if (rating >= 1600) return 'from-blue-500/20 to-blue-600/30';
    if (rating >= 1400) return 'from-cyan-400/20 to-cyan-500/30';
    if (rating >= 1200) return 'from-green-500/20 to-green-600/30';
    return 'from-gray-400/20 to-gray-500/30';
};

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });
    const [lastUpdated, setLastUpdated] = useState(null);
    const [userRatings, setUserRatings] = useState({});

    const fetchCodeforcesRatings = async (handles) => {
        if (!handles.length) return {};

        try {
            const response = await fetch(
                `https://codeforces.com/api/user.info?handles=${handles.join(';')}`
            );
            const result = await response.json();

            if (result.status === 'OK') {
                const ratings = {};
                result.result.forEach(user => {
                    if (user.handle) {
                        ratings[user.handle.toLowerCase()] = user.rating || 0;
                    }
                });
                return ratings;
            }
            return {};
        } catch (err) {
            console.error('Error fetching Codeforces ratings:', err);
            return {};
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch leaderboard data
            const response = await fetch('/api/leaderboard');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch leaderboard data');
            }

            const leaderboardData = result.data || [];

            // Fetch Codeforces ratings for all users
            const handles = leaderboardData.map(u => u.codeforcesHandle).filter(Boolean);
            const ratings = await fetchCodeforcesRatings(handles);
            setUserRatings(ratings);

            // Map API response with rank colors based on Codeforces rating
            const formattedData = leaderboardData.map(item => {
                const handle = item.codeforcesHandle || '';
                const rating = ratings[handle.toLowerCase()] || 0;

                return {
                    ...item,
                    codeforcesHandle: handle,
                    rankColor: getRankClass(rating),
                    rating: rating
                };
            });

            setData(formattedData);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError(err.message || 'Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Auto-refresh every 30 seconds
        const intervalId = setInterval(fetchData, 30000);
        return () => clearInterval(intervalId);
    }, []);



    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Function to get Codeforces profile URL
    const getProfileUrl = (handle) => {
        return `https://codeforces.com/profile/${encodeURIComponent(handle)}`;
    };

    const getSortedData = () => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (sortConfig.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />;
        }
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="w-4 h-4 text-blue-400" /> :
            <ChevronDown className="w-4 h-4 text-blue-400" />;
    };

    const getTrophyIcon = (rank) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />;
        if (rank === 2) return <Trophy className="w-6 h-6 text-gray-300 drop-shadow-lg" />;
        if (rank === 3) return <Trophy className="w-6 h-6 text-orange-400 drop-shadow-lg" />;
        return <Star className="w-5 h-5 text-gray-500" />;
    };

    const getTopThreeBackground = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border-yellow-500/30';
        if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gray-400/30';
        if (rank === 3) return 'bg-gradient-to-r from-orange-500/20 to-red-600/20 border-orange-500/30';
        return 'bg-gray-900/40 border-gray-800/50';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-6" />
                        <div className="absolute inset-0 w-16 h-16 bg-blue-400/20 rounded-full blur-xl mx-auto"></div>
                    </div>
                    <p className="text-gray-300 text-xl font-medium">Loading leaderboard...</p>
                    <div className="mt-4 flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                        <div className="absolute inset-0 w-16 h-16 bg-red-400/20 rounded-full blur-xl mx-auto"></div>
                    </div>
                    <p className="text-red-400 text-xl mb-6 font-medium">{error}</p>
                    <button
                        onClick={fetchData}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="mb-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
                                <div className="absolute inset-0 w-10 h-10 bg-yellow-400/20 rounded-full blur-lg"></div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                    Leaderboard
                                </h1>
                                <p className="text-gray-400 mt-1">Compete • Dominate • Excel</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Leaderboard */}
                    <motion.div
                        className="bg-gray-900/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Header */}
                        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-8 py-6">
                            <div className="grid grid-cols-12 gap-6">
                                <div
                                    className="col-span-2 flex items-center space-x-3 cursor-pointer group hover:text-blue-400 transition-all duration-200"
                                    onClick={() => handleSort('rank')}
                                >
                                    <Hash className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                    <span className="font-semibold text-gray-200 group-hover:text-white">Rank</span>
                                    <SortIcon columnKey="rank" />
                                </div>
                                <div
                                    className="col-span-8 flex items-center space-x-3 cursor-pointer group hover:text-blue-400 transition-all duration-200"
                                    onClick={() => handleSort('codeforcesHandle')}
                                >
                                    <User className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                    <span className="font-semibold text-gray-200 group-hover:text-white">Codeforces Handle</span>
                                    <SortIcon columnKey="codeforcesHandle" />
                                </div>
                                <div
                                    className="col-span-2 flex items-center space-x-3 cursor-pointer group hover:text-blue-400 transition-all duration-200"
                                    onClick={() => handleSort('problemsSolved')}
                                >
                                    <Target className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                    <span className="font-semibold text-gray-200 group-hover:text-white">Solved</span>
                                    <SortIcon columnKey="problemsSolved" />
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="divide-y divide-gray-800/30">
                            <AnimatePresence>
                                {getSortedData().map((participant, index) => (
                                    <motion.div
                                        key={`${participant.codeforcesHandle}-${index}`}
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.03,
                                            type: "spring",
                                            stiffness: 100
                                        }}
                                        className={`relative overflow-hidden group hover:bg-gray-800/30 transition-all duration-300 px-8 py-6`}
                                        style={{
                                            backgroundImage: `linear-gradient(to right, ${getRankGradient(participant.rating).replace('from-', '').split(' to-')[0]}, rgba(0,0,0,0.7))`,
                                            borderLeft: `4px solid ${getRankGradient(participant.rating).split(' ')[0].replace('from-', '').split('/')[0]}`
                                        }}
                                    >
                                        <div className="grid grid-cols-12 gap-6 items-center">
                                            {/* Rank */}
                                            <div className="col-span-2 flex items-center space-x-4">
                                                <div className="relative">
                                                    {getTrophyIcon(participant.rank)}
                                                    {participant.rank <= 3 && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent rounded-full blur-sm"></div>
                                                    )}
                                                </div>
                                                <span className="text-2xl font-bold text-white drop-shadow-sm">
                                                    {participant.rank}
                                                </span>
                                            </div>

                                            {/* Handle */}
                                            <div className="col-span-8 flex items-center space-x-3">
                                                <div className="relative">
                                                    <div className="relative">
                                                        <a
                                                            href={getProfileUrl(participant.codeforcesHandle)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`text-xl font-bold ${participant.rankColor || 'text-gray-400'} drop-shadow-sm hover:underline`}
                                                        >
                                                            {participant.codeforcesHandle}
                                                        </a>

                                                    </div>
                                                    <div className={`absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${getRankGradient(participant.rating)} transition-all duration-300`}></div>
                                                </div>
                                                <a
                                                    href={getProfileUrl(participant.codeforcesHandle)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                                >
                                                    <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            </div>

                                            {/* Problems */}
                                            <div className="col-span-2 flex items-center space-x-2">
                                                <span className="text-xl font-bold text-white drop-shadow-sm">
                                                    {participant.solvedCount}
                                                </span>
                                                <div className="text-sm text-gray-400 font-medium">solved</div>
                                            </div>
                                        </div>

                                        {/* Hover Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="inline-flex items-center space-x-4 bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl px-6 py-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <p className="text-gray-400 font-medium">
                                <span className="text-white font-semibold">{data.length}</span> participants competing
                            </p>
                            <div className="w-px h-4 bg-gray-700"></div>
                            <p className="text-gray-400 font-medium">
                                Updated: <span className="text-white">{lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}</span>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
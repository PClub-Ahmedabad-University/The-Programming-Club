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
    Clock,
    Star,
    Crown,
    ExternalLink,
    Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';


// Get gradient for user card background
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

// Get Codeforces profile URL
const getProfileUrl = (handle) => {
    return `https://codeforces.com/profile/${encodeURIComponent(handle)}`;
};

// Normalize handle for case-insensitive comparison
const normalizeHandle = (handle) => handle?.toLowerCase() || '';

// Get text color class based on Codeforces rating
const getRankClass = (rating) => {
    if (!rating && rating !== 0) return 'text-gray-400';
    if (rating >= 3000) return 'text-red-500';
    if (rating >= 2400) return 'text-red-500';
    if (rating >= 2300) return 'text-orange-500';
    if (rating >= 2100) return 'text-orange-500';
    if (rating >= 1900) return 'text-purple-500';
    if (rating >= 1600) return 'text-blue-500';
    if (rating >= 1400) return 'text-cyan-400';
    if (rating >= 1200) return 'text-green-500';
    return 'text-gray-300'; // For rated users below 1200
};

const Leaderboard = ({ data = [], isLoading = false, error = null }) => {
    const router = useRouter();
    const [sortConfig, setSortConfig] = useState({ key: 'solvedCount', direction: 'desc' });
    const [userRatings, setUserRatings] = useState({});
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    
    // Format time from milliseconds to HH:MM:SS
    const formatTime = (ms) => {
        if (!ms) return '00:00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    };
    
    // Get rating for a handle with case-insensitive lookup
    const getRating = (handle) => {
        if (!handle) return null;
        // Try exact match first
        if (userRatings[handle] !== undefined) return userRatings[handle];
        // Fallback to case-insensitive match
        const normalizedHandle = normalizeHandle(handle);
        const matchingHandle = Object.keys(userRatings).find(
            h => normalizeHandle(h) === normalizedHandle
        );
        return matchingHandle ? userRatings[matchingHandle] : null;
    };

    // Process data to include formatted time, rating info, and apply search filter
    const processedData = React.useMemo(() => {
        // First, process the data with ratings and formatting
        let processed = data.map((entry, index) => {
            const rating = getRating(entry.codeforcesHandle);
            return {
                ...entry,
                // Store the original rank before any search/sorting
                originalRank: entry.rank || index + 1,
                formattedTime: formatTime(entry.totalTimeMs),
                rating,
                rankClass: getRankClass(rating),
                rankGradient: getRankGradient(rating)
            };
        });

        // Apply search filter if searchTerm exists
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            processed = processed.filter(participant => {
                return (
                    (participant.codeforcesHandle && 
                     participant.codeforcesHandle.toLowerCase().includes(searchLower)) ||
                    (participant.originalRank && 
                     participant.originalRank.toString().includes(searchTerm))
                );
            });
        }

        return processed;
    }, [data, userRatings, searchTerm]);

    // Fetch Codeforces ratings when data changes
    useEffect(() => {
        const fetchRatings = async () => {
            const handles = data
                .map(u => u.codeforcesHandle)
                .filter(Boolean)
                .filter(handle => !userRatings[handle]); // Only fetch if not already in cache
                
            if (handles.length === 0) return;
            
            try {
                const response = await fetch(
                    `https://codeforces.com/api/user.info?handles=${handles.join(';')}`
                );
                const result = await response.json();
                
                if (result.status === 'OK') {
                    const newRatings = {};
                    result.result.forEach(user => {
                        if (user.rating !== undefined) {
                            // Find the original handle from our data to preserve case
                            const originalHandle = data.find(
                                u => u.codeforcesHandle && 
                                normalizeHandle(u.codeforcesHandle) === normalizeHandle(user.handle)
                            )?.codeforcesHandle || user.handle;
                            newRatings[originalHandle] = user.rating;
                        }
                    });
                    
                    setUserRatings(prev => ({
                        ...prev,
                        ...newRatings
                    }));
                }
            } catch (error) {
                console.error('Error fetching user ratings:', error);
            }
        };
        
        fetchRatings();
    }, [data]); // Only depend on data, not userRatings

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                direction = 'desc';
            } else {
                // If already sorted desc, reset to default
                setSortConfig({ key: 'solvedCount', direction: 'desc' });
                return;
            }
        }
        setSortConfig({ key, direction });
    };

    const getProfileUrl = (handle) => `https://codeforces.com/profile/${encodeURIComponent(handle)}`;

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />;
        }
        return sortConfig.direction === 'asc' ? (
            <ChevronUp className="w-4 h-4 text-blue-400" />
        ) : (
            <ChevronDown className="w-4 h-4 text-blue-400" />
        );
    };

    const getTrophyIcon = (rank) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
        if (rank === 2) return <Trophy className="w-5 h-5 text-gray-300" />;
        if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
        return <Hash className="w-4 h-4 text-gray-400" />;
    };

    const getTopThreeBackground = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500/20';
        if (rank === 2) return 'bg-gradient-to-r from-gray-500/10 to-gray-600/5 border-gray-400/20';
        if (rank === 3) return 'bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-600/20';
        return 'bg-gray-900/40 border-gray-800/50';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-6" />
                        <div className="absolute inset-0 w-16 h-16 bg-blue-400/20 rounded-full blur-xl mx-auto"></div>
                    </div>
                    <p className="text-gray-300 text-xl font-medium">Loading leaderboard...</p>
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
                    <p className="text-red-400 text-xl mb-6 font-medium">
                        {error.message || 'Failed to load leaderboard'}
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            
            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="mb-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="space-y-4 mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
                                <div className="text-sm text-gray-400">
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </div>
                            </div>
                            
                            {/* Search Bar */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="Search by handle or rank..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <motion.div
                            className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800/50 overflow-hidden shadow-2xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-8 py-6">
                                <div className="grid grid-cols-4 gap-4 items-center">
                                    <div className="flex items-center justify-center">
                                        <span className="text-gray-300 font-medium">Rank</span>
                                        <button
                                            onClick={() => handleSort('rank')}
                                            className="p-1 rounded-md hover:bg-gray-700/50 transition-colors group ml-1"
                                        >
                                            <SortIcon columnKey="rank" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <span className="text-gray-300 font-medium">Handle</span>
                                        <button
                                            onClick={() => handleSort('codeforcesHandle')}
                                            className="p-1 rounded-md hover:bg-gray-700/50 transition-colors group ml-1"
                                        >
                                            <SortIcon columnKey="codeforcesHandle" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <span className="text-gray-300 font-medium">Solved</span>
                                        <button
                                            onClick={() => handleSort('solvedCount')}
                                            className="p-1 rounded-md hover:bg-gray-700/50 transition-colors group ml-1"
                                        >
                                            <SortIcon columnKey="solvedCount" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <span className="text-gray-300 font-medium">Time</span>
                                        <button
                                            onClick={() => handleSort('totalTimeMs')}
                                            className="p-1 rounded-md hover:bg-gray-700/50 transition-colors group ml-1"
                                        >
                                            <SortIcon columnKey="totalTimeMs" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <AnimatePresence>
                                {processedData.map((participant, index) => (
                                    <motion.div
                                        key={participant.codeforcesHandle}
                                        className={`px-8 py-6 border-l-4 ${getTopThreeBackground(participant.originalRank)} hover:bg-gray-800/30 transition-colors`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="grid grid-cols-4 gap-4 items-center">
                                            {/* Rank Column */}
                                            <div className="flex items-center justify-center">
                                                <div className="flex items-center">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/50 border border-gray-700/50">
                                                            {getTrophyIcon(participant.originalRank)}
                                                        </div>
                                                        {participant.originalRank <= 3 && (
                                                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                                {participant.originalRank}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`text-lg font-semibold ml-2 ${participant.originalRank <= 3 ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                        {participant.originalRank}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Handle Column */}
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${participant.rankGradient} flex items-center justify-center`}>
                                                    <User className="w-5 h-5 text-white/80" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <a
                                                        href={getProfileUrl(participant.codeforcesHandle)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`${participant.rankClass} hover:text-blue-400 transition-colors font-medium flex items-center`}
                                                    >
                                                        {participant.codeforcesHandle}
                                                        <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                                                    </a>
                                                </div>
                                            </div>
                                            
                                            {/* Solved Count */}
                                            <div className="text-center">
                                                <span className="text-blue-400 font-bold">{participant.solvedCount || 0}</span>
                                            </div>
                                            
                                            {/* View Profile Button */}
                                            <div className="text-right">
                                                <button 
                                                    onClick={() => router.push(`/cp-gym/${participant.codeforcesHandle}`)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    className="mt-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <p className="text-gray-500 text-sm">
                        Leaderboard updates every 15 seconds • Last updated: {lastUpdated.toLocaleString()}
                    </p>
                </motion.div>
                </div>
            </div>
        // </div>
    );
};

export default Leaderboard;

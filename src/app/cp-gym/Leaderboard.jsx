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
    return 'from-gray-600/20 to-gray-500/30';
};

// Get Codeforces profile URL
const getProfileUrl = (handle) => {
    return `https://codeforces.com/profile/${encodeURIComponent(handle)}`;
};

// Normalize handle for case-insensitive comparison
const normalizeHandle = (handle) => handle?.toLowerCase() || '';

// Get text color class based on Codeforces rating
const getRankClass = (rating) => {
    if (!rating && rating !== 0) return 'text-gray-100'; // unrated
  
    if (rating >= 3000) return 'text-red-700';        // Legendary GM
    if (rating >= 2400) return 'text-red-500';        // GM & IGM
    if (rating >= 2300) return 'text-orange-600';     // IM
    if (rating >= 2100) return 'text-orange-500';     // Master
    if (rating >= 1900) return 'text-purple-500';     // Candidate Master
    if (rating >= 1600) return 'text-blue-500';       // Expert
    if (rating >= 1400) return 'text-cyan-500';       // Specialist
    if (rating >= 1200) return 'text-green-500';      // Pupil
    return 'text-gray-300/50';                        // Newbie
  };
  
  

const Leaderboard = ({ data = [], isLoading = false, error = null }) => {
    const router = useRouter();
    const [sortConfig, setSortConfig] = useState({ key: 'solvedCount', direction: 'desc' });
    const [userRatings, setUserRatings] = useState({});
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    // Tab state: 'all' | 'weekly'
    const [activeTab, setActiveTab] = useState('all');
    const [weeklyData, setWeeklyData] = useState([]);
    const [weeklyLoading, setWeeklyLoading] = useState(false);
    const [weeklyError, setWeeklyError] = useState(null);
    const [weeklyRange, setWeeklyRange] = useState(null); // { weekStart, weekEnd }

    useEffect(() => {
        setLastUpdated(new Date());
    }, [data]);
    
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

    const formatWeekDate = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const getRating = (handle) => {
        if (!handle) return null;
        if (userRatings[handle] !== undefined) return userRatings[handle];
        const normalizedHandle = normalizeHandle(handle);
        const matchingHandle = Object.keys(userRatings).find(
            h => normalizeHandle(h) === normalizedHandle
        );
        return matchingHandle ? userRatings[matchingHandle] : null;
    };

    // Determine which raw dataset to display based on active tab
    const displayedRawData = React.useMemo(() => {
        return activeTab === 'all' ? data : weeklyData;
    }, [activeTab, data, weeklyData]);

    const processedData = React.useMemo(() => {
        let processed = displayedRawData.map((entry, index) => {
            const rating = getRating(entry.codeforcesHandle);
            return {
                ...entry,
                originalRank: entry.rank || index + 1,
                formattedTime: formatTime(entry.totalTimeMs),
                rating,
                rankClass: getRankClass(rating),
                rankGradient: getRankGradient(rating)
            };
        });

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
    }, [displayedRawData, userRatings, searchTerm]);

    // Fetch weekly leaderboard when switching to the weekly tab (lazy load)
    useEffect(() => {
        const fetchWeekly = async () => {
            if (activeTab !== 'weekly' || weeklyData.length > 0 || weeklyLoading) return;
            setWeeklyLoading(true);
            setWeeklyError(null);
            try {
                const res = await fetch('/api/leaderboard/weekly', { cache: 'no-store' });
                const json = await res.json();
                console.log(json);
                if (!json.success) throw new Error(json.error || 'Failed to fetch weekly leaderboard');
                // API returns a document; extract its leaderboard array
                const entries = Array.isArray(json.data?.leaderboard) ? json.data.leaderboard : [];
                setWeeklyData(entries);
                setWeeklyRange({ weekStart: json.data?.weekStart, weekEnd: json.data?.weekEnd });
                setLastUpdated(new Date());
            } catch (e) {
                console.error('Error fetching weekly leaderboard:', e);
                setWeeklyError(e);
            } finally {
                setWeeklyLoading(false);
            }
        };
        fetchWeekly();
    }, [activeTab, weeklyData.length, weeklyLoading]);

    useEffect(() => {
        const fetchRatings = async () => {
            const handles = displayedRawData
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
                            const originalHandle = displayedRawData.find(
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
    }, [displayedRawData, data]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                direction = 'desc';
            } else {
                setSortConfig({ key: 'solvedCount', direction: 'desc' });
                return;
            }
        }
        setSortConfig({ key, direction });
    };

    const getProfileUrl = (handle) => `https://codeforces.com/profile/${encodeURIComponent(handle)}`;


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

    // Loading state depends on active tab
    if ((activeTab === 'all' && isLoading) || (activeTab === 'weekly' && weeklyLoading)) {
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
                    <p className="text-gray-300 text-xl font-medium">Loading {activeTab === 'all' ? 'leaderboard' : 'last week leaderboard'}...</p>
                </motion.div>
            </div>
        );
    }

    const effectiveError = activeTab === 'all' ? error : weeklyError;
    if (effectiveError) {
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
                        {effectiveError.message || 'Failed to load leaderboard'}
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
            {/* Blurred Background Circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
    
            {/* Main Content */}
            <div className="relative z-10 p-4 sm:p-6">
                <motion.div
                    className="mb-6 sm:mb-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header Section */
                    }
                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                            <h2 className="text-lg sm:text-2xl font-bold text-white">Leaderboard</h2>

                        </div>

                        {/* Subcategory Tabs */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                    activeTab === 'all'
                                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                                        : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-800/70'
                                }`}
                                aria-pressed={activeTab === 'all'}
                            >
                                All time
                            </button>
                            <button
                                onClick={() => setActiveTab('weekly')}
                                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                    activeTab === 'weekly'
                                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                                        : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-800/70'
                                }`}
                                aria-pressed={activeTab === 'weekly'}
                            >
                                Last week
                            </button>
                        </div>

                        {/* Week Range for Last week */}
                        {activeTab === 'weekly' && weeklyRange && (
                            <div className="text-xs sm:text-sm text-gray-400">
                                Week: {formatWeekDate(weeklyRange.weekStart)} – {formatWeekDate(weeklyRange.weekEnd)}
                            </div>
                        )}
    
                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-9 sm:pl-10 pr-8 py-2 text-sm sm:text-base border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                placeholder="Search by handle or rank..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search leaderboard"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    aria-label="Clear search"
                                >
                                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
    
                    {/* Leaderboard Table */}
                    <motion.div
                        className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800/50 overflow-hidden shadow-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Header Row (Visible on larger screens) */}
                        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-4 sm:px-8 py-4 sm:py-6 hidden sm:block">
                            <div className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-2 flex items-center justify-center">
                                    <span className="text-gray-300 font-medium text-base">Rank</span>
                                    <button onClick={() => handleSort('rank')} className="ml-1 p-1 rounded-md hover:bg-gray-700/50 transition-colors" aria-label="Sort by rank">
                                        {/* <SortIcon columnKey="rank" /> */}
                                    </button>
                                </div>
                                <div className="col-span-6 flex items-center justify-center">
                                    <span className="text-gray-300 font-medium text-base">Handle</span>
                                    <button onClick={() => handleSort('codeforcesHandle')} className="ml-1 p-1 rounded-md hover:bg-gray-700/50 transition-colors" aria-label="Sort by handle">
                                        {/* <SortIcon columnKey="codeforcesHandle" /> */}
                                    </button>
                                </div>
                                <div className="col-span-2 flex items-center justify-center">
                                    <span className="text-gray-300 font-medium text-base">Solved</span>
                                </div>
                                <div className="col-span-2 flex items-center justify-center">
                                    <span className="text-gray-300 font-medium text-base">Action</span>
                                </div>
                            </div>
                        </div>
    
                        {/* Participant Rows */}
                        <AnimatePresence>
                            {processedData.map((participant) => (
                                <motion.div
                                    key={participant.codeforcesHandle}
                                    className={`px-4 sm:px-6 py-4 border-l-4 ${getTopThreeBackground(participant.originalRank)} hover:bg-gray-800/30 transition-colors`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="grid grid-cols-12 sm:grid-cols-12 gap-y-4 sm:gap-2 items-center">
                                        {/* Rank */}
                                        <div className="col-span-12 sm:col-span-2 flex sm:justify-center items-center">
                                            <div className="flex items-center">
                                                <div className="relative">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-800/50 border border-gray-700/50">
                                                        {getTrophyIcon(participant.originalRank)}
                                                    </div>
                                                    {participant.originalRank <= 3 && (
                                                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-yellow-500 text-yellow-900 text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                                                            {participant.originalRank}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`ml-2 text-sm sm:text-lg font-semibold ${participant.originalRank <= 3 ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                    {participant.originalRank}
                                                </span>
                                            </div>
                                        </div>
    
                                        {/* Handle */}
                                        <div className="col-span-12 sm:col-span-6 flex items-center space-x-3 sm:space-x-4 overflow-hidden">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${participant.rankGradient} flex-shrink-0 flex items-center justify-center`}>
                                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <a
                                                    href={getProfileUrl(participant.codeforcesHandle)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`${participant.rankClass} hover:text-blue-400 transition-colors font-medium flex items-center text-sm sm:text-base`}
                                                >
                                                    <span className="truncate ">{participant.codeforcesHandle}</span>
                                                    <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 opacity-70 flex-shrink-0" />
                                                </a>
                                            </div>
                                        </div>
    
                                        {/* Solved */}
                                        <div className="col-span-6 sm:col-span-2 flex items-center justify-center sm:justify-center">
                                            <div className="flex flex-col items-center sm:items-start">
                                                <span className="text-xs text-gray-400 sm:hidden">Solved</span>
                                                <span className="text-blue-400 font-bold text-sm sm:text-base">{participant.solvedCount || 0}</span>
                                            </div>
                                        </div>
    
                                        {/* Button */}
                                        <div className="col-span-6 sm:col-span-2 flex justify-end">
                                            <button
                                                onClick={() => router.push(`/cp-gym/${participant.codeforcesHandle}`)}
                                                className="inline-flex items-center px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto justify-center"
                                                aria-label={`View ${participant.codeforcesHandle}'s profile`}
                                            >
                                                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                                                <span>View Gym Profile</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
    
            </div>
        </div>
    );
    
};

export default Leaderboard;

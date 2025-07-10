'use client'
import React, { useState, useEffect } from 'react';
import { ExternalLink, User, Code, Trophy, CheckCircle, XCircle, Users, Target, Zap, Award, TrendingUp, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRankColor } from '@/lib/cfUtils';


const CPGymPage = () => {
    const [activeTab, setActiveTab] = useState('questions');
    const [problems, setProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userProgress, setUserProgress] = useState({
        username: "",
        handle: "",
        codeforcesRank: "",
        solved: 0,
        rank: "NA"
    });
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                const data = await response.json();
                console.log(data);
                setUserProgress({
                    username: data.data.name,
                    handle: data.data.codeforcesHandle,
                    codeforcesRank: data.data.codeforcesRank,
                    solved: 0,
                    rank: "NA"
                });
            } catch (err) {
                console.error('Error fetching user:', err);
                setError(err.message || 'Failed to load user');
            }
            if(userProgress.handle === "") {
                return(
                    <div className="min-h-screen font-content bg-pclubBg text-white overflow-hidden relative">
                        <p>Please add your codeforces handle through profile section to access CP Gym</p>
                        <p className='text-gray-500'>Make sure you are logged in</p>
                        <p className='text-gray-500'>Click on top right profile icon and add your codeforces handle</p>
                    </div>
                );
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/cp/post-problem');

                if (!response.ok) {
                    throw new Error('Failed to fetch problems');
                }

                const data = await response.json();
                if (data.success && data.problems) {
                    // Map the API response to match the expected format
                    const formattedProblems = data.problems.map(problem => {
                        // Convert UTC date to Indian time
                        const postedDate = new Date(problem.postedAt);
                        const options = { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Kolkata'
                        };
                        const indianTime = postedDate.toLocaleString('en-IN', options);
                        
                        return {
                            id: problem.problemId,
                            title: problem.title,
                            status: problem.status || 'unsolved',
                            link: problem.link,
                            postedAt: indianTime
                        };
                    });

                    setProblems(formattedProblems);

                    // Update solved count based on problems status
                    setUserProgress(prev => ({
                        ...prev,
                        solved: formattedProblems.filter(p => p.status === 'solved').length,
                        total: formattedProblems.length
                    }));
                }
            } catch (err) {
                console.error('Error fetching problems:', err);
                setError(err.message || 'Failed to load problems');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProblems();
    }, []);

    const handleVerify = async (problemId) => {
        try {
            // Add your verification logic here
            console.log(`Verifying problem: ${problemId}`);

            // Example verification logic (replace with your actual verification)
            // const response = await fetch(`/api/verify-problem/${problemId}`, {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify({ problemId }),
            // });

            // if (response.ok) {
            //   // Update problem status in local state
            //   setProblems(prev => 
            //     prev.map(p => 
            //       p.id === problemId ? { ...p, status: 'solved' } : p
            //     )
            //   );
            // }
        } catch (err) {
            console.error('Error verifying problem:', err);
        }
    };

    return (
        <div className="min-h-screen font-content bg-pclubBg text-white overflow-hidden relative">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 bg-pclubBg"></div>
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-900/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

                {/* Floating particles */}
                <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400/60 rounded-full animate-ping"></div>
                <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/60 rounded-full animate-ping delay-300"></div>
                <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-ping delay-700"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 sm:mb-8"
                >
                    <section className="relative pt-6 sm:pt-10 pb-8 sm:pb-12 px-2 sm:px-4 md:px-8 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider relative inline-block mb-3 sm:mb-4">
                            <span className="text-white font-heading relative z-10 border-2 sm:border-3 border-blue-400 rounded-lg px-4 sm:px-8 lg:px-12 py-2 sm:py-3 lg:py-4 text-4xl sm:text-4xl md:text-5xl lg:text-6xl">
                                CP Gym
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
                        </h1>
                    </section>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
                        Solve handpicked Codeforces problems, verify your solutions, and climb the leaderboard.
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                        <span className="ml-3 text-lg text-gray-300">Loading problems...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-800/50 text-red-200 p-6 rounded-xl text-center">
                        <p className="text-lg font-medium">Failed to load problems</p>
                        <p className="text-sm mt-2 text-red-300">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-800/50 hover:bg-red-800/70 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-screen mx-auto px-4 sm:px-6 py-8 w-full">
                        {/* Left Sidebar - Progress */}
                        <div className="lg:col-span-3">
                            <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-gray-800/30 p-6 sticky top-8 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[cyan-500] to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Progress</h2>
                                        <p className="text-gray-500 text-sm">Your journey</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Username */}
                                    <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/30 hover:border-cyan-500/30 transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Username</p>
                                                <p className="font-bold text-white text-lg">{userProgress.username}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Codeforces Handle */}
                                    <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/30 hover:border-orange-500/30 transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                                <Code className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Handle</p>
                                                <a
                                                    href={`https://codeforces.com/profile/${userProgress.handle}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xl font-medium hover:underline transition-colors"
                                                    style={{ color: getRankColor(userProgress.codeforcesRank) }}
                                                >
                                                    {userProgress.handle}
                                                </a> </div>
                                        </div>
                                    </div>

                                    {/* Problems Solved */}
                                    <div className="bg-gradient-to-br from-emerald-950/50 to-teal-950/50 rounded-2xl p-4 border border-emerald-800/30 hover:border-emerald-600/50 transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Solved</p>
                                                <p className="font-bold text-white text-2xl">
                                                    {userProgress.solved}<span className="text-gray-600">/{problems.length}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-800/50 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-emerald-500/30"
                                                style={{ width: `${(userProgress.solved / problems.length) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-emerald-400 text-xs mt-2 font-medium">
                                            {Math.round((userProgress.solved / problems.length) * 100)}% Complete
                                        </p>
                                    </div>

                                    {/* Current Rank */}
                                    <div className="bg-gradient-to-br from-yellow-950/50 to-orange-950/50 rounded-2xl p-4 border border-yellow-800/30 hover:border-yellow-600/50 transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                                <Trophy className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Rank</p>
                                                <p className="font-bold text-white text-2xl">#{userProgress.rank}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <TrendingUp className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-9">
                            {/* Tab Navigation */}
                            <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-gray-800/30 mb-8 p-3 shadow-2xl">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveTab('questions')}
                                        className={`flex-1 px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${activeTab === 'questions'
                                                ? 'bg-gradient-to-r from-[#00E1FD] to-[#0a058d] text-white shadow-lg shadow-cyan-500/30'
                                                : 'text-gray-500 hover:text-white hover:bg-gray-900/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Code className="w-4 h-4" />
                                            Problems
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('leaderboard')}
                                        className={`flex-1 px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${activeTab === 'leaderboard'
                                                ? 'bg-gradient-to-r from-[#00E1FD] to-[#0a058d] text-white shadow-lg shadow-cyan-500/30'
                                                : 'text-gray-500 hover:text-white hover:bg-gray-900/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Leaderboard
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'questions' && (
                                <div className="space-y-4">
                                    {problems.map((problem, index) => (
                                        <div
                                            key={problem.id}
                                            className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-gray-800/30 p-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:border-gray-700/50 group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${problem.status === 'solved'
                                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                                                                : 'bg-gray-900/50 border border-gray-800/30 group-hover:bg-gray-800/50'
                                                            }`}>
                                                            {problem.status === 'solved' ? (
                                                                <CheckCircle className="w-6 h-6 text-white" />
                                                            ) : (
                                                                <XCircle className="w-6 h-6 text-gray-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-lg font-bold font-mono text-cyan-400">{problem.id}</span>
                                                                <div className="flex items-center text-xs text-gray-400">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {problem.postedAt}
                                                                </div>
                                                            </div>
                                                            <a href={problem.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                                <h3 className="font-bold text-white text-xl mb-1 cursor-pointer hover:underline">{problem.title}</h3>
                                                                <ExternalLink size={14} />
                                                            </a>
                                                            <p className="text-gray-500 text-sm">Problem #{problems.length-index}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className={`px-4 py-2 rounded-2xl font-bold text-sm border ${problem.status === 'solved'
                                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                            : 'bg-gray-900/50 text-gray-500 border-gray-800/30'
                                                        }`}>
                                                        {problem.status === 'solved' ? (
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle className="w-4 h-4" />
                                                                Solved
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <XCircle className="w-4 h-4" />
                                                                Unsolved
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleVerify(problem.id)}
                                                        className="px-6 py-3 bg-gradient-to-r from-[#073496] to-[#0a058d] text-white font-bold rounded-2xl hover:from-blue-800 hover:to-blue-900 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="w-4 h-4" />
                                                            Check Submission
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'leaderboard' && (
                                <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-gray-800/30 p-16 shadow-2xl">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                                            <Award className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4">Leaderboard</h3>
                                        <p className="text-gray-500 text-lg mb-8">Coming Soon...</p>
                                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/30">
                                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                                            <span className="text-cyan-400 font-medium">Rankings will be available soon</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CPGymPage;
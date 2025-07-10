'use client'
import React, { useState, useEffect } from 'react';
import { User, Code, Trophy, CheckCircle, XCircle, Users, Target, Zap, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const CPGymPage = () => {
  const [activeTab, setActiveTab] = useState('questions');

  const [userProgress, setUserProgress] = useState({
    username: "Loading...",
    handle: "loading",
    solved: 0,
    total: 0,
    rank: 0
  });
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState(new Set());

  // Load solved problems from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSolved = localStorage.getItem('solvedProblems');
      if (savedSolved) {
        try {
          const parsed = JSON.parse(savedSolved);
          setSolvedProblems(new Set(parsed));
          
          // Update solved count in user progress
          setUserProgress(prev => ({
            ...prev,
            solved: parsed.length
          }));
        } catch (e) {
          console.error('Error parsing solved problems:', e);
        }
      }
    }
  }, []);

  // Fetch problems from the API
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/cp/get-problems');
        
        if (!response.ok) {
          throw new Error('Failed to fetch problems');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Mark problems as solved based on local storage
          const problemsWithStatus = data.data.problems.map(problem => ({
            ...problem,
            status: solvedProblems.has(problem.id) ? 'solved' : 'unsolved'
          }));
          
          setProblems(problemsWithStatus);
          
          // Update total count
          setUserProgress(prev => ({
            ...prev,
            total: data.data.problems.length
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
  }, [solvedProblems]);

  const handleVerify = async (problemId) => {
    try {
      // In a real app, you would verify with the Codeforces API here
      // For now, we'll just mark it as solved in local storage
      const newSolved = new Set([...solvedProblems, problemId]);
      
      // Update local state
      setSolvedProblems(newSolved);
      
      // Update the problem status in the problems array
      setProblems(prevProblems => 
        prevProblems.map(problem => 
          problem.id === problemId 
            ? { ...problem, status: 'solved' } 
            : problem
        )
      );
      
      // Update user progress
      setUserProgress(prev => ({
        ...prev,
        solved: newSolved.size
      }));
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('solvedProblems', JSON.stringify([...newSolved]));
      }
      
      // Show success message
      alert('Problem marked as solved!');
      
    } catch (error) {
      console.error('Error verifying problem:', error);
      alert('Failed to verify problem. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-900/20 rounded-full blur-3xl animate-pulse delay-700"></div>
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
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Sidebar - Your Progress */}
          <div className="w-full xl:w-96 flex-shrink-0">
            <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-gray-800/30 p-6 sticky top-8 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
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
                      <p className="font-bold text-white text-lg">{userProgress.handle}</p>
                    </div>
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
                        {userProgress.solved}<span className="text-gray-600">/{userProgress.total}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-emerald-500/30"
                      style={{ width: `${(userProgress.solved / userProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-emerald-400 text-xs mt-2 font-medium">
                    {Math.round((userProgress.solved / userProgress.total) * 100)}% Complete
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
                      <span className="text-xs font-medium">↗</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Tab Navigation */}
            <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-gray-800/30 mb-8 p-3 shadow-2xl">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex-1 px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${
                    activeTab === 'questions'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
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
                  className={`flex-1 px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${
                    activeTab === 'leaderboard'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
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
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            problem.status === 'solved' 
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
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                problem.difficulty === 'Easy' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : problem.difficulty === 'Medium'
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {problem.difficulty}
                              </span>
                            </div>
                            <h3 className="font-bold text-white text-xl mb-1">{problem.title}</h3>
                            <p className="text-gray-500 text-sm">Problem #{index + 1}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-2xl font-bold text-sm border ${
                          problem.status === 'solved'
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
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black"
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Verify
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
      </div>
    </div>
  );
};

export default CPGymPage;
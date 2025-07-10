'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, ExternalLink, Loader2, Search, AlertCircle, Users, Activity, TrendingUp
} from 'lucide-react';

// Helper function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Helper function to get verdict color and text
const getVerdictInfo = (verdict) => {
  if (!verdict) return { text: 'In Queue', color: 'bg-slate-500 text-slate-100' };
  
  const verdictMap = {
    'OK': { text: 'Accepted', color: 'bg-emerald-500 text-emerald-50' },
    'WRONG_ANSWER': { text: 'Wrong Answer', color: 'bg-red-500 text-red-50' },
    'TIME_LIMIT_EXCEEDED': { text: 'Time Limit Exceeded', color: 'bg-amber-500 text-amber-50' },
    'MEMORY_LIMIT_EXCEEDED': { text: 'Memory Limit Exceeded', color: 'bg-orange-500 text-orange-50' },
    'RUNTIME_ERROR': { text: 'Runtime Error', color: 'bg-purple-500 text-purple-50' },
    'COMPILATION_ERROR': { text: 'Compilation Error', color: 'bg-blue-500 text-blue-50' },
    'SKIPPED': { text: 'Skipped', color: 'bg-slate-400 text-slate-50' },
    'TESTING': { text: 'Testing', color: 'bg-cyan-500 text-cyan-50' },
    'PARTIAL': { text: 'Partial', color: 'bg-yellow-500 text-yellow-50' },
    'CHALLENGED': { text: 'Hacked', color: 'bg-red-700 text-red-50' },
    'REJECTED': { text: 'Rejected', color: 'bg-slate-700 text-slate-50' },
  };

  return verdictMap[verdict] || { text: verdict, color: 'bg-slate-600 text-slate-50' };
};

// Helper function to get rank color
const getRankColor = (rank) => {
  if (!rank) return 'text-slate-400';
  
  const rankColors = {
    'legendary grandmaster': 'text-red-500 font-bold',
    'international grandmaster': 'text-red-400 font-bold',
    'grandmaster': 'text-red-400 font-semibold',
    'international master': 'text-yellow-500 font-semibold',
    'master': 'text-yellow-400 font-semibold',
    'candidate master': 'text-purple-400 font-medium',
    'expert': 'text-blue-400 font-medium',
    'specialist': 'text-cyan-400 font-medium',
    'pupil': 'text-green-400',
    'newbie': 'text-slate-400',
  };

  return rankColors[rank.toLowerCase()] || 'text-slate-400';
};

const AllCFSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'solvedAt', direction: 'desc' });

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/problem-solve/get');
        const data = await response.json();
        
        if (data.success) {
          setSubmissions(data.data);
        } else {
          setError(data.message || 'Failed to fetch submissions');
        }
      } catch (err) {
        setError('An error occurred while fetching submissions');
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply search and sorting
  const filteredAndSortedSubmissions = submissions
    .filter(submission => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      const handle = submission.codeforcesHandle?.toLowerCase() || '';
      const problemName = submission.problemName?.toLowerCase() || '';
      const problemId = submission.problemId?.toString().toLowerCase() || '';
      const contestId = submission.contestId?.toString().toLowerCase() || '';
      
      return handle.includes(query) || 
             problemName.includes(query) || 
             problemId.includes(query) ||
             contestId.includes(query);
    })
    .sort((a, b) => {
      if (sortConfig.key === 'solvedAt') {
        return sortConfig.direction === 'asc'
          ? new Date(a.solvedAt) - new Date(b.solvedAt)
          : new Date(b.solvedAt) - new Date(a.solvedAt);
      }
      
      if (sortConfig.key === 'handle') {
        return sortConfig.direction === 'asc'
          ? a.codeforcesHandle.localeCompare(b.codeforcesHandle)
          : b.codeforcesHandle.localeCompare(a.codeforcesHandle);
      }
      
      if (sortConfig.key === 'problem') {
        const aName = a.problemName || `Problem ${a.problemId}`;
        const bName = b.problemName || `Problem ${b.problemId}`;
        return sortConfig.direction === 'asc'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }
      
      return 0;
    });

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-cyan-400" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-cyan-400/20 animate-pulse"></div>
            </div>
            <p className="mt-6 text-xl font-medium text-slate-300">Loading submissions...</p>
            <p className="mt-2 text-sm text-slate-500">Please wait while we fetch the data</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-red-900/20 border border-red-800/50 backdrop-blur-xl rounded-2xl p-12 text-center max-w-md">
              <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-400" />
              <h2 className="text-2xl font-bold text-red-200 mb-4">Failed to Load Submissions</h2>
              <p className="text-red-300 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            CodeForces Submissions
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Track and monitor competitive programming submissions across all users
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Submissions</p>
                <p className="text-2xl font-bold text-white mt-1">{submissions.length}</p>
              </div>
              <Activity className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Unique Users</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {new Set(submissions.map(s => s.codeforcesHandle)).size}
                </p>
              </div>
              <Users className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Accepted Solutions</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {submissions.filter(s => s.verdict === 'OK').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by handle, problem name, contest ID, or problem ID..."
              className="block w-full pl-12 pr-4 py-4 border border-slate-600 bg-slate-900/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center">
          <p className="text-slate-400">
            {searchQuery ? (
              <>
                Showing <span className="font-semibold text-white">{filteredAndSortedSubmissions.length}</span> of{' '}
                <span className="font-semibold text-white">{submissions.length}</span> submissions
                {filteredAndSortedSubmissions.length === 0 && (
                  <span className="text-amber-400"> - No matches found</span>
                )}
              </>
            ) : (
              <>
                Displaying all <span className="font-semibold text-white">{submissions.length}</span> submissions
              </>
            )}
          </p>
        </div>

        {/* Submissions Table */}
        {filteredAndSortedSubmissions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-300 mb-3">No submissions found</h3>
            <p className="text-slate-500 max-w-md mx-auto text-lg">
              {searchQuery 
                ? `No submissions match your search for "${searchQuery}". Try different keywords or check your spelling.`
                : 'There are no submissions to display at the moment.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-6 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-8 py-6 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('handle')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Handle</span>
                        {sortConfig.key === 'handle' && (
                          <span className="text-cyan-400">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-8 py-6 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('problem')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Problem</span>
                        {sortConfig.key === 'problem' && (
                          <span className="text-cyan-400">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-8 py-6 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('solvedAt')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Submission Time</span>
                        {sortConfig.key === 'solvedAt' && (
                          <span className="text-cyan-400">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-8 py-6 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Verdict
                    </th>
                    <th scope="col" className="px-8 py-6 text-right text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  <AnimatePresence>
                    {filteredAndSortedSubmissions.map((submission, index) => {
                      const verdictInfo = getVerdictInfo(submission.verdict);
                      const rankColor = getRankColor(submission.rank || 'newbie');
                      
                      return (
                        <motion.tr 
                          key={submission._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="px-8 py-6 whitespace-nowrap">
                            <a
                              href={`https://codeforces.com/profile/${submission.codeforcesHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-lg font-medium hover:underline transition-colors ${rankColor}`}
                            >
                              {submission.codeforcesHandle}
                            </a>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <a
                                href={`https://codeforces.com/problemset/problem/${submission.contestId}/${submission.problemIndex}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-cyan-400 hover:underline flex items-center transition-colors"
                              >
                                <span className="text-lg font-medium">
                                  {submission.problemName || `Problem ${submission.problemId}`}
                                </span>
                                <ExternalLink className="ml-2 h-4 w-4 text-slate-400" />
                              </a>
                            </div>
                            <div className="text-sm text-slate-400 mt-1">
                              Contest {submission.contestId} • Problem {submission.problemIndex}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-slate-300">
                            <div className="text-lg">
                              {formatDate(submission.solvedAt)}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${verdictInfo.color}`}>
                              {verdictInfo.text}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right">
                            <a
                              href={`https://codeforces.com/contest/${submission.contestId}/submission/${submission.submissionId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 border border-slate-600 rounded-lg text-sm font-medium text-cyan-400 hover:bg-slate-700 hover:border-cyan-400 transition-colors"
                            >
                              <Code className="mr-2 h-4 w-4" />
                              View Code
                            </a>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCFSubmissions;
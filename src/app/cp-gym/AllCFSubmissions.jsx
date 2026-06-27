'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, ExternalLink, Loader2, Search, AlertCircle, Users, Activity, TrendingUp
} from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/problem-solve/get?page=${currentPage}&limit=15&sortBy=${sortConfig.key}&sortOrder=${sortConfig.direction}`);
        const data = await response.json();
        
        if (data.success) {
          setSubmissions(data.data);
          if (data.pagination) {
            setCurrentPage(data.pagination.currentPage || 1);
            setTotalPages(data.pagination.totalPages || 1);
            setTotalItems(data.pagination.totalItems || 0);
          }
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
  }, [currentPage, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const filteredAndSortedSubmissions = submissions;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">CodeForces Submissions</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Track and monitor competitive programming submissions across all users
          </p>
        </div>

        {/* Submissions Table */}
        {filteredAndSortedSubmissions.length > 0 && (
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
                      Handle
                    </th>
                    <th 
                      scope="col" 
                      className="px-8 py-6 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('problem')}
                    >
                      Problem
                    </th>
                    <th 
                      scope="col" 
                      className="px-8 py-6 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('solvedAt')}
                    >
                      Submission Time
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
                            <a
                              href={`https://codeforces.com/problemset/problem/${submission.problemId.slice(0, 4)}/${submission.problemId.slice(4)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-cyan-400 hover:underline flex items-center transition-colors"
                            >
                              {submission.problemName || `Problem ${submission.problemId}`}
                              <ExternalLink className="ml-2 h-4 w-4 text-slate-400" />
                            </a>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-slate-300">
                            {formatDate(submission.solvedAt)}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${verdictInfo.color}`}>
                              {verdictInfo.text}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right">
                            <a
                              href={`https://codeforces.com/contest/${submission.problemId.slice(0, 4)}/submission/${submission.submissionId}`}
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                currentPage === 1
                  ? "bg-slate-800 text-slate-600 border border-transparent cursor-not-allowed"
                  : "bg-slate-700 hover:bg-slate-600 border border-slate-600 text-cyan-400 cursor-pointer shadow-md"
              }`}
            >
              &lt; Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-300 border ${
                    currentPage === p
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-transparent text-white shadow-lg"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                currentPage === totalPages
                  ? "bg-slate-800 text-slate-600 border border-transparent cursor-not-allowed"
                  : "bg-slate-700 hover:bg-slate-600 border border-slate-600 text-cyan-400 cursor-pointer shadow-md"
              }`}
            >
              Next &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCFSubmissions;

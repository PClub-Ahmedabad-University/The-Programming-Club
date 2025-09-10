'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, ExternalLink, Loader2, CheckCircle, XCircle, Users, Zap, Clock, X as XIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuestionCf = ({ problems, isVerifying, handleVerify, openSolverModal, isLoggedIn }) => {
  const [isClient, setIsClient] = useState(false);
  const [codeforcesHandle, setCodeforcesHandle] = useState('');
  const [codeforcesRank, setCodeforcesRank] = useState('unrated');
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    setIsClient(true);
    const fetchCodeforcesInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.codeforcesHandle) {
            setCodeforcesHandle(userData.codeforcesHandle);
            setCodeforcesRank(userData.codeforcesRank || 'unrated');
          }
        }
      } catch (error) {
        console.error('Error fetching Codeforces info:', error);
      }
    };

    fetchCodeforcesInfo();
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      {problems.slice(0, visibleCount).map((problem, index) => (
        <motion.div
          key={problem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-gray-800/30 p-4 sm:p-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:border-gray-700/50 group"
        >
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                  problem.status === 'solved'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-900/50 border border-gray-800/30 group-hover:bg-gray-800/50'
                }`}>
                  {problem.status === 'solved' ? (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg sm:text-xl text-white truncate">
                        <a 
                          href={problem.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-cyan-400 hover:underline inline-flex items-center gap-1.5"
                        >
                          {problem.title}
                          <ExternalLink size={14} className="opacity-70 flex-shrink-0" />
                        </a>
                      </h3>
                      {problem.solution && (
                        <a
                          href={problem.solution}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-cyan-900/50 hover:bg-cyan-800/70 text-cyan-300 hover:text-white px-2.5 py-1 rounded-lg border border-cyan-800/50 hover:border-cyan-700/70 transition-all duration-200 flex items-center gap-1.5"
                        >
                          <Code className="w-3 h-3" />
                          <span>View Solution</span>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-400">
                      <span className="font-mono text-cyan-400 hidden sm:inline-block">#{problem.id}</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                        {problem.postedAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400 mt-1">
                    <span className="font-mono text-cyan-400 sm:hidden">#{problem.id}</span>
                    <span 
                      className="flex items-center hover:text-cyan-400 cursor-pointer"
                      onClick={() => problem.solvedBy > 0 && openSolverModal(problem.id)}
                    >
                      <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                       Solved by : {problem.solvedBy} {problem.solvedBy === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-xs sm:text-sm ${
                  problem.status === 'solved'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-900/50 text-gray-500 border border-gray-800/30'
                }`}>
                  {problem.status === 'solved' ? 'Solved' : 'Unsolved'}
                </div>
                <button
                  onClick={async () => {
                    if (!isLoggedIn) {
                      toast.error('Please log in and add your Codeforces handle to verify submissions', {
                        icon: <XIcon className="text-red-500" />,
                        style: {
                          background: 'rgba(17, 24, 39, 0.8)',
                          border: '1px solid rgba(75, 85, 99, 0.5)',
                          color: '#fff',
                        },
                      });
                      return;
                    }
                    handleVerify(problem.id);
                  }}
                  disabled={isVerifying[problem.id] || problem.status === 'solved'}
                  className={`w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 font-medium rounded-xl transition-all duration-300 text-sm sm:text-base ${
                    problem.status === 'solved'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                      : isVerifying[problem.id]
                      ? 'bg-gray-800 text-gray-500 cursor-wait'
                      : 'bg-gradient-to-r from-[#073496] to-[#0a058d] text-white hover:from-blue-800 hover:to-blue-900 hover:shadow-cyan-500/30'
                  }`}
                  title={!isLoggedIn ? 'Log in to verify your submission' : ''}
                >
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    {isVerifying[problem.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : problem.status === 'solved' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span className="whitespace-nowrap">
                      {isVerifying[problem.id] 
                        ? 'Checking...' 
                        : problem.status === 'solved' 
                          ? 'Verified' 
                          : 'Confirm Submission'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {visibleCount < problems.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setVisibleCount(prev => prev + 5)}
            className="px-6 py-2.5 bg-gradient-to-r from-[#073496] to-[#0a058d] text-white font-medium rounded-xl hover:from-blue-800 hover:to-blue-900 transition-all duration-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionCf;

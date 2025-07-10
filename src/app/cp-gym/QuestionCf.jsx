'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, ExternalLink, Loader2, CheckCircle, XCircle, Users, Zap, Clock, List, Trophy
} from 'lucide-react';

const QuestionCf = ({ problems, isVerifying, handleVerify, openSolverModal }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {problems.map((problem, index) => (
        <div
          key={problem.id}
          className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-gray-800/30 p-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:border-gray-700/50 group"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
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
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-xl text-white">
                      <a 
                        href={problem.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-cyan-400 hover:underline inline-flex items-center gap-1.5"
                      >
                        {problem.title}
                        <ExternalLink size={14} className="opacity-70" />
                      </a>
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span className="font-mono text-cyan-400">#{problem.id}</span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {problem.postedAt}
                    </span>
                  </div>
                </div>
              </div>
              <span 
                      className="relative flex items-center hover:text-cyan-400 cursor-pointer"
                      onClick={() => problem.solvedBy > 0 && openSolverModal(problem.id)}
                    >
                      <Users className="w-3.5 h-3.5 mr-1.5" />
                      {problem.solvedBy} {problem.solvedBy === 1 ? 'solver' : 'solvers'}
                    </span>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
                  problem.status === 'solved'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-900/50 text-gray-500 border border-gray-800/30'
                }`}>
                  {problem.status === 'solved' ? 'Solved' : 'Unsolved'}
                </div>
                <button
                  onClick={() => handleVerify(problem.id)}
                  disabled={isVerifying[problem.id] || problem.status === 'solved'}
                  className={`px-5 py-2.5 font-medium rounded-xl transition-all duration-300 ${
                    problem.status === 'solved'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                      : isVerifying[problem.id]
                      ? 'bg-gray-800 text-gray-500 cursor-wait'
                      : 'bg-gradient-to-r from-[#073496] to-[#0a058d] text-white hover:from-blue-800 hover:to-blue-900 hover:shadow-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isVerifying[problem.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : problem.status === 'solved' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>
                      {isVerifying[problem.id] 
                        ? 'Checking...' 
                        : problem.status === 'solved' 
                          ? 'Verified' 
                          : 'Check'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionCf;
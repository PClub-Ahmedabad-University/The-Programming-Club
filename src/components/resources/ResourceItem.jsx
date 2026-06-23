"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiStar, FiExternalLink, FiThumbsUp } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

export default function ResourceItem({ resource, index, globalMetrics }) {
  const [stars, setStars] = useState(resource.stars || 0);
  const [hasStarred, setHasStarred] = useState(false);

  const [foundUseful, setFoundUseful] = useState(resource.foundUseful || 0);
  const [hasVoted, setHasVoted] = useState(false);

  // Sync with global metrics once they are loaded
  useEffect(() => {
    if (globalMetrics) {
      if (globalMetrics.stars !== undefined) setStars(globalMetrics.stars);
      if (globalMetrics.upvotes !== undefined) setFoundUseful(globalMetrics.upvotes);
    }
  }, [globalMetrics]);

  // Check local storage to see if user already voted
  useEffect(() => {
    const localStars = localStorage.getItem(`star_${resource.id}`);
    const localUpvotes = localStorage.getItem(`upvote_${resource.id}`);
    if (localStars) setHasStarred(true);
    if (localUpvotes) setHasVoted(true);
  }, [resource.id]);

  const handleStarClick = async (e) => {
    e.preventDefault();
    const action = hasStarred ? 'remove' : 'add';

    // Optimistic update
    setStars((prev) => action === 'add' ? prev + 1 : Math.max(0, prev - 1));
    setHasStarred(!hasStarred);

    if (action === 'add') {
      localStorage.setItem(`star_${resource.id}`, "true");
    } else {
      localStorage.removeItem(`star_${resource.id}`);
    }

    // API Call
    try {
      await fetch('/api/resources/metrics/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: resource.id, type: 'star', action })
      });
    } catch (err) {
      // Rollback on error
      setStars((prev) => action === 'add' ? Math.max(0, prev - 1) : prev + 1);
      setHasStarred(!(!hasStarred));
      console.error("Failed to update star", err);
    }
  };

  const handleUsefulClick = async (e) => {
    e.preventDefault();
    const action = hasVoted ? 'remove' : 'add';

    // Optimistic update
    setFoundUseful((prev) => action === 'add' ? prev + 1 : Math.max(0, prev - 1));
    setHasVoted(!hasVoted);

    if (action === 'add') {
      localStorage.setItem(`upvote_${resource.id}`, "true");
    } else {
      localStorage.removeItem(`upvote_${resource.id}`);
    }

    // API Call
    try {
      await fetch('/api/resources/metrics/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: resource.id, type: 'upvote', action })
      });
    } catch (err) {
      // Rollback on error
      setFoundUseful((prev) => action === 'add' ? Math.max(0, prev - 1) : prev + 1);
      setHasVoted(!(!hasVoted));
      console.error("Failed to update upvote", err);
    }
  };

  return (
    <motion.a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="relative p-5 md:p-6 rounded-2xl bg-slate-950/30 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all duration-300 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 backdrop-blur-sm">
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300 font-heading leading-tight truncate-multiline">
            {resource.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <FiExternalLink /> Visit Resource
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 mt-2 md:mt-0 z-10" onClick={(e) => e.preventDefault()}>
          {/* Star Button */}
          <button
            onClick={handleStarClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 font-mono text-sm ${
              hasStarred
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/5 hover:border-yellow-500/20"
                : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-yellow-500 hover:border-yellow-500/50"
            }`}
            title={hasStarred ? "Remove star" : "Star this resource"}
          >
            {hasStarred ? <FaStar /> : <FiStar />}
            <span>{stars}</span>
          </button>

          {/* Found Useful Button */}
          <button
            onClick={handleUsefulClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 font-mono text-sm ${
              hasVoted
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/5 hover:border-cyan-400/20"
                : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50"
            }`}
            title={hasVoted ? "Remove upvote" : "Mark as useful"}
          >
            <FiThumbsUp className={hasVoted ? "fill-cyan-400" : ""} />
            <span>{foundUseful}</span>
          </button>
        </div>
      </div>
    </motion.a>
  );
}

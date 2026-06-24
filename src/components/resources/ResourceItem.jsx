"use client";

import { motion } from "framer-motion";
import { FiExternalLink } from "react-icons/fi";

export default function ResourceItem({ resource, index }) {
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
      </div>
    </motion.a>
  );
}

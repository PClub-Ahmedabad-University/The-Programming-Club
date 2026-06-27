"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { FiSearch, FiX } from "react-icons/fi";
import CategoryCard from "@/components/resources/CategoryCard";
import { resourceCategories } from "@/data/resources";

export default function ResourcesLandingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const floatingCodeSymbols = ["</>", "{}", "[]", "()", "&&", "||", "=>", "//"];

  // Filter categories by title or description
  const filteredCategories = resourceCategories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Dynamic styles mapping */}
      <style jsx global>{`
        .text-gradient-cyan {
          background: linear-gradient(
            135deg,
            #00d4ff 0%,
            #00a8cc 50%,
            #0891b2 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating Coding Symbols */}
      {isMounted && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {floatingCodeSymbols.map((symbol, idx) => (
            <motion.div
              key={idx}
              className="absolute text-cyan-400/5 font-mono text-xl md:text-2xl"
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
              }}
              animate={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
              }}
              transition={{
                duration: 25 + Math.random() * 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
            >
              {symbol}
            </motion.div>
          ))}
        </div>
      )}

      {/* Header Section */}
      <section className="relative pt-28 pb-10 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Title & Subtitle Left Side */}
          <div className="text-left max-w-3xl">
            <motion.div
              className="mb-3 inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="px-3 py-1 bg-cyan-500/5 rounded-full border border-cyan-400/20 text-cyan-400 text-xs backdrop-blur-sm flex items-center gap-1.5 font-mono w-max">
                <HiSparkles />
                100% Curated & Open Source
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 font-heading tracking-tight"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-gradient-cyan">Resources Hub</span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg text-gray-400 leading-relaxed font-content"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              Discover curated learning paths and resources across different domains of Computer Science and Software Engineering.
            </motion.p>
          </div>

          {/* Search Bar Right Side */}
          <motion.div
            className="w-full md:w-80 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-12 pr-10 py-3 bg-slate-950/40 hover:bg-slate-900/60 focus:bg-slate-900/80 border border-slate-800/80 focus:border-white/30 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all duration-300 backdrop-blur-md shadow-2xl font-content text-sm"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <FiSearch className="text-lg" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <FiX className="text-base" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-24 z-10">
        <div className="max-w-7xl mx-auto">
          {filteredCategories.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-20 backdrop-blur-xl bg-slate-950/20 border border-slate-900 rounded-3xl p-8 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-base text-slate-400 mb-4">No categories match your search.</p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] text-white text-xs font-semibold rounded-xl transition-all duration-300 font-mono"
              >
                Clear Search
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

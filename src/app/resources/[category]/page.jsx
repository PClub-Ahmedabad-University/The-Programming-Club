"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { resourceCategories } from "@/data/resources";
import * as FaIcons from "react-icons/fa";
import ResourceItem from "@/components/resources/ResourceItem";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.category;

  const [category, setCategory] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (categoryId) {
      const found = resourceCategories.find((cat) => cat.id === categoryId);
      setCategory(found || null);
    }
  }, [categoryId]);

  if (!isMounted) return null;

  if (!category && isMounted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-red-400 mb-4 font-heading">Category Not Found</h1>
        <button
          onClick={() => router.push("/resources")}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors font-mono"
        >
          <FiArrowLeft /> Back to Resources
        </button>
      </div>
    );
  }

  const IconComponent = category?.iconName ? FaIcons[category.iconName] : FaIcons.FaFolder;

  // Group resources by level
  const groupedResources = {
    Beginner: category?.resources?.filter((r) => r.level === "Beginner") || [],
    Intermediate: category?.resources?.filter((r) => r.level === "Intermediate") || [],
    Advanced: category?.resources?.filter((r) => r.level === "Advanced") || [],
  };

  const floatingCodeSymbols = ["</>", "{}", "[]", "()", "&&", "||", "=>", "//"];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative pb-24">
      {/* Dynamic styles mapping */}
      <style jsx global>{`
        .text-gradient-cyan {
          background: linear-gradient(135deg, #00d4ff 0%, #00a8cc 50%, #0891b2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .truncate-multiline {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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

      {/* Header Section */}
      <section className="relative pt-28 pb-10 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto">
          <motion.button
            onClick={() => router.push("/resources")}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors font-mono text-sm group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to all categories
          </motion.button>

          <div className="flex items-start gap-6 mb-6">
            <motion.div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <IconComponent size={32} strokeWidth={1.5} />
            </motion.div>
            <div>
              <motion.h1
                className="text-3xl md:text-5xl font-bold font-heading mb-3 text-gradient-cyan"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {category.title}
              </motion.h1>
              <motion.p
                className="text-slate-400 font-content text-base md:text-lg max-w-2xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {category.description}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Content */}
      <section className="relative px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {["Beginner", "Intermediate", "Advanced"].map((level, sectionIdx) => {
            const levelResources = groupedResources[level];
            if (!levelResources || levelResources.length === 0) return null;

            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + sectionIdx * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold font-heading text-white">{level}</h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-800 to-transparent" />
                </div>
                
                <div className="space-y-4">
                  {levelResources.map((resource, idx) => (
                    <ResourceItem 
                      key={resource.id} 
                      resource={resource} 
                      index={idx} 
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}

          {category?.resources?.length === 0 && (
            <div className="text-center py-20 bg-slate-900/20 border border-slate-800/50 rounded-2xl">
              <p className="text-slate-400 font-mono">No resources available for this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

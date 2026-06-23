"use client";

import Link from "next/link";
import * as FaIcons from "react-icons/fa";

/**
 * Reusable Card component for Resource categories (Square card with black & white theme/glow)
 * @param {Object} props
 * @param {import('../../data/resources').ResourceCategory} props.category
 */
export default function CategoryCard({ category }) {
  const { id, title, iconName } = category;

  // Dynamically resolve icon from react-icons/fa
  const IconComponent = FaIcons[iconName] || FaIcons.FaBookOpen;

  return (
    <Link href={`/resources/${id}`} className="group block aspect-square w-full">
      <div className="relative h-full w-full bg-slate-950/40 hover:bg-slate-900/40 border border-slate-800/80 rounded-2xl transition-all duration-300 group-hover:scale-[1.03] group-hover:border-white/30 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* White/gray glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Tech Stack Vector Icon (Neutral/White style) */}
        <div className="text-slate-400 group-hover:text-white mb-5 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
          <IconComponent className="text-6xl md:text-7xl" />
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-slate-350 group-hover:text-white transition-colors duration-200 font-heading line-clamp-2 max-w-full px-1">
          {title}
        </h3>
      </div>
    </Link>
  );
}

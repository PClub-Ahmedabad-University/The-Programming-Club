"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {motion} from "framer-motion";
import { ShineBorder } from "@/ui-components/ShinyBorder";

export default function OBSCard({ member, isSecretary, index, getBorderColor, getGradient }) {
  return (
    <motion.div 
      key={member.name}
      className={`relative ${isSecretary ? 'order-2 md:scale-110 z-10' : index === 0 ? 'order-1' : 'order-3'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <div 
        className={`relative group overflow-hidden rounded-2xl ${isSecretary ? 'w-72 h-[450px]' : 'w-[280px] h-[400px]'}`}
        style={{
          background: getGradient(member.position),
          boxShadow: `0 10px 30px -5px ${getBorderColor(member.position)}40`,
        }}
      >
        <ShineBorder 
          borderWidth={2} 
          duration={8} 
          shineColor={[getBorderColor(member.position), "transparent"]} 
          className="absolute inset-0 rounded-2xl z-10"
        />
        
        {/* Spotlight effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
          style={{
            background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.15), transparent 80%)`,
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
          }}
        />
        
        {/* Image */}
        <div className="relative w-full h-4/5 overflow-hidden">
          <Image 
            src={member.pfpImage} 
            alt={member.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-4 py-6 text-center h-1/5 flex flex-col justify-center">
          <h3 className="text-lg font-bold mb-2">{member.name}</h3>
          <p className="text-sm font-medium text-blue-300 mb-3">{member.position}</p>
        </div>
        
        {/* Hover info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/50 backdrop-blur-sm flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <h3 className="text-xl font-bold mb-2">{member.name}</h3>
          <p className="text-blue-300 font-medium mb-4">{member.position}</p>
          <p className="text-sm mb-4">{member.email}</p>
          {member.linkedinId && (
            <Link 
              href={`https://linkedin.com/in/${member.linkedinId}`}
              target="_blank"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              @{member.linkedinId}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
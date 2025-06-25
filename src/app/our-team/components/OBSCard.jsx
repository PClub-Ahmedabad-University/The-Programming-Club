"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {motion} from "framer-motion";
import { ShineBorder } from "@/ui-components/ShinyBorder";
import LinkedinButton from "@/ui-components/LinkedinButton";

export default function OBSCard({ member, isSecretary, index, getBorderColor, getGradient }) {
  return (
    <motion.div 
      key={member.name}
      className={`my-3 relative w-full h-full max-w-[300px] mx-auto z-10`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div 
        className="relative group overflow-hidden rounded-2xl w-full h-full min-h-[350px] sm:min-h-[400px] mx-auto"
        style={{
          background: getGradient(member.position),
          boxShadow: `0 10px 30px -5px ${getBorderColor(member.position)}40`,
          aspectRatio: '3/4',
        }}
      >
        <ShineBorder 
          borderWidth={2} 
          duration={8} 
          shineColor={[getBorderColor(member.position), "transparent"]} 
          className="absolute inset-0 rounded-2xl z-10"
        />
        
        {/* Spotlight effect
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
        /> */}
        
        {/* Image */}
        <div className="relative w-full h-[80%] sm:h-[80%] overflow-hidden">
          <Image 
            src={member.pfpImage} 
            alt={member.name}
            fill
            sizes="(max-width: 480px) 280px, (max-width: 768px) 320px, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={index < 3} // Load first 3 images with priority
          />
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 sm:p-4 h-[20%] sm:h-[20%] flex items-center justify-between px-4 sm:px-6">
          <div className="flex flex-col gap-1 sm:gap-2 justify-center items-start overflow-hidden w-[calc(100%-44px)]">  
            <h3 className="text-base sm:text-lg font-bold text-ellipsis overflow-hidden whitespace-nowrap w-full">
              {member.name}
            </h3>
            <p className="text-sm sm:text-base font-medium text-blue-300 text-ellipsis overflow-hidden whitespace-nowrap w-full">
              {member.position}
            </p>
          </div>
          <div className="flex-shrink-0 ml-2">
            <LinkedinButton 
              bgColor={getBorderColor(member.position)} 
              href={member.linkedinId.startsWith("https://") ? member.linkedinId : `https://${member.linkedinId}`} 
              size={32}
            />
          </div>
        </div>
        
        {/* Hover info */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/50 backdrop-blur-sm flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
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
        </div> */}
      </div>
    </motion.div>
  );
}
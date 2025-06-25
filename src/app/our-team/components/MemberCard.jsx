"use client";

import React from "react";
import Image from "next/image";
import { ShineBorder } from "@/ui-components/ShinyBorder";
import LinkedinButton from "@/ui-components/LinkedinButton";

export default function MemberCard({ member, getBorderColor, getGradient }) {
  return (
    <div key={member.name} className="member-card w-full h-full">
      <div
        className="relative group overflow-hidden rounded-2xl h-full w-full mx-auto"
        style={{
          background: getGradient(member.position),
          boxShadow: `0 8px 20px -5px ${getBorderColor(member.position)}30`,
          minHeight: '400px',
          maxWidth: '300px'
        }}
      >
        <ShineBorder
          borderWidth={2}
          duration={8}
          shineColor={[getBorderColor(member.position), "transparent"]}
          className="absolute inset-0 rounded-2xl z-10"
        />

        {/* Glow effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.15)] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 blur-sm group-hover:animate-glow transition duration-500 z-0"></div>

        {/* Image */}
        <div className="relative w-full h-[80%] overflow-hidden">
          <Image
            src={member.pfpImage}
            alt={member.name}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4 h-[20%] flex items-center justify-between px-6">
          <div className="flex flex-col gap-2 justify-center items-start h-full">  
          <h3 className="text-lg font-bold">{member.name}</h3>
          <p className="text-md font-medium text-blue-300">{member.position}</p>
          </div>
          <LinkedinButton bgColor={getBorderColor(member.position)} href={member.linkedinId.startsWith("https://") ? member.linkedinId : `https://${member.linkedinId}`} />
        </div>
        {/* Hover info */}
        {/* <div className="rounded-2xl absolute inset-0 bg-gradient-to-t from-black/90 to-black/50 backdrop-blur-sm flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <h3 className="text-xl font-bold mb-2">{member.name}</h3>
          <p className="text-blue-300 font-medium mb-4">{member.position}</p>
          <p className="text-sm mb-4">{member.email}</p>
          {member.linkedinId && (
            <Link
              href={member.linkedinId.startsWith("https://") ? member.linkedinId : `https://${member.linkedinId}`}
              target="_blank"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              @{member.linkedinId}
            </Link>
          )}
        </div> */}
      </div>
    </div>
  );
}

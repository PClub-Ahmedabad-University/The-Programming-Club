"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShineBorder } from "@/ui-components/ShinyBorder";

export default function MemberCard({ member, getBorderColor, getGradient }) {
  return (
    <div key={member.name} className="member-card opacity-0 translate-y-8">
      <div
        className="relative group overflow-hidden rounded-2xl h-[400px] w-[280px] mx-auto"
        style={{
          background: getGradient(member.role),
          boxShadow: `0 8px 20px -5px ${getBorderColor(member.role)}30`,
        }}
      >
        <ShineBorder
          borderWidth={2}
          duration={8}
          shineColor={[getBorderColor(member.role), "transparent"]}
          className="absolute inset-0 rounded-2xl z-10"
        />

        {/* Glow effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.15)] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 blur-sm group-hover:animate-glow transition duration-500 z-0"></div>

        {/* Image */}
        <div className="relative w-full h-4/5 overflow-hidden">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4 h-1/5 flex flex-col justify-center">
          <h3 className="text-lg font-bold mb-2">{member.name}</h3>
          <p className="text-sm font-medium text-blue-300 mb-3">
            {member.role}
          </p>
        </div>
        {/* Hover info */}
        <div className="rounded-2xl absolute inset-0 bg-gradient-to-t from-black/90 to-black/50 backdrop-blur-sm flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
          <h3 className="text-xl font-bold mb-2">{member.name}</h3>
          <p className="text-blue-300 font-medium mb-4">{member.role}</p>
          <p className="text-sm mb-4">{member.email}</p>
          {member.linkedin_id && (
            <Link
              href={`https://linkedin.com/in/${member.linkedin_id}`}
              target="_blank"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              @{member.linkedin_id}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

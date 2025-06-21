"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import recruitmentData from "./recuritementdata.json";
import Button from "@/ui-components/ShinyButton";
import Image from "next/image";
import { BorderBeam } from "@/ui-components/BorderBeam";

const TeamCard = ({ team }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            className="h-[480px] w-full group relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
            }}
        >
            <div className="h-full w-full relative overflow-hidden rounded-xl bg-pclubBg/90 border border-gray-800/50 backdrop-blur-sm group/card">
                <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-30">
                    <BorderBeam
                        duration={12}
                        size={400}
                        className="from-transparent via-white to-transparent"
                    />
                    <BorderBeam
                        duration={12}
                        delay={6}
                        size={400}
                        className="from-transparent via-blue-700 to-transparent"
                    />
                </div>

                <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent z-10" />
                    <Image
                        src={team.image}
                        alt={team.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute bottom-4 left-4 z-20">
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg font-heading">{team.title}</h3>
                    </div>
                </div>

                <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                    <div className="mb-6">
                        <p className="text-xl font-medium text-gray-400 mb-2">TEAM LEAD</p>
                        <a
                            href={team.leader.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 group/leader"
                        >
                            <span className="text-white font-medium text-xl group-hover/leader:text-blue-400 transition-colors">
                                {team.leader.name}
                            </span>
                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                        </a>
                    </div>


                    <div className="mb-6">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 group/button"
                        >
                            {isExpanded ? 'Hide' : 'View'} Team Members
                            <motion.span
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="inline-block text-lg"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </motion.span>
                        </button>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2 mt-3">
                                        {team.members.length > 0 ? (
                                            team.members.map((member, index) => (
                                                <a
                                                    key={index}
                                                    href={member.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-md group"
                                                >
                                                    <span className="group-hover:text-blue-400 transition-colors">
                                                        {member.name}
                                                    </span>
                                                    <svg
                                                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                    </svg>
                                                </a>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No members available</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                    </AnimatePresence>
                </div>

                {/* Apply Button */}
                <div className="mt-auto pt-4 border-t border-gray-800">
                    <Button
                        onClick={() => window.open(team.google_form, '_blank')}
                        title="Apply for Position"
                        className="w-full py-2.5 text-sm font-medium"
                        variant="gradient"
                    />
                </div>
            </div>
        </div>
            {/* </div> */ }
        </motion.div >
    );
};

export default function Recruitment() {
    return (
        <div className="min-h-screen font-content bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-wider relative inline-block mb-4">
                        <span className="text-white font-heading relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
                            RECRUITMENT
                        </span>
                    </h1>
                    <motion.p
                        className="mt-7 font-content text-xl text-gray-400 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Be part of our vibrant community of tech enthusiasts, developers, and creators.
                        Choose a team that matches your passion and skills.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recruitmentData.roles.map((team, index) => (
                        <motion.div
                            key={team.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 100
                            }}
                        >
                            <TeamCard team={team} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import Loader from "@/ui-components/Loader1";
import OBSCard from "./components/OBSCard";
import LeadCard from "./components/LeadCard";
import MemberCard from "./components/MemberCard";
import LastYear from "./components/LastYear";
import { getBorderColor, getGradient } from "./utils/colorUtils";

export default function TeamPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const json = await fetch("/api/members/get").then((data) => data.json());
                if (Array.isArray(json.data)) {
                    setMembers(json.data);
                } else if (Array.isArray(json)) {
                    setMembers(json);
                } else {
                    setMembers([]);
                }
            } catch (e) {
                setMembers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const isCurrentTerm = (term) => {
        const currentDay = new Date().getDay();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;

        const years = term.match(/^(\d{4})-(\d{4})$/);
        if (!years) return false;

        const startYear = parseInt(years[1]);
        const endYear = parseInt(years[2]);
        return (
            (startYear === currentYear ||
            endYear === nextYear) || (currentMonth < 5 && startYear === endYear && currentDay < 5)
        );
    };

    const membersByTerm = members.reduce((acc, member) => {
        const term = member.term || "Unknown Term";
        if (!acc[term]) acc[term] = [];
        acc[term].push(member);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                <Loader />
            </div>
        );
    }

    return (
        <main
            className="relative min-h-screen bg-cover bg-center text-white overflow-hidden font-content"
            style={{ backgroundImage: "url('/blackbg-1.jpg')" }}
        >
            <div className="absolute inset-0 bg-gray-950 opacity-70 z-0" />

            <section className="relative pt-24 pb-16 px-4 md:px-8 lg:px-16 text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-wider relative inline-block mb-4">
                    <span className="text-white font-heading relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
                        Our Team
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
                </h1>
            </section>

            {Object.entries(membersByTerm)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([term, termMembers]) => {
                    const current = isCurrentTerm(term);
                    
                    // For past terms, render all members in LastYear component
                    if (!current) {
                        return (
                            <section key={term} className="relative px-4 md:px-8 lg:px-16 pt-8 pb-4 md:pt-16 md:pb-8">
                                <div className="mb-6 sm:mb-8 md:mb-12 lg:mb-16 flex items-center justify-center">
                                    <div className="bg-gradient-to-r from-blue-900 to-teal-950 px-6 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4 rounded-full shadow-lg text-white text-xl sm:text-2xl font-bold tracking-wide border-4 border-blue-700">
                                        {term}
                                    </div>
                                </div>
                                <div className="w-full">
                                    <div className="max-w-6xl mx-auto">
                                        {termMembers.map((member) => (
                                            <div key={member._id} className="w-full h-full">
                                                <LastYear member={member} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );
                    }
                    
                    // For current term, render members in their respective card components
                    const obsMembers = termMembers.filter((member) =>
                        ["Secretary", "Treasurer", "Joint Secretary"].includes(member.position)
                    );
                    const leadMembers = termMembers.filter((member) =>
                        [
                            "Dev Lead",
                            "CP Lead",
                            "Graphic Lead",
                            "Social Media Head",
                            "Content Lead",
                            "Communication Lead",
                        ].includes(member.position)
                    );
                    const regularMembers = termMembers.filter(
                        (member) =>
                            ![...obsMembers, ...leadMembers].map((m) => m._id).includes(member._id)
                    );
                    return (
                        <section key={term} className="relative px-4 md:px-8 lg:px-16 py-16 mb-12">
                            <div className="mb-16 flex items-center justify-center">
                                <div className="bg-gradient-to-r from-blue-900 to-teal-950 px-10 py-4 rounded-full shadow-lg text-white text-2xl font-bold tracking-wide border-4 border-blue-700">
                                    {term}
                                </div>
                            </div>

                            <div className="max-w-7xl mx-auto mb-16">
                                <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center text-blue-400">
                                    Office Bearers
                                </h2>
                                <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8 md:gap-12 relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-blue-900/10 rounded-3xl blur-xl -z-10"></div>
                                    {obsMembers.length === 0 ? (
                                        <p className="text-center text-gray-400">No office bearers found.</p>
                                    ) : (
                                        <div className="flex flex-col md:flex-row justify-around items-center md:items-stretch w-full">
                                            {obsMembers.map((member, index) => (
                                                <OBSCard
                                                    key={member._id}
                                                    member={member}
                                                    isSecretary={member.position === "Secretary"}
                                                    index={index}
                                                    getBorderColor={getBorderColor}
                                                    getGradient={getGradient}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Leads Section */}
                            <div className="max-w-6xl mx-auto mb-16">
                                <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center text-blue-400">
                                    Team Leads
                                </h2>
                                {leadMembers.length === 0 ? (
                                    <p className="text-center text-gray-400">No leads found.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8 relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-purple-900/10 rounded-3xl blur-xl -z-10"></div>
                                        {leadMembers.map((member, index) => (
                                            <LeadCard
                                                key={member._id}
                                                member={member}
                                                index={index}
                                                getBorderColor={getBorderColor}
                                                getGradient={getGradient}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Members Section */}
                            <div className="w-full max-w-7xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center text-blue-400">
                                    Team Members
                                </h2>
                                {regularMembers.length === 0 ? (
                                    <p className="text-center text-gray-400">No Team members found.</p>
                                ) : (
                                    <div className="relative rounded-xl overflow-hidden">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-blue-900/10 rounded-3xl blur-xl -z-10"></div>
                                            {regularMembers.map((member) => (
                                                <MemberCard
                                                    key={member._id}
                                                    member={member}
                                                    getBorderColor={getBorderColor}
                                                    getGradient={getGradient}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })}
        </main>
    );
}
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/ui-components/ShinyButton";
import Image from "next/image";
import { BorderBeam } from "@/ui-components/BorderBeam";
import { toast } from "react-hot-toast";
import NoOpening from "@/app/Components/NoOpening";


const TeamCard = ({ team }) => {
    const router = useRouter();
    const extractFormId = (url) => {
        if (!url) return null;
        const match = String(url).match(/\/d\/e\/([a-zA-Z0-9_-]+)/);
        console.log(match);
        return match ? match[1] : null;
    };

    return (
        <motion.div
            className="w-full group relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
            }}
        >
            <div className="flex justify-between items-center w-full h-auto min-h-[350px] md:h-[350px] relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800/50 backdrop-blur-sm group/card">
                {/* Border animations */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-30">
                    <BorderBeam
                        duration={15}
                        size={500}

                        className="from-transparent via-white to-transparent"
                    />
                    <BorderBeam
                        duration={15}
                        delay={6}
                        size={500}
                        className="from-transparent via-blue-700 to-transparent"
                    />
                </div>

                {/* Main content layout */}
                <div className="relative z-10 p-4 sm:p-5 md:p-7 h-full flex flex-col md:flex-row gap-4 md:gap-5 lg:gap-7">
                    {/* Image - Full width on mobile, 1/3 on larger screens */}
                    <div className="relative w-full md:w-1/3 aspect-square mx-auto md:mx-0 rounded-md overflow-hidden">
                        <Image
                            src={team.image}
                            alt={team.title}
                            fill
                            sizes="(max-width: 767px) 100vw, (min-width: 768px) 33vw, 33vw"
                            className="object-cover object-center rounded-md"
                            priority={false}
                        />
                    </div>

                    {/* Text Content - Full width on mobile, 2/3 on larger screens */}
                    <div className="flex-1 flex flex-col justify-around h-full">
                        <div className="mb-4 md:mb-6 flex flex-col items-center justify-between">
                            <h3 className="sm:mx-auto text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 lg:mb-6 font-heading">
                                {team.title}
                            </h3>
                            <p className="text-white text-base sm:text-lg md:text-xl mb-4">
                                {team.description}
                            </p>
                            <div className="mt-auto flex items-center justify-center">
                                <button
                                    className="text-white rounded-2xl bg-blue-500 hover:bg-blue-600 mt-4 px-6 py-3 text-lg font-semibold w-full sm:w-full"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.push(`${team.google_form}`);
                                    }}
                                >
                                    Apply for Position
                                </button>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


export default function Recruitment() {
    const router = useRouter();

    const handleApply = (formId) => {
        if (!formId) {
            toast.error('No form available for this position');
            return;
        }
        router.push(`/forms/${formId}`);
    };

    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecruitmentData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/recruitment/get');
            if (!response.ok) {
                throw new Error('Failed to fetch recruitment data');
            }
            const data = await response.json();
            console.log('Fetched recruitment data:', data);
            setTeams(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error('Error fetching recruitment data:', error);
            setError('Failed to load recruitment data. Please try again.');
            toast.error('Failed to load recruitment data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecruitmentData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-pulse text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading recruitment data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Filter teams to only show those with isRecruitmentOpen set to true
    const openTeams = teams.filter(team => team.isRecruitmentOpen === true);

    if (openTeams.length === 0) {
        return (
            <NoOpening />
        );
    }

    return (
        <div className="min-h-screen font-heading font-content bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative inline-block"
                        >
                            <h1 className="text-4xl font-heading md:text-6xl font-bold tracking-wider relative inline-block mb-4">
                                <span className="text-white relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
                                    RECRUITMENT
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
                            </h1>
                        </motion.div>
                    </div>
                    <motion.p
                        className="mt-4 font-content text-xl text-gray-400 max-w-xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Be part of our vibrant community of tech enthusiasts, developers, and creators.
                        Choose a team that matches your passion and skills.
                    </motion.p>
                </div>

                <div className="space-y-16">
                    {openTeams.map((team, index) => (
                        <TeamCard
                            key={index}
                            team={team}
                            onApply={handleApply}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
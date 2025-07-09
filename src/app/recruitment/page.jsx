"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { BorderBeam } from "@/ui-components/BorderBeam";
import { toast } from "react-hot-toast";
import NoOpening from "@/app/Components/NoOpening";
import ShinyButton from "@/ui-components/ShinyButton";
import Loader from "@/ui-components/Loader1";
import ComingSoon from "@/app/Components/ComingSoon";

const TeamCard = ({ team, index }) => {
  return (
    <motion.div
      className="w-full group relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.1,
      }}
    >
      <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/10">
        {/* Subtle border animation */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <BorderBeam
            duration={30}
            size={600}
            className="from-transparent via-white to-transparent"
          />
          <BorderBeam
            duration={30}
            delay={15}
            size={500}
            className="from-transparent via-blue-500 to-transparent"
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Image Section */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <div className="relative w-64 h-64 lg:w-72 lg:h-72 rounded-lg overflow-hidden ring-2 ring-white/10 group-hover:ring-blue-400/30 transition-all duration-300">
                <Image
                  src={team.image}
                  alt={team.title}
                  fill
                  sizes="(max-width: 1024px) 256px, 320px"
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  priority={index < 2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col justify-between min-h-0">
              <div className="text-center lg:text-left">
                <h3 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-heading tracking-wide">
                  {team.title}
                </h3>
                <div className="prose prose-lg prose-invert max-w-none flex">
                  <p className="text-gray-300 items-center text-lg lg:text-xl leading-relaxed mb-6">
                    {team.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center lg:justify-start mt-6">
                <ShinyButton
                  title="Apply for Position"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(team.google_form, "_blank");
                  }}
                />
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
      toast.error("No form available for this position");
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
      const response = await fetch("/api/recruitment/get", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch recruitment data");
      }
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching recruitment data:", error);
      setError("Failed to load recruitment data. Please try again.");
      toast.error("Failed to load recruitment data");
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
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-400 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter teams to only show those with isRecruitmentOpen set to true
  const openTeams = teams.filter((team) => team.isRecruitmentOpen === true);

  if (openTeams.length === 0) {
    return <NoOpening />;
  }

  return (
    <div className="min-h-screen bg-gray-950 font-content">
      {/* Header Section */}
      <div className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <section className="relative pt-10 pb-16 px-4 md:px-8 lg:px-16 text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-wider relative inline-block mb-4">
                <span className="text-white font-heading relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
                  Recruitment
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
              </h1>
            </section>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Be part of our vibrant community of tech enthusiasts, developers,
              and creators. Choose a team that matches your passion and skills.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl font-bold text-white bg-gray-800 rounded-lg px-4 py-2 inline-block shadow-lg"
              >
                Total Available Roles : {openTeams.length}
              </motion.h2>
            </div>
          <div className="space-y-8 lg:space-y-12">
            {openTeams.map((team, index) => (
              <TeamCard
                key={team.id || index}
                team={team}
                index={index}
                onApply={handleApply}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

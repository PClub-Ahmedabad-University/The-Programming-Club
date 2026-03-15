"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { BorderBeam } from "@/ui-components/BorderBeam";
import { toast } from "react-hot-toast";
import NoOpening from "@/app/Components/NoOpening";
import ShinyButton from "@/ui-components/ShinyButton";
import Loader from "@/ui-components/Loader1";
import { useUser } from "@/lib/UserContext";

const TeamCard = ({ team, index }) => {
  return (
    <motion.div
      className="w-full group relative px-2 sm:px-0"
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

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">

          <div className="flex flex-col lg:flex-row gap-6">

            <div className="relative w-56 h-56 lg:w-72 lg:h-72 rounded-lg overflow-hidden mx-auto lg:mx-0">
              <Image
                src={team.image}
                alt={team.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">

              <div>
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  {team.title}
                </h3>

                <p className="text-gray-300 text-lg mb-6">
                  {team.description}
                </p>
              </div>

              <div className="flex justify-center lg:justify-start">
                <ShinyButton
                  title="Apply for Position"
                  onClick={() => window.open(team.google_form, "_blank")}
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
  const { token } = useUser();

  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecruitmentData = async () => {
    try {

      setIsLoading(true);

      const response = await fetch("/api/recruitment/get", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recruitment data");
      }

      const data = await response.json();

      setTeams(Array.isArray(data) ? data : data.data || []);

    } catch (error) {

      console.error(error);
      setError("Failed to load recruitment data");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        {error}
      </div>
    );
  }

  const openTeams = teams.filter((team) => team.isRecruitmentOpen === true);

  if (openTeams.length === 0) {
    return <NoOpening />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <div className="max-w-6xl mx-auto py-16 px-4">

        <h1 className="text-5xl font-bold text-center mb-6">
          Recruitment
        </h1>

        <p className="text-center text-gray-300 mb-12 text-lg">
          Be part of our vibrant community of developers and creators.
        </p>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold">
            Total Available Roles: {openTeams.length}
          </h2>
        </div>

        <div className="space-y-10">
          {openTeams.map((team, index) => (
            <TeamCard
              key={team._id || index}
              team={team}
              index={index}
            />
          ))}
        </div>

      </div>

    </div>
  );
}
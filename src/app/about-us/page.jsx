"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { JetBrains_Mono } from "next/font/google";
import { gsap } from "gsap";

import OBSCard from "./components/OBSCard";
import LeadCard from "./components/LeadCard";
import MemberCard from "./components/MemberCard";

import { getBorderColor, getGradient } from "./utils/colorUtils";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export default function TeamPage() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/members/get");
        const json = await res.json();
        console.log("Fetched JSON:", json);
        if (Array.isArray(json.data)) {
          setMembers(json.data);
        }
        else if (Array.isArray(json)) {
          setMembers(json);
          console.log(json);
        } else {
          console.warn("Unexpected API shape; expected an array or { data: array }.");
          setMembers([]);
        }
      } catch (e) {
        console.error("Error fetching members:", e);
        setMembers([]);
      }
    };

    fetchMembers();
  }, []);

  const obsMembers = members.filter((member) =>
    ["Secretary", "Treasurer", "Joint Secretary"].includes(member.position)
  );

  const leadMembers = members.filter((member) =>
    [
      "Dev Lead",
      "CP Lead",
      "Graphic Lead",
      "Social Media Head",
      "Content Lead",
      "Communication Lead",
    ].includes(member.position)
  );

  const regularMembers = members.filter(
    (member) =>
      ![...obsMembers, ...leadMembers].map((m) => m._id).includes(member._id)
  );

  const leadsContainerRef = useRef(null);
  useEffect(() => {
    const leadsContainer = leadsContainerRef.current;
    if (!leadsContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(entry.target.querySelectorAll(".lead-card"), {
              y: 0,
              opacity: 1,
              stagger: 0.1,
              duration: 0.6,
              ease: "power3.out",
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(leadsContainer);
    return () => observer.disconnect();
  }, []);

  const membersContainerRef = useRef(null);
  useEffect(() => {
    const membersContainer = membersContainerRef.current;
    if (!membersContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(entry.target.querySelectorAll(".member-card"), {
              y: 0,
              opacity: 1,
              stagger: 0.05,
              duration: 0.5,
              ease: "power2.out",
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(membersContainer);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header Section */}
      <section className="relative pt-24 pb-16 px-4 md:px-8 lg:px-16 text-center">
        <motion.h1
          className="text-4xl md:text-6xl font-bold tracking-wider relative inline-block mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-white relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
            Our Team
          </span>
        </motion.h1>
      </section>

      {/* OBS Section */}
      <section className="relative px-4 md:px-8 lg:px-16 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center text-blue-400">
            Office Bearers
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8 md:gap-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-blue-900/10 rounded-3xl blur-xl -z-10"></div>

            {obsMembers.length === 0 ? (
              <p className="text-center text-gray-400">
                No office bearers found.
              </p>
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
      </section>

      {/* Leads Section */}
      <section className="relative px-4 md:px-8 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center text-blue-400">
            Team Leads
          </h2>

          {leadMembers.length === 0 ? (
            <p className="text-center text-gray-400">No leads found.</p>
          ) : (
            <div
              ref={leadsContainerRef}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8 relative"
            >
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
      </section>

      {/* Members Section */}
      <section className="relative px-4 md:px-8 lg:px-16 py-16 mb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center text-blue-400">
            Team Members
          </h2>

          {regularMembers.length === 0 ? (
            <p className="text-center text-gray-400">
              No regular members found.
            </p>
          ) : (
            <div
              ref={membersContainerRef}
              className="relative rounded-xl overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 relative">
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
    </main>
  );
}

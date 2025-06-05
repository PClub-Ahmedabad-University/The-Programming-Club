"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { JetBrains_Mono } from "next/font/google";
import { gsap } from "gsap";
import { data } from "./programming_club_members";
import Image from "next/image";
import Link from "next/link";
import { ShineBorder } from "@/ui-components/ShinyBorder";

// Import utility functions
import { getBorderColor, getGradient } from "./utils/colorUtils";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export default function TeamPage() {
  // Filter members by role
  const obsMembers = data.filter((member) =>
    ["Secretary", "Treasurer", "Joint Secretary"].includes(member.role)
  );

  // Sort OBS members to ensure correct order: Treasurer, Secretary, Joint Secretary
  obsMembers.sort((a, b) => {
    const order = { "Treasurer": 0, "Secretary": 1, "Joint Secretary": 2 };
    return order[a.role] - order[b.role];
  });

  // Filter team leads
  const devLead = data.find(member => member.role === "Dev Lead");
  const cpLead = data.find(member => member.role === "CP Lead");
  const graphicLead = data.find(member => member.role === "Graphic Lead");
  const socialMediaLead = data.find(member => member.role === "Social Media Head");
  const contentLead = data.find(member => member.role === "Content Lead");
  const communicationLead = data.find(member => member.role === "Communication Lead");

  // Filter team members
  const devTeamMembers = data.filter(member => member.role === "Dev Team Member");
  const cpTeamMembers = data.filter(member => member.role === "CP Team Member");
  const graphicTeamMembers = data.filter(member => member.role === "Graphic Team Member");
  const socialMediaTeamMembers = data.filter(member => member.role === "Social Media Team Member");
  const contentTeamMembers = data.filter(member => member.role === "Content Team Member");
  const communicationTeamMembers = data.filter(member => member.role === "Communication Team Member");

  // Animation refs
  const obsContainerRef = useRef(null);
  const teamSectionsRef = useRef([]);

  useEffect(() => {
    // Animate OBS cards on scroll
    const obsContainer = obsContainerRef.current;
    if (obsContainer) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target.querySelectorAll(".obs-card"), {
                y: 0,
                opacity: 1,
                stagger: 0.2,
                duration: 0.6,
                ease: "power3.out",
              });
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(obsContainer);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Animate team sections on scroll
    const teamSections = teamSectionsRef.current;
    if (teamSections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Animate the team lead
              gsap.to(entry.target.querySelector(".team-lead"), {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
              });
              
              // Animate team members with stagger
              gsap.to(entry.target.querySelectorAll(".team-member"), {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.5,
                delay: 0.2,
                ease: "power2.out",
              });
            }
          });
        },
        { threshold: 0.1 }
      );

      teamSections.forEach(section => {
        if (section) observer.observe(section);
      });

      return () => observer.disconnect();
    }
  }, []);

  // Function to render a team section
  const renderTeamSection = (title, lead, members, teamColor, index) => {
    if (!lead && (!members || members.length === 0)) return null;
    
    return (
      <section 
        key={title}
        ref={el => teamSectionsRef.current[index] = el}
        className="relative px-4 md:px-8 lg:px-16 py-16 mb-8"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center" style={{ color: teamColor }}>
            {title}
          </h2>

          <div className="relative">
            {/* Background effect */}
            <div 
              className="absolute inset-0 rounded-3xl blur-xl -z-10" 
              style={{ background: `linear-gradient(135deg, ${teamColor}10, transparent 80%)` }}
            ></div>

            {/* Team Lead */}
            {lead && (
              <div className="flex justify-center mb-12">
                <div 
                  className="team-lead opacity-0 translate-y-8"
                  style={{ maxWidth: "350px" }}
                >
                  <div
                    className="relative group overflow-hidden rounded-2xl h-[420px] w-full mx-auto"
                    style={{
                      background: getGradient(lead.role),
                      boxShadow: `0 10px 30px -5px ${teamColor}40`,
                    }}
                  >
                    <ShineBorder
                      borderWidth={2}
                      duration={8}
                      shineColor={[teamColor, "transparent"]}
                      className="absolute inset-0 rounded-2xl z-10"
                    />

                    {/* Image */}
                    <div className="relative w-full h-4/5 overflow-hidden">
                      <Image
                        src={lead.image}
                        alt={lead.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4 h-1/5 flex flex-col justify-center">
                      <h3 className="text-lg font-bold mb-2">{lead.name}</h3>
                      <p className="text-sm font-medium" style={{ color: teamColor }}>
                        {lead.role}
                      </p>
                    </div>

                    {/* Hover info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/50 backdrop-blur-sm flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                      <h3 className="text-xl font-bold mb-2">{lead.name}</h3>
                      <p className="font-medium mb-4" style={{ color: teamColor }}>{lead.role}</p>
                      <p className="text-sm mb-4">{lead.email}</p>
                      {lead.linkedin_id && (
                        <Link
                          href={`https://linkedin.com/in/${lead.linkedin_id}`}
                          target="_blank"
                          className="hover:text-blue-300 transition-colors"
                          style={{ color: teamColor }}
                        >
                          @{lead.linkedin_id}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Members */}
            {members && members.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {members.map((member, idx) => (
                  <div key={member.name} className="team-member opacity-0 translate-y-8">
                    <div
                      className="relative group overflow-hidden rounded-2xl h-[380px] w-full mx-auto"
                      style={{
                        background: getGradient(member.role),
                        boxShadow: `0 8px 20px -5px ${teamColor}30`,
                      }}
                    >
                      <ShineBorder
                        borderWidth={2}
                        duration={8}
                        shineColor={[teamColor, "transparent"]}
                        className="absolute inset-0 rounded-2xl z-10"
                      />

                      {/* Glow effect on hover */}
                      <div 
                        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm group-hover:animate-glow transition duration-500 z-0"
                        style={{ background: `linear-gradient(60deg, transparent, ${teamColor}40, transparent)` }}
                      ></div>

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
                        <p className="text-sm font-medium" style={{ color: teamColor }}>
                          {member.role}
                        </p>
                      </div>

                      {/* Hover info */}
                      <div className="rounded-2xl absolute inset-0 bg-gradient-to-t from-black/90 to-black/50 backdrop-blur-sm flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                        <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                        <p className="font-medium mb-4" style={{ color: teamColor }}>{member.role}</p>
                        <p className="text-sm mb-4">{member.email}</p>
                        {member.linkedin_id && (
                          <Link
                            href={`https://linkedin.com/in/${member.linkedin_id}`}
                            target="_blank"
                            className="hover:text-blue-300 transition-colors"
                            style={{ color: teamColor }}
                          >
                            @{member.linkedin_id}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header Section */}
      <section className="relative pt-24 pb-16 px-4 md:px-8 lg:px-16 text-center">
        <motion.h1
          className={`text-4xl md:text-6xl font-bold tracking-wider relative inline-block mb-4 ${jetbrainsMono.className}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-white relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
            Our Team
          </span>
        </motion.h1>
      </section>

      {/* OBS Section (Core Committee) */}
      <section className="relative px-4 md:px-8 lg:px-16 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center text-blue-400">
            Core Committee
          </h2>

          <div 
            ref={obsContainerRef}
            className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8 md:gap-12 relative"
          >
            {/* Background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-blue-900/10 rounded-3xl blur-xl -z-10"></div>

            <div className="flex flex-col md:flex-row justify-around items-center md:items-stretch w-full">
              {obsMembers.map((member, index) => {
                // Determine if this is the Secretary (center position)
                const isSecretary = member.role === "Secretary";

                return (
                  <div 
                    key={member.name}
                    className={`obs-card opacity-0 translate-y-8 ${isSecretary ? 'order-2 md:scale-110 z-10' : index === 0 ? 'order-1' : 'order-3'}`}
                  >
                    <div 
                      className={`relative group overflow-hidden rounded-2xl ${isSecretary ? 'w-72 h-[450px]' : 'w-[280px] h-[400px]'}`}
                      style={{
                        background: getGradient(member.role),
                        boxShadow: `0 10px 30px -5px ${getBorderColor(member.role)}40`,
                      }}
                    >
                      <ShineBorder 
                        borderWidth={2} 
                        duration={8} 
                        shineColor={[getBorderColor(member.role), "transparent"]} 
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
                          src={member.image} 
                          alt={member.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-4 py-6 text-center h-1/5 flex flex-col justify-center">
                        <h3 className="text-lg font-bold mb-2">{member.name}</h3>
                        <p className="text-sm font-medium text-blue-300 mb-3">{member.role}</p>
                      </div>
                      
                      {/* Hover info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/50 backdrop-blur-sm flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
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
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team-wise Sections */}
      {renderTeamSection("Development Team", devLead, devTeamMembers, "#06B6D4", 0)}
      {renderTeamSection("CP Team", cpLead, cpTeamMembers, "#F59E0B", 1)}
      {renderTeamSection("Graphic Team", graphicLead, graphicTeamMembers, "#EF4444", 2)}
      {renderTeamSection("Social Media Team", socialMediaLead, socialMediaTeamMembers, "#EC4899", 3)}
      {renderTeamSection("Content Team", contentLead, contentTeamMembers, "#14B8A6", 4)}
      {renderTeamSection("Communications Team", communicationLead, communicationTeamMembers, "#6366F1", 5)}
    </main>
  );
}

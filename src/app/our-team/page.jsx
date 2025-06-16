"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import Loader from "@/ui-components/Loader1";
import OBSCard from "./components/OBSCard";
import LeadCard from "./components/LeadCard";
import MemberCard from "./components/MemberCard";

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
		(member) => ![...obsMembers, ...leadMembers].map((m) => m._id).includes(member._id)
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

	// Function to render a team section
	const renderTeamSection = (title, lead, members, teamColor, index) => {
		if (!lead && (!members || members.length === 0)) return null;

		return (
			<section
				key={title}
				ref={(el) => (teamSectionsRef.current[index] = el)}
				className="relative px-4 md:px-8 lg:px-16 py-16 mb-8"
			>
				<div className="max-w-7xl mx-auto">
					<h2
						className="text-3xl md:text-4xl font-semibold mb-12 text-center"
						style={{ color: teamColor }}
					>
						{title}
					</h2>

					<div className="relative">
						{/* Background effect */}
						<div
							className="absolute inset-0 rounded-3xl blur-xl -z-10"
							style={{
								background: `linear-gradient(135deg, ${teamColor}10, transparent 80%)`,
							}}
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
											<p
												className="text-sm font-medium"
												style={{ color: teamColor }}
											>
												{lead.role}
											</p>
										</div>

										{/* Hover info */}
										<div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/50 backdrop-blur-sm flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
											<h3 className="text-xl font-bold mb-2">{lead.name}</h3>
											<p
												className="font-medium mb-4"
												style={{ color: teamColor }}
											>
												{lead.role}
											</p>
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
									<div
										key={member.name}
										className="team-member opacity-0 translate-y-8"
									>
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
												style={{
													background: `linear-gradient(60deg, transparent, ${teamColor}40, transparent)`,
												}}
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
												<h3 className="text-lg font-bold mb-2">
													{member.name}
												</h3>
												<p
													className="text-sm font-medium"
													style={{ color: teamColor }}
												>
													{member.role}
												</p>
											</div>

											{/* Hover info */}
											<div className="rounded-2xl absolute inset-0 bg-gradient-to-t from-black/90 to-black/50 backdrop-blur-sm flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
												<h3 className="text-xl font-bold mb-2">
													{member.name}
												</h3>
												<p
													className="font-medium mb-4"
													style={{ color: teamColor }}
												>
													{member.role}
												</p>
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
	if (loading) {
		return (
			<div className="fixed inset-0 bg-black flex items-center justify-center z-50">
				<Loader />
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-gray-950 text-white overflow-hidden font-content">
			{/* Header Section */}
			<section className="relative pt-24 pb-16 px-4 md:px-8 lg:px-16 text-center">
				<h1 className="text-4xl md:text-6xl font-bold tracking-wider relative inline-block mb-4">
					<span className="text-white font-heading relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
						Our Team
					</span>
					<span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
				</h1>
			</section>

			{/* OBS Section (Core Committee) */}
			<section className="relative px-4 md:px-8 lg:px-16 py-16">
				<div className="max-w-7xl mx-auto">
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
						<p className="text-center text-gray-400">No Team members found.</p>
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

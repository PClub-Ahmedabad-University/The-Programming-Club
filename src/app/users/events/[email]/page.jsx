"use client";
import Image from "next/image";
import { useState, useEffect, use } from "react";
import Link from "next/link";
// import { notFound } from "next/navigation";
import NotAllowed from "@/app/Components/NotAllowed";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
	FiCalendar,
	FiClock,
	FiMapPin,
	FiExternalLink,
	FiUsers,
	FiTrendingUp,
	FiStar,
	FiMenu,
	FiX,
} from "react-icons/fi";
import Loader from "@/ui-components/Loader1";

// Event status badge component
const StatusBadge = ({ status }) => {
	const statusStyles = {
		upcoming:
			"bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30",
		"on going":
			"bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30",
		completed:
			"bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border border-purple-500/30",
	};

	return (
		<span
			className={`text-xs font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-full ${
				statusStyles[status.toLowerCase()] ||
				"bg-gray-500/20 text-gray-400 border border-gray-500/30"
			}`}
		>
			{status}
		</span>
	);
};

// Event type badge component
const EventTypeBadge = ({ type }) => {
	const typeStyles = {
		cp: "bg-gradient-to-r from-amber-500 to-orange-500",
		dev: "bg-gradient-to-r from-emerald-500 to-green-500",
		fun: "bg-gradient-to-r from-pink-500 to-rose-500",
		workshop: "bg-gradient-to-r from-indigo-500 to-purple-500",
	};

	return (
		<span
			className={`text-xs font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-full text-white ${
				typeStyles[type.toLowerCase()] || "bg-gradient-to-r from-gray-500 to-gray-600"
			}`}
		>
			{type.toUpperCase()}
		</span>
	);
};

// Format date to readable format
const formatDate = (dateString) => {
	const date = new Date(dateString);
	const options = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	return date.toLocaleDateString("en-US", options);
};

// Format time to 12-hour format with AM/PM in IST
const formatTime = (timeIn24) => {
	try {
		const [hourStr, minuteStr] = timeIn24.split(":");
		let hours = parseInt(hourStr, 10);
		const minutes = minuteStr.padStart(2, "0");
		const ampm = hours >= 12 ? "PM" : "AM";
		const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
		return `${formattedHour}:${minutes} ${ampm}`;
	} catch (error) {
		return "Invalid time";
	}
};

const formatDateMobile = (dateString) => {
	const date = new Date(dateString);
	const options = {
		month: "short",
		day: "numeric",
	};
	return date.toLocaleDateString("en-US", options);
};

export default function UserEventsPage({ params = {} }) {
	const unwrappedParams = use(params);
	const ParamEmail = unwrappedParams?.email || "";
	const router = useRouter();

	if (!ParamEmail || typeof ParamEmail !== "string") {
		return (
			<div className="min-h-screen bg-pclubBg text-white p-4 sm:p-8">
				<h1 className="text-xl sm:text-2xl text-red-400 mb-4">Error</h1>
				<p className="text-sm sm:text-base">Invalid user identifier. Please try again.</p>
			</div>
		);
	}

	const [loading, setLoading] = useState(true);
	const [registeredEvents, setRegisteredEvents] = useState([]);
	const [isClient, setIsClient] = useState(false);
	const [showNotAllowed, setShowNotAllowed] = useState(false);
	const [activeFilter, setActiveFilter] = useState("All");
	const [hoveredEvent, setHoveredEvent] = useState(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Process email
	let email;
	if (ParamEmail == "programmingclub-2027") {
		email = "programmingclub.2027@gmail.com";
	} else {
		email = ParamEmail.includes("@")
			? ParamEmail
			: `${ParamEmail.replace(/-/g, ".")}@ahduni.edu.in`;
	}


	// Calculate stats
	const stats = {
		total: registeredEvents.length,
		upcoming: registeredEvents.filter((e) => e.status?.toLowerCase() === "upcoming").length,
		completed: registeredEvents.filter((e) => e.status?.toLowerCase() === "completed").length,
		ongoing: registeredEvents.filter((e) => e.status?.toLowerCase() === "on going").length,
	};

	// Filter options
	const filters = ["All", "Upcoming", "Ongoing", "Completed"];

	// Animation variants for the container
	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.03,
				delayChildren: 0.1,
			},
		},
	};

	// Animation variants for each item
	const item = {
		hidden: { opacity: 0, y: 20 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 12,
			},
		},
		exit: {
			opacity: 0,
			y: -20,
			transition: {
				duration: 0.2,
			},
		},
	};

	// Filter events based on active filter
	const filteredEvents = registeredEvents.filter((event) => {
		if (activeFilter === "All") return true;
		if (activeFilter === "Ongoing") {
			return event.status?.toLowerCase() === "on going";
		}
		return event.status?.toLowerCase() === activeFilter.toLowerCase();
	});

	const fetchEvents = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");
			const res = await fetch(`/api/user/events/${email}`, {
				headers: {
					authorization: "Bearer " + token,
				},
				method: "GET",
			});
			const data = await res.json();
			setRegisteredEvents(data.events || []);
		} catch (err) {
			setRegisteredEvents([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setIsClient(true);
	}, []);
	

	// Handle navigation and authentication in useEffect
	useEffect(() => {
		if (isClient) {
			const currentUser = localStorage.getItem("user");
			if (!currentUser) {
				router.push("/users/login");
			} else if (email !== currentUser) {
				// User is authenticated but not authorized for this page
				setShowNotAllowed(true);
			} else {
				// User is authorized, fetch events
				fetchEvents();
			}
		}
	}, [isClient, email, router]);

	if (!isClient) {
		return (
			<div className="min-h-screen font-content bg-pclubBg text-white p-4 sm:p-8 flex items-center justify-center">
				<div className="animate-pulse text-sm sm:text-base">Loading...</div>
			</div>
		);
	}

	if (showNotAllowed) {
		return <NotAllowed />;
	}

	if (loading) {
		return (
			<div className="fixed inset-0 bg-black flex items-center justify-center z-50">
				<Loader />
			</div>
		);
	}

	return (
		<>
			<div className="font-content min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
				{/* Animated background elements - Responsive */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
					<div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
				</div>

				<div className="relative z-10 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16 px-3 sm:px-4 md:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto">
						{/* Hero Section - Enhanced Responsive */}
						<div className="text-center mb-8 sm:mb-12 md:mb-16">
							<div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full border border-cyan-500/20 mb-3 sm:mb-4 md:mb-6">
								<FiStar className="mr-1.5 sm:mr-2 text-cyan-400 text-sm" />
								<span className="text-xs sm:text-sm text-cyan-400 font-medium">
									Your Event Journey
								</span>
							</div>
							<h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent leading-tight px-2">
								Registered Events
							</h1>
							<p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
								Discover your personalized event dashboard with insights, progress
								tracking, and seamless navigation
							</p>
						</div>

						{/* Stats Dashboard - Enhanced Grid Responsive */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
							<div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
									<div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300 mb-2 sm:mb-0 w-fit">
										<FiTrendingUp className="text-cyan-400 text-base sm:text-lg md:text-xl" />
									</div>
									<span className="text-xl sm:text-2xl font-bold text-white">
										{stats.total}
									</span>
								</div>
								<h3 className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide">
									Total Events
								</h3>
							</div>

							<div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 group">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
									<div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300 mb-2 sm:mb-0 w-fit">
										<FiClock className="text-emerald-400 text-base sm:text-lg md:text-xl" />
									</div>
									<span className="text-xl sm:text-2xl font-bold text-white">
										{stats.upcoming}
									</span>
								</div>
								<h3 className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide">
									Upcoming
								</h3>
							</div>

							<div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-700/50 hover:border-orange-500/30 transition-all duration-300 group">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
									<div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300 mb-2 sm:mb-0 w-fit">
										<FiUsers className="text-orange-400 text-base sm:text-lg md:text-xl" />
									</div>
									<span className="text-xl sm:text-2xl font-bold text-white">
										{stats.ongoing}
									</span>
								</div>
								<h3 className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide">
									Ongoing
								</h3>
							</div>

							<div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-700/50 hover:border-violet-500/30 transition-all duration-300 group">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
									<div className="p-2 sm:p-3 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300 mb-2 sm:mb-0 w-fit">
										<FiStar className="text-violet-400 text-base sm:text-lg md:text-xl" />
									</div>
									<span className="text-xl sm:text-2xl font-bold text-white">
										{stats.completed}
									</span>
								</div>
								<h3 className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide">
									Completed
								</h3>
							</div>
						</div>

						{/* Filter Tabs - Mobile Optimized */}
						<div className="flex justify-center mb-6 sm:mb-8 md:mb-12 px-2">
							<div className="w-full max-w-4xl">
								{/* Mobile Filter Menu */}
								<div className="sm:hidden mb-4">
									<button
										onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
										className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 text-white"
									>
										<span className="font-medium">Filter: {activeFilter}</span>
										{isMobileMenuOpen ? <FiX /> : <FiMenu />}
									</button>

									<AnimatePresence>
										{isMobileMenuOpen && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												className="mt-2 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden"
											>
												{filters.map((filter) => (
													<button
														key={filter}
														onClick={() => {
															setActiveFilter(filter);
															setIsMobileMenuOpen(false);
														}}
														className={`w-full text-left px-4 py-3 transition-colors duration-200 ${
															activeFilter === filter
																? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400"
																: "text-gray-400 hover:text-white hover:bg-slate-700/50"
														}`}
													>
														{filter}
													</button>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								</div>

								{/* Desktop Filter Tabs */}
								<div className="hidden sm:block overflow-x-auto">
									<div className="inline-flex bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-1 sm:p-2 border border-slate-700/50 min-w-max mx-auto">
										{filters.map((filter) => (
											<motion.button
												key={filter}
												onClick={() => setActiveFilter(filter)}
												className={`relative px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 overflow-hidden text-sm sm:text-base whitespace-nowrap ${
													activeFilter === filter
														? "text-white"
														: "text-gray-400 hover:text-white hover:bg-slate-700/50"
												}`}
												whileHover={{ scale: 1.03 }}
												whileTap={{ scale: 0.98 }}
											>
												{activeFilter === filter && (
													<motion.span
														layoutId="activeFilter"
														className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg sm:rounded-xl"
														style={{ zIndex: -1 }}
														initial={false}
														transition={{
															type: "spring",
															stiffness: 300,
															damping: 25,
														}}
													/>
												)}
												<span className="relative z-10">{filter}</span>
											</motion.button>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Events Display - Enhanced Responsive */}
						{!registeredEvents || registeredEvents.length === 0 ? (
							<div className="text-center py-12 sm:py-16 md:py-20">
								<div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-sm sm:max-w-lg mx-auto border border-slate-700/50">
									<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
										<FiCalendar className="text-2xl sm:text-3xl text-cyan-400" />
									</div>
									<h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
										No events registered yet
									</h3>
									<p className="text-gray-400 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
										Start your journey by exploring our amazing events
										collection.
									</p>
									<Link
										href="/events"
										className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl sm:rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 text-sm sm:text-base"
									>
										<span className="font-medium">Browse Events</span>
										<FiExternalLink className="ml-2 text-sm sm:text-lg" />
									</Link>
								</div>
							</div>
						) : filteredEvents.length === 0 ? (
							<div className="text-center py-12 sm:py-16 md:py-20">
								<div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-sm sm:max-w-lg mx-auto border border-slate-700/50">
									<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
										<FiCalendar className="text-2xl sm:text-3xl text-cyan-400" />
									</div>
									<h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
										No {activeFilter.toLowerCase()} events found
									</h3>
									<p className="text-gray-400 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
										Try selecting a different filter to see other events.
									</p>
								</div>
							</div>
						) : (
							<AnimatePresence mode="wait">
								<motion.div
									key={activeFilter}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.3 }}
									className="space-y-6 sm:space-y-8"
								>
									<motion.div
										variants={container}
										initial="hidden"
										animate="show"
										className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
									>
										{filteredEvents
											.filter((event) => event && event._id)
											.map((event, index) => (
												<motion.div
													key={`${event._id}-${event.title || ""}`}
													variants={item}
													className="group"
													onMouseEnter={() => setHoveredEvent(event._id)}
													onMouseLeave={() => setHoveredEvent(null)}
												>
													<div className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10">
														{/* Image Section */}
														<div className="relative overflow-hidden">
															<div className="aspect-[4/3] relative w-full">
																<Image
																	src={
																		event.imageUrl ||
																		"/default-event-image.jpg"
																	}
																	alt={event.title || "Event"}
																	fill
																	className="object-cover group-hover:scale-110 transition-transform duration-700"
																	sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
																/>
																<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

																{/* Floating badges */}
																<div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
																	<StatusBadge
																		status={
																			event.status ||
																			"upcoming"
																		}
																	/>
																	<EventTypeBadge
																		type={event.type || "event"}
																	/>
																</div>
															</div>
														</div>

														{/* Content Section */}
														<div className="p-3 sm:p-4 md:p-6">
															<h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 sm:mb-3 leading-tight group-hover:text-cyan-300 transition-colors duration-300 line-clamp-2">
																{event.title || "Event Title"}
															</h3>
															<p className="text-gray-300 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3 leading-relaxed">
																{event.description ||
																	"No description available"}
															</p>

															{/* Event Details */}
															<div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 md:mb-6">
																<div className="flex items-center text-gray-400">
																	<div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
																		<FiCalendar className="text-cyan-400 text-xs sm:text-sm" />
																	</div>
																	<div className="text-xs sm:text-sm">
																		{event.date ? (
																			<>
																				<div className="sm:hidden">
																					<div>
																						{formatDateMobile(
																							event.date
																						)}
																					</div>
																					<div className="text-cyan-300">
																						{formatTime(
																							event.time
																						)}
																					</div>
																				</div>
																				<div className="hidden sm:block">
																					<div>
																						{formatDate(
																							event.date
																						)}
																					</div>
																					<div className="text-cyan-300">
																						{formatTime(
																							event.time
																						)}
																					</div>
																				</div>
																			</>
																		) : (
																			"Date TBD"
																		)}
																	</div>
																</div>
																{event.location && (
																	<div className="flex items-center text-gray-400">
																		<div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
																			<FiMapPin className="text-emerald-400 text-xs sm:text-sm" />
																		</div>
																		<span className="text-xs sm:text-sm line-clamp-1">
																			{event.location}
																		</span>
																	</div>
																)}
															</div>

															{/* Action Section */}
															<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 sm:pt-4 border-t border-slate-700/50 space-y-2 sm:space-y-0">
																<Link
																	href={`/events/${
																		event.slug || event._id
																	}`}
																	className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300 group text-xs sm:text-sm"
																>
																	<span>View Details</span>
																	<FiExternalLink className="ml-1 sm:ml-2 text-xs sm:text-sm group-hover:translate-x-1 transition-transform duration-300" />
																</Link>
																<div className="flex items-center justify-end sm:justify-start">
																	<div
																		className={`w-2 h-2 rounded-full mr-2 ${
																			event.status?.toLowerCase() ===
																			"completed"
																				? "bg-violet-400"
																				: "bg-emerald-400"
																		}`}
																	></div>
																	<span className="text-xs text-white font-medium">
																		{event.status?.toLowerCase() ===
																		"completed"
																			? "Attended"
																			: "Registered"}
																	</span>
																</div>
															</div>
														</div>
													</div>
												</motion.div>
											))}
									</motion.div>
								</motion.div>
							</AnimatePresence>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

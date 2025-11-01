"use client";
import Image from "next/image";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import NotAllowed from "@/app/Components/NotAllowed";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import RichTextRenderer from "@/app/Components/RichTextRenderer";
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
	FiArrowRight,
	FiFilter,
} from "react-icons/fi";
import Loader from "@/ui-components/Loader1";

// Event status badge component
const StatusBadge = ({ status }) => {
	const statusStyles = {
		upcoming:
			"bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/20",
		"on going":
			"bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/20",
		completed:
			"bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/20",
	};

	return (
		<span
			className={`text-[10px] sm:text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-xl ${statusStyles[status.toLowerCase()] ||
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
		cp: "bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30",
		dev: "bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30",
		fun: "bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30",
		workshop: "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30",
	};

	return (
		<span
			className={`text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-white backdrop-blur-xl ${typeStyles[type.toLowerCase()] || "bg-gradient-to-r from-gray-500 to-gray-600"
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
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-8 flex items-center justify-center">
				<div className="text-center bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30">
					<h1 className="text-xl sm:text-2xl text-red-400 mb-4 font-bold">Error</h1>
					<p className="text-sm sm:text-base text-gray-300">Invalid user identifier. Please try again.</p>
				</div>
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

	// Animation variants
	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
				delayChildren: 0.1,
			},
		},
	};

	const item = {
		hidden: { opacity: 0, y: 30, scale: 0.95 },
		show: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 15,
			},
		},
		exit: {
			opacity: 0,
			y: -20,
			scale: 0.95,
			transition: {
				duration: 0.2,
			},
		},
	};

	// Filter events
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
			data.events.sort((a, b) => new Date(b.date) - new Date(a.date));
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

	useEffect(() => {
		if (!isClient || !email) return;

		const currentUser = localStorage.getItem("user");
		if (!currentUser) {
			router.push("/users/login");
			return;
		}

		if (email !== currentUser) {
			setShowNotAllowed(true);
			return;
		}

		fetchEvents();
	}, [router, email, isClient]);

	if (!isClient) {
		return (
			<div className="min-h-screen font-content bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-8 flex items-center justify-center">
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
		<div className="font-content min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
			{/* Enhanced animated background */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-violet-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
			</div>

			<div className="relative z-10 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-8 lg:px-12">
				<div className="max-w-[1600px] mx-auto">
					{/* Hero Section */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center mb-12 sm:mb-16 md:mb-20"
					>
						<div className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full border border-cyan-500/20 mb-4 sm:mb-6 backdrop-blur-xl shadow-lg shadow-cyan-500/10">
							<FiStar className="mr-2 text-cyan-400 text-sm sm:text-base animate-pulse" />
							<span className="text-xs sm:text-sm text-cyan-400 font-semibold tracking-wide">
								Your Event Journey
							</span>
						</div>
						<h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent leading-tight px-4">
							Registered Events
						</h1>
						<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
							Track your amazing event journey and experiences
						</p>
					</motion.div>

					{/* Stats Dashboard */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 md:mb-16"
					>
						{[
							{ label: "Total Events", value: stats.total, icon: FiTrendingUp, color: "cyan" },
							{ label: "Upcoming", value: stats.upcoming, icon: FiClock, color: "emerald" },
							{ label: "Ongoing", value: stats.ongoing, icon: FiUsers, color: "orange" },
							{ label: "Completed", value: stats.completed, icon: FiStar, color: "violet" },
						].map((stat, index) => (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.1 * index }}
								whileHover={{ scale: 1.05, y: -5 }}
								className={`bg-gradient-to-br from-slate-800/80 via-slate-800/50 to-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-700/50 hover:border-${stat.color}-500/50 transition-all duration-300 group cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-${stat.color}-500/20`}
							>
								<div className="flex items-start justify-between mb-3 sm:mb-4">
									<div className={`p-3 sm:p-4 bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-${stat.color}-500/20`}>
										<stat.icon className={`text-${stat.color}-400 text-xl sm:text-2xl md:text-3xl`} />
									</div>
									<span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
										{stat.value}
									</span>
								</div>
								<h3 className="text-gray-400 text-xs sm:text-sm md:text-base uppercase tracking-wider font-semibold">
									{stat.label}
								</h3>
							</motion.div>
						))}
					</motion.div>

					{/* Filter Section */}
					<div className="flex justify-center mb-8 sm:mb-12 md:mb-16 px-2">
						<div className="w-full max-w-5xl">
							{/* Mobile Filter */}
							<div className="lg:hidden mb-4">
								<button
									onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
									className="w-full flex items-center justify-between px-5 py-4 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 text-white hover:border-cyan-500/50 transition-all duration-300 shadow-xl"
								>
									<div className="flex items-center">
										<FiFilter className="mr-3 text-cyan-400" />
										<span className="font-semibold">Filter: <span className="text-cyan-400">{activeFilter}</span></span>
									</div>
									{isMobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
								</button>

								<AnimatePresence>
									{isMobileMenuOpen && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											className="mt-3 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl"
										>
											{filters.map((filter, index) => (
												<motion.button
													key={filter}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													onClick={() => {
														setActiveFilter(filter);
														setIsMobileMenuOpen(false);
													}}
													className={`w-full text-left px-5 py-4 transition-all duration-300 ${activeFilter === filter
															? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-400 font-semibold"
															: "text-gray-400 hover:text-white hover:bg-slate-700/50"
														}`}
												>
													{filter}
												</motion.button>
											))}
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Desktop Filter */}
							<div className="hidden lg:block">
								<div className="inline-flex bg-slate-800/80 backdrop-blur-xl rounded-2xl p-2 border border-slate-700/50 shadow-2xl mx-auto">
									{filters.map((filter) => (
										<motion.button
											key={filter}
											onClick={() => setActiveFilter(filter)}
											className={`relative px-6 md:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden text-sm md:text-base lg:text-lg whitespace-nowrap ${activeFilter === filter
													? "text-white"
													: "text-gray-400 hover:text-white hover:bg-slate-700/50"
												}`}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											{activeFilter === filter && (
												<motion.span
													layoutId="activeFilter"
													className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl shadow-lg shadow-cyan-500/50"
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

					{/* Events Grid */}
					{!registeredEvents || registeredEvents.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5 }}
							className="text-center py-16 sm:py-20 md:py-24"
						>
							<div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-8 sm:p-12 md:p-16 max-w-2xl mx-auto border border-slate-700/50 shadow-2xl">
								<div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl shadow-cyan-500/20">
									<FiCalendar className="text-4xl sm:text-5xl md:text-6xl text-cyan-400" />
								</div>
								<h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">
									No events registered yet
								</h3>
								<p className="text-gray-400 mb-8 sm:mb-10 leading-relaxed text-base sm:text-lg md:text-xl max-w-lg mx-auto">
									Start your journey by exploring our amazing events collection and register for upcoming experiences.
								</p>
								<Link
									href="/events"
									className="inline-flex items-center px-8 sm:px-10 md:px-12 py-4 sm:py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-2xl hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 transition-all duration-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 text-base sm:text-lg font-bold group"
								>
									<span>Browse Events</span>
									<FiArrowRight className="ml-3 text-xl group-hover:translate-x-2 transition-transform duration-300" />
								</Link>
							</div>
						</motion.div>
					) : filteredEvents.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5 }}
							className="text-center py-16 sm:py-20 md:py-24"
						>
							<div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-8 sm:p-12 md:p-16 max-w-2xl mx-auto border border-slate-700/50 shadow-2xl">
								<div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl shadow-cyan-500/20">
									<FiCalendar className="text-4xl sm:text-5xl md:text-6xl text-cyan-400" />
								</div>
								<h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">
									No {activeFilter.toLowerCase()} events found
								</h3>
								<p className="text-gray-400 leading-relaxed text-base sm:text-lg md:text-xl">
									Try selecting a different filter to see other events.
								</p>
							</div>
						</motion.div>
					) : (
						<AnimatePresence mode="wait">
							<motion.div
								key={activeFilter}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
							>
								<motion.div
									variants={container}
									initial="hidden"
									animate="show"
									className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
								>
									{filteredEvents
										.filter((event) => event && event._id)
										.map((event) => (
											<motion.div
												key={`${event._id}-${event.title || ""}`}
												variants={item}
												whileHover={{ y: -8, scale: 1.02 }}
												onMouseEnter={() => setHoveredEvent(event._id)}
												onMouseLeave={() => setHoveredEvent(null)}
												className="group"
											>
												<div className="flex flex-col bg-gradient-to-br from-slate-800/80 via-slate-800/50 to-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 h-full">
													{/* Image Section */}
													<div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
														<Image
															src={event.imageUrl}
															alt={event.title || "Event"}
															fill
															className="object-cover group-hover:scale-110 transition-transform duration-700"
														/>
														<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

														{/* Floating badges */}
														<div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 justify-between items-start">
															<StatusBadge status={event.status || "upcoming"} />
															<EventTypeBadge type={event.type || "event"} />
														</div>

														{/* Hover overlay */}
														<motion.div
															initial={{ opacity: 0 }}
															animate={{ opacity: hoveredEvent === event._id ? 1 : 0 }}
															className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none"
														/>
													</div>

													{/* Content Section */}
													<div className="flex flex-col flex-grow p-5 sm:p-6 md:p-7">
														<h3 className="text-xl sm:text-2xl md:text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300 line-clamp-2 leading-tight">
															{event.title || "Event Title"}
														</h3>

														<div className="text-gray-300 mb-5 text-sm sm:text-base line-clamp-2 leading-relaxed flex-grow">
															<RichTextRenderer content={event.description || "No description available"} />
														</div>

														{/* Event Details */}
														<div className="space-y-3 mb-5">
															<div className="flex items-start text-gray-400">
																<div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 shadow-lg shadow-cyan-500/20">
																	<FiCalendar className="text-cyan-400 text-sm" />
																</div>
																<div className="text-sm flex-grow">
																	{event.date ? (
																		<>
																			<div className="font-semibold text-white">{formatDate(event.date)}</div>
																			<div className="text-cyan-400 font-medium">{event.time}</div>
																		</>
																	) : (
																		<div className="font-semibold text-white">Date TBD</div>
																	)}
																</div>
															</div>

															{event.location && (
																<div className="flex items-center text-gray-400">
																	<div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 shadow-lg shadow-emerald-500/20">
																		<FiMapPin className="text-emerald-400 text-sm" />
																	</div>
																	<span className="text-sm line-clamp-2 flex-grow font-medium">{event.location}</span>
																</div>
															)}
														</div>

														{/* Action Section */}
														<div className="flex items-center justify-between border-t border-slate-700/50 pt-4 mt-auto">
															<Link
																href={`/events/${event.slug || event._id}`}
																className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-semibold transition-all duration-300 group/link text-sm sm:text-base"
															>
																<span>View Details</span>
																<FiArrowRight className="ml-2 text-base group-hover/link:translate-x-2 transition-transform duration-300" />
															</Link>
															<div className="flex items-center">
																<div
																	className={`w-2.5 h-2.5 rounded-full mr-2 shadow-lg ${event.status?.toLowerCase() === "completed"
																			? "bg-violet-400 shadow-violet-400/50"
																			: "bg-emerald-400 shadow-emerald-400/50 animate-pulse"
																		}`}
																></div>
																<span className="text-xs sm:text-sm text-white font-semibold">
																	{event.status?.toLowerCase() === "completed" ? "Attended" : "Registered"}
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
	);
}
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JetBrains_Mono } from "next/font/google";
import EventCard from "../Components/EventCard";
import Loader from "@/ui-components/Loader1";
import { useRouter } from "next/navigation";
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

const eventTypes = [
	{ id: "ALL", label: "All" },
	// { id: "HACKATHONS", label: "Hackathons" },
	{ id: "CP", label: "CP Events" },
	{ id: "DEV", label: "Dev Events" },
	{ id: "FUN", label: "Fun Events" },
	{ id: "COMPLETED", label: "Completed" },
];

const isEventPassed = (dateStr) => {
	const months = {
		January: 0,
		February: 1,
		March: 2,
		April: 3,
		May: 4,
		June: 5,
		July: 6,
		August: 7,
		September: 8,
		October: 9,
		November: 10,
		December: 11,
	};
	const cleanDate = dateStr.replace(/(st|nd|rd|th)/, "");
	const [day, month] = cleanDate.split(" ");
	const currentYear = new Date().getFullYear();
	const date = new Date(currentYear, months[month], parseInt(day));
	return date < new Date();
};

const EventsPage = () => {
	const [selectedType, setSelectedType] = useState("ALL");
	const [visibleEvents, setVisibleEvents] = useState(4);
	const [isOpen, setIsOpen] = useState(false);
	const [events, setEvents] = useState([]);
	const [eventsWithWinners, setEventsWithWinners] = useState(new Set());
	const [loading, setLoading] = useState(false);
	const [showMsg, setShowMsg] = useState(true);
	const router = useRouter();

	// Function to check if event has winners
	const checkEventWinners = async (eventId) => {
		try {
			const res = await fetch(`/api/events/winners/get/${eventId}`, {
				headers: {
					"Authorization": `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "application/json",
				},
			});
			if (res.ok) {
				const data = await res.json();
				// Check both possible response structures
				return (data.event?.winners?.length > 0) || (data.winners?.length > 0);
			}
			return false;
		} catch (error) {
			console.error('Error checking winners:', error);
			return false;
		}
	};

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setLoading(true);
				const res = await fetch("/api/events/get",
					{
						headers: {
							"Authorization": `Bearer ${localStorage.getItem("token")}`,
							"Content-Type": "application/json",
						},
					}
				);
				const json = await res.json();

				json.data = (json.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));

				// Map API data to frontend structure
				const mappedEvents = json.data.map((event) => {
					const dateObj = new Date(event.date);
					const day = dateObj.getDate();
					const month = dateObj.toLocaleString("default", { month: "long" });
					const year = dateObj.getFullYear();
					const getDaySuffix = (d) => {
						if (d > 3 && d < 21) return "th";
						switch (d % 10) {
							case 1: return "st";
							case 2: return "nd";
							case 3: return "rd";
							default: return "th";
						}
					};
					const formattedDate = `${day}${getDaySuffix(day)} ${month} ${year}`;

					// Use the status from the event data if available, otherwise check the date
					const isEventCompleted = event.status === "Completed" || isEventPassed(formattedDate);
					const hasWinners = event.winners?.length > 0;

					return {
						...event,
						id: event._id,
						image: event.imageUrl,
						date: formattedDate,
						time: event.time,
						type: event.type || "ALL",
						status: isEventCompleted ? "Completed" : "Not-Completed",
						venue: event.location,
						contact: event.contact || [],
						registrationLink: event.formLink || "#",
						isCompleted: isEventCompleted,  // This will now be true if status is "Completed" or if the event has passed
						hasWinners: hasWinners,  // Directly use the winners array from the event
						winners: event.winners || []  // Ensure winners is always an array
					};
				});

				setEvents(mappedEvents);

				// Check winners for completed events
				const completedEvents = mappedEvents.filter(event => event.isCompleted);
				const winnersPromises = completedEvents.map(async (event) => {
					const hasWinners = await checkEventWinners(event.id);
					return { eventId: event.id, hasWinners };
				});

				const winnersResults = await Promise.all(winnersPromises);
				const eventsWithWinnersSet = new Set(
					winnersResults
						.filter(result => result.hasWinners)
						.map(result => result.eventId)
				);

				setEventsWithWinners(eventsWithWinnersSet);

			} catch (error) {
				setEvents([]);
			} finally {
				setLoading(false);
			}
		};
		fetchEvents();
	}, []);

	const sortedEvents = events;

	// Filter events based on selected type
	const filteredEvents = sortedEvents.filter((event) => {
		if (selectedType === "ALL") return true;
		if (selectedType === "COMPLETED") {
			// For completed filter, check if event has passed or status is completed
			return event.isCompleted || event.status === "Completed";
		}
		// For other filters, match the type regardless of completion status
		return event.type === selectedType;
	});

	const displayedEvents =
		selectedType === "ALL" ? filteredEvents.slice(0, visibleEvents) : filteredEvents;

	const noEventsFound = filteredEvents.length === 0;

	const totalEvents = sortedEvents.length;
	const hasMoreEvents = selectedType === "ALL" && visibleEvents < totalEvents;

	const handleLoadMore = () => {
		setVisibleEvents((prev) => prev + 4);
	};

	// Enhanced EventCard component that receives winner info and navigation handler
	const EnhancedEventCard = ({ event }) => {
		const hasWinners = eventsWithWinners.has(event.id);
		const isCompleted = event.isCompleted;

		const handleWinnersClick = () => {
			if (hasWinners && isCompleted) {
				router.push(`/winner/${event.id}`);
			}
		};

		// Clone the event object and add winner information
		const enhancedEvent = {
			...event,
			hasWinners,
			onWinnersClick: handleWinnersClick
		};
		// console.log("enhancedEvent", enhancedEvent);

		return <EventCard event={enhancedEvent} />;
	};

	return (
		<>
			{loading && (
				<div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center z-50">
					<Loader />
				</div>
			)}
			<section className="w-full font-content flex flex-col justify-center gap-8 sm:gap-12 md:gap-16 min-h-screen py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
				<div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="relative inline-block"
					>
						<h1 className="text-4xl font-heading md:text-6xl font-bold tracking-wider relative inline-block mb-4">
							<span className="relative z-10 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent border-3 border-blue-400/30 rounded-lg px-12 py-4 backdrop-blur-sm">
								EVENTS
							</span>
							<span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-lg z-0 rounded-lg"></span>
						</h1>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
					className="w-full flex flex-col items-center gap-8 sm:gap-10 md:gap-12"
				>
					{/* Desktop Filter Buttons */}
					<div className="hidden sm:flex flex-wrap justify-center gap-6 bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/10">
						{eventTypes.map((type) => (
							<motion.button
								key={type.id}
								onClick={() => setSelectedType(type.id)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`px-4 sm:px-6 md:px-8 py-3 rounded-full text-md sm:text-lg transition-all duration-300 font-heading relative overflow-hidden ${selectedType === type.id
									? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
									: "text-white hover:bg-white/10 border border-transparent hover:border-white/20"
									}`}
							>
								{selectedType === type.id && (
									<motion.div
										layoutId="activeTab"
										className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
										transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
									/>
								)}
								<span className="relative z-10">{type.label}</span>
							</motion.button>
						))}
					</div>

					{/* Mobile Dropdown */}
					<div className="sm:hidden w-full max-w-[70%] mx-auto relative">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className={`w-full px-4 py-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 focus:outline-none focus:border-blue-500 text-center transition-all duration-300 ${jetbrainsMono.className}`}
						>
							{eventTypes.find((type) => type.id === selectedType)?.label}
							<motion.span
								className="absolute right-4 top-1/2 transform -translate-y-1/2"
								animate={{ rotate: isOpen ? 180 : 0 }}
								transition={{ duration: 0.3 }}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="white"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="w-4 h-4"
								>
									<polyline points="6 9 12 15 18 9"></polyline>
								</svg>
							</motion.span>
						</button>
						<AnimatePresence>
							{isOpen && (
								<motion.div
									initial={{ opacity: 0, y: -10, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -10, scale: 0.95 }}
									transition={{ duration: 0.2 }}
									className="absolute top-full left-0 right-0 mt-2 bg-gray-800/90 backdrop-blur-md rounded-lg overflow-hidden z-50 border border-white/10"
								>
									{eventTypes.map((type) => (
										<button
											key={type.id}
											onClick={() => {
												setSelectedType(type.id);
												setIsOpen(false);
											}}
											className={`w-full py-3 px-4 text-center text-sm transition-all duration-200 ${jetbrainsMono.className
												} ${selectedType === type.id
													? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
													: "text-white hover:bg-white/10"
												}`}
										>
											{type.label}
										</button>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Events Grid */}
					<motion.div
						layout
						className="flex flex-col gap-6 sm:gap-8 md:gap-10 w-full items-center"
					>
						{noEventsFound ? (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-center py-12 px-8 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl w-full max-w-2xl mx-auto border border-white/10"
							>
								<div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-white/10">
									<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
								<h3 className={`font-heading text-2xl font-bold text-white mb-4`}>
									No Events Found
								</h3>
								<p className="text-gray-300 mb-6 leading-relaxed">
									{selectedType === "ALL"
										? "There are no events scheduled at the moment. Please check back later!"
										: `There are no ${eventTypes
											.find((t) => t.id === selectedType)
											?.label.toLowerCase()} scheduled at the moment.`}
								</p>
								{selectedType !== "ALL" && (
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => setSelectedType("ALL")}
										className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all duration-300 font-medium"
									>
										View All Events
									</motion.button>
								)}
							</motion.div>
						) : (
							<AnimatePresence mode="wait">
								{displayedEvents.map((event, index) => (
									<motion.div
										key={event.id || event._id || index}
										initial={{ opacity: 0, y: 50, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: -50, scale: 0.95 }}
										transition={{
											duration: 0.6,
											delay: index * 0.1,
											ease: [0.4, 0, 0.2, 1],
										}}
										layout
										className="w-full flex justify-center px-4 sm:px-6 md:px-8"
									>
										<EnhancedEventCard event={event} />
									</motion.div>
								))}
							</AnimatePresence>
						)}
					</motion.div>

					{/* Load More Button */}
					{hasMoreEvents && (
						<motion.button
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							whileHover={{ scale: 1.05, y: -2 }}
							whileTap={{ scale: 0.95 }}
							transition={{ duration: 0.3 }}
							onClick={handleLoadMore}
							className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/20 text-white rounded-full hover:from-blue-600/30 hover:to-purple-600/30 hover:border-white/30 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl group"
						>
							<span className="flex items-center gap-3">
								Load More Events
								<svg className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
								</svg>
							</span>
						</motion.button>
					)}
				</motion.div>
			</section>
		</>
	);
};

export default EventsPage;
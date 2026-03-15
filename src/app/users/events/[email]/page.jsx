"use client";
import Image from "next/image";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import NotAllowed from "@/app/Components/NotAllowed";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import RichTextRenderer from "@/app/Components/RichTextRenderer";
import { useUser } from "@/lib/UserContext";
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
			className={`text-[10px] sm:text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-xl ${
				statusStyles[status?.toLowerCase()] ||
				"bg-gray-500/20 text-gray-400 border border-gray-500/30"
			}`}
		>
			{status}
		</span>
	);
};

const EventTypeBadge = ({ type }) => {
	const typeStyles = {
		cp: "bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30",
		dev: "bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30",
		fun: "bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30",
		workshop: "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30",
	};

	return (
		<span
			className={`text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-white backdrop-blur-xl ${
				typeStyles[type?.toLowerCase()] ||
				"bg-gradient-to-r from-gray-500 to-gray-600"
			}`}
		>
			{type?.toUpperCase()}
		</span>
	);
};

const formatDate = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

export default function UserEventsPage({ params = {} }) {
	const unwrappedParams = use(params);
	const ParamEmail = unwrappedParams?.email || "";
	const router = useRouter();
	const { token } = useUser();

	const [loading, setLoading] = useState(true);
	const [registeredEvents, setRegisteredEvents] = useState([]);
	const [isClient, setIsClient] = useState(false);
	const [showNotAllowed, setShowNotAllowed] = useState(false);
	const [activeFilter, setActiveFilter] = useState("All");
	const [hoveredEvent, setHoveredEvent] = useState(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	if (!ParamEmail || typeof ParamEmail !== "string") {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				Invalid user identifier
			</div>
		);
	}

	let email;
	if (ParamEmail === "programmingclub-2027") {
		email = "programmingclub.2027@gmail.com";
	} else {
		email = ParamEmail.includes("@")
			? ParamEmail
			: `${ParamEmail.replace(/-/g, ".")}@ahduni.edu.in`;
	}

	const stats = {
		total: registeredEvents.length,
		upcoming: registeredEvents.filter(
			(e) => e.status?.toLowerCase() === "upcoming"
		).length,
		completed: registeredEvents.filter(
			(e) => e.status?.toLowerCase() === "completed"
		).length,
		ongoing: registeredEvents.filter(
			(e) => e.status?.toLowerCase() === "on going"
		).length,
	};

	const filters = ["All", "Upcoming", "Ongoing", "Completed"];

	const filteredEvents = registeredEvents.filter((event) => {
		if (activeFilter === "All") return true;
		if (activeFilter === "Ongoing")
			return event.status?.toLowerCase() === "on going";
		return event.status?.toLowerCase() === activeFilter.toLowerCase();
	});

	const fetchEvents = async () => {
		try {
			setLoading(true);

			const res = await fetch(`/api/user/events/${email}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await res.json();

			data.events.sort((a, b) => new Date(b.date) - new Date(a.date));

			setRegisteredEvents(data.events || []);
		} catch {
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

	if (!isClient) return null;

	if (showNotAllowed) return <NotAllowed />;

	if (loading) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-black">
				<Loader />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-950 text-white">

			<div className="max-w-7xl mx-auto px-4 py-20">

				<h1 className="text-4xl font-bold mb-10 text-center">
					Registered Events
				</h1>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">

					<div className="bg-slate-800 p-4 rounded-lg text-center">
						<div className="text-2xl font-bold">{stats.total}</div>
						Total
					</div>

					<div className="bg-slate-800 p-4 rounded-lg text-center">
						<div className="text-2xl font-bold">{stats.upcoming}</div>
						Upcoming
					</div>

					<div className="bg-slate-800 p-4 rounded-lg text-center">
						<div className="text-2xl font-bold">{stats.ongoing}</div>
						Ongoing
					</div>

					<div className="bg-slate-800 p-4 rounded-lg text-center">
						<div className="text-2xl font-bold">{stats.completed}</div>
						Completed
					</div>

				</div>

				<div className="flex justify-center gap-3 mb-10 flex-wrap">

					{filters.map((filter) => (
						<button
							key={filter}
							onClick={() => setActiveFilter(filter)}
							className={`px-4 py-2 rounded ${
								activeFilter === filter
									? "bg-cyan-500 text-white"
									: "bg-slate-700 text-gray-300"
							}`}
						>
							{filter}
						</button>
					))}

				</div>

				{filteredEvents.length === 0 ? (
					<div className="text-center text-gray-400">
						No events found
					</div>
				) : (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

						{filteredEvents.map((event) => (
							<div
								key={event._id}
								className="bg-slate-800 rounded-xl overflow-hidden"
							>

								<div className="relative h-48">

									<Image
										src={event.imageUrl}
										alt={event.title}
										fill
										className="object-cover"
									/>

								</div>

								<div className="p-4">

									<h3 className="text-xl font-bold mb-2">
										{event.title}
									</h3>

									<div className="text-sm text-gray-400 mb-3">
										{formatDate(event.date)}
									</div>

									<div className="flex justify-between items-center">

										<StatusBadge status={event.status} />

										<Link
											href={`/events/${event.slug || event._id}`}
											className="text-cyan-400 flex items-center gap-1"
										>
											View <FiArrowRight />
										</Link>

									</div>

								</div>

							</div>
						))}

					</div>
				)}

			</div>

		</div>
	);
}
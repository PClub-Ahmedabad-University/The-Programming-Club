"use client";
import React, { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "@/ui-components/BentoGrid";
import Loader from "@/ui-components/Loader1";
import { FaPlay } from "react-icons/fa";
import Slideshow from "./Slideshow";

export default function BentoGridSecondDemo() {
	const [activeFilter, setActiveFilter] = useState("All");
	const [sortOption, setSortOption] = useState("name-asc");
	const [viewMode, setViewMode] = useState("grid");
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [eventNames, setEventNames] = useState(["All"]);
	const [showSlideshow, setShowSlideshow] = useState(false);

	const handleFilterChange = (filter) => {
		setActiveFilter(filter);
		setCurrentPage(1);
	};

	useEffect(() => {
		async function fetchGallery() {
			try {
				setLoading(true);
				const res = await fetch(`/api/gallery/get?page=${currentPage}&limit=12&filter=${activeFilter}`);
				const json = await res.json();

				if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid data format");

				const images = json.data.map((img) => ({
					title: img.eventName,
					imageLink: img.imageUrl.replace(/\.(heic|heif)(\?.*)?$/i, ".jpg$2"),
					eventName: img.eventName,
					date: img.createdAt || new Date().toISOString(),
				}));

				setItems(images);
				if (json.allEventNames) {
					setEventNames(json.allEventNames);
				}
				if (json.pagination) {
					setCurrentPage(json.pagination.currentPage || 1);
					setTotalPages(json.pagination.totalPages || 1);
					setTotalItems(json.pagination.totalItems || 0);
				}
			} catch (err) {
				setItems([]);
			} finally {
				setLoading(false);
			}
		}

		fetchGallery();
	}, [currentPage, activeFilter]);


	const sortedAndFilteredItems = items;

	if (loading) {
		return (
			<div className="fixed inset-0 bg-black flex items-center justify-center z-50">
				<Loader />
			</div>
		);
	}

	return (
		<div className="bg-gray-950 pt-14 pb-10 font-content">
			<style jsx>{`
				@keyframes slideIn {
					0% {
						opacity: 0;
						transform: translateY(-20px);
					}
					100% {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes pulseGlow {
					0%,
					100% {
						box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
					}
					50% {
						box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
					}
				}
				@keyframes ripple {
					0% {
						transform: scale(0);
						opacity: 0.6;
					}
					100% {
						transform: scale(2);
						opacity: 0;
					}
				}
				.navbar-container {
					animation: slideIn 0.5s ease-out;
				}
				.filter-button:hover {
					transform: scale(1.05) rotate(2deg);
				}
				.filter-button.active {
					animation: pulseGlow 1.5s infinite;
				}
				.toggle-switch {
					position: relative;
					width: 60px;
					height: 30px;
					background: linear-gradient(to right, #4b5563, #374151);
					border-radius: 9999px;
					transition: all 0.3s ease;
				}
				.toggle-switch::before {
					content: "";
					position: absolute;
					top: 3px;
					left: ${viewMode === "grid" ? "3px" : "33px"};
					width: 24px;
					height: 24px;
					background: linear-gradient(to right, #3b82f6, #14b8a6);
					border-radius: 50%;
					transition: left 0.3s ease;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
				}
				.toggle-switch.active {
					background: linear-gradient(to right, #3b82f6, #14b8a6);
				}
				.ripple-effect {
					position: absolute;
					border-radius: 50%;
					background: rgba(59, 130, 246, 0.4);
					animation: ripple 0.6s linear;
				}
				select {
					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
					background-position: right 0.75rem center;
					background-repeat: no-repeat;
					background-size: 1.5em;
					appearance: none;
				}
			`}</style>
			<div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10">
				<h1 className="text-4xl md:text-6xl font-bold tracking-wider relative inline-block mb-4">
					<span className="text-white font-heading relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
						GALLERY
					</span>
					<span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
				</h1>
				<h2 className="text-xl sm:text-2xl md:text-3xl text-white font-bold tracking-wider text-center px-4 max-w-5xl mx-auto">
					Moments That Matter – A Glimpse into the P-Club Legacy
				</h2>
				<h4 className="text-lg text-white tracking-wider text-center px-4 max-w-5xl mx-auto mb-4">
					Click on any image to view it in full size.
				</h4>

				{/* Slideshow Button - Hidden on mobile */}
				<div className="hidden md:flex justify-center mb-6">
					<button
						onClick={() => setShowSlideshow(true)}
						className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all duration-300 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
					>
						<FaPlay className="w-4 h-4" />
						Start Slideshow
					</button>
				</div>

				{/* Filter Navbar */}
				<div className="w-full max-w-7xl mx-auto px-4 mb-8 navbar-container">
					{/* Mobile View (hidden on sm and above) */}
					<div className="flex sm:hidden items-center gap-4">
						<div className="relative flex-1">
							<select
								value={activeFilter}
								onChange={(e) => handleFilterChange(e.target.value)}
								className="w-full px-4 py-3 rounded-full text-sm font-medium text-white bg-gray-800/50 backdrop-blur-md border border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
								aria-label="Select event category"
							>
								{eventNames.map((eventName) => (
									<option
										key={eventName}
										value={eventName}
										className="bg-gray-900 text-white"
									>
										{eventName}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Desktop View (hidden below sm) */}
					<div className="hidden sm:flex items-center justify-between gap-4">
						<div className="flex flex-wrap gap-3">
							{eventNames.map((eventName) => (
								<button
									key={eventName}
									onClick={(e) => {
										handleFilterChange(eventName);
										const ripple = document.createElement("span");
										ripple.className = "ripple-effect";
										const rect = e.currentTarget.getBoundingClientRect();
										ripple.style.left = `${e.clientX - rect.left - 20}px`;
										ripple.style.top = `${e.clientY - rect.top - 20}px`;
										e.currentTarget.appendChild(ripple);
										setTimeout(() => ripple.remove(), 600);
									}}
									className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm md:text-base font-medium text-white transition-all duration-300 filter-button ${activeFilter === eventName
											? "bg-gradient-to-r from-blue-500 to-teal-500 active"
											: "bg-gray-800/50 backdrop-blur-md hover:bg-gray-700/50"
										}`}
									aria-pressed={activeFilter === eventName}
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									{eventName}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>

			<BentoGrid className="max-w-8xl mx-5 md:auto-rows-[20rem] pt-4 font-content">
				{sortedAndFilteredItems.length > 0 ? (
					<>
						{sortedAndFilteredItems.map((item, i) => {
							const className =
								i % 9 === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1";
							return (
								<BentoGridItem
									key={`${item.eventName}-${i}`}
									title={item.title}
									className={className}
									image={item.imageLink}
								/>
							);
						})}
					</>
				) : (
					<div className="col-span-full text-center text-gray-400 py-10 font-content">
						No images found. Please check back later.
					</div>
				)}
			</BentoGrid>

			{/* Slideshow Modal */}
			{showSlideshow && (
				<div className="fixed inset-0 z-50">
					<Slideshow 
						images={sortedAndFilteredItems.map(item => ({
							url: item.imageLink,
							title: item.title
						}))} 
						onClose={() => setShowSlideshow(false)}
					/>
				</div>
			)}

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex flex-wrap items-center justify-center gap-4 mt-8 bg-gray-900/50 backdrop-blur-md rounded-2xl p-4 max-w-xl mx-auto border border-blue-500/20">
					<button
						onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={currentPage === 1}
						className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-full ${
							currentPage === 1
								? "bg-gray-800/50 text-gray-500 border border-transparent cursor-not-allowed"
								: "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 cursor-pointer shadow-lg"
						}`}
					>
						&lt; Previous
					</button>

					<div className="flex items-center gap-2">
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<button
								key={p}
								onClick={() => setCurrentPage(p)}
								className={`w-9.5 h-9.5 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border ${
									currentPage === p
										? "bg-gradient-to-r from-blue-500 to-teal-500 border-transparent text-white shadow-lg shadow-blue-500/25"
										: "bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50"
								}`}
							>
								{p}
							</button>
						))}
					</div>

					<button
						onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
						disabled={currentPage === totalPages}
						className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-full ${
							currentPage === totalPages
								? "bg-gray-800/50 text-gray-500 border border-transparent cursor-not-allowed"
								: "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 cursor-pointer shadow-lg"
						}`}
					>
						Next &gt;
					</button>
				</div>
			)}
		</div>
	);
}

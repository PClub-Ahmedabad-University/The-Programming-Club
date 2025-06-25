"use client";
import React, { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "@/ui-components/BentoGrid";
import Loader from "@/ui-components/Loader1";

export default function BentoGridSecondDemo() {
	const [activeFilter, setActiveFilter] = useState("All");
	const [sortOption, setSortOption] = useState("name-asc");
	const [viewMode, setViewMode] = useState("grid");
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [visibleCount, setVisibleCount] = useState(9);

	const shuffleArray = (array) => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	};

	useEffect(() => {
		async function fetchGallery() {
			try {
				const res = await fetch("/api/gallery/get");
				const { data } = await res.json();

				if (!Array.isArray(data)) throw new Error("Invalid data format");

				const images = data.flatMap((event) =>
					event.imageUrls.map((url) => ({
						title: event.eventName,
						imageLink: url.replace(/\.(heic|heif)(\?.*)?$/i, ".jpg$2"),
						eventName: event.eventName,
						date: event.date || new Date().toISOString(),
					}))
				);
				console.log(images);
				console.log(shuffleArray(images));

				setItems(shuffleArray(images));
				// console.log(items);
			} catch (err) {
				setItems([]);
			} finally {
				setLoading(false);
			}
		}

		fetchGallery();
	}, []);

	const eventNames = ["All", ...new Set(items.map((item) => item.eventName))];


	const sortedAndFilteredItems = items
		.filter((item) => activeFilter === "All" || item.eventName === activeFilter);

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
				<h4 className="text-lg text-white  tracking-wider text-center px-4 max-w-5xl mx-auto mb-4">
					Click on any image to view it in full size.
				</h4>

				{/* Filter Navbar */}
				<div className="w-full max-w-7xl mx-auto px-4 mb-8 navbar-container">
					{/* Mobile View (hidden on sm and above) */}
					<div className="flex sm:hidden items-center gap-4">
						<div className="relative flex-1">
							<select
								value={activeFilter}
								onChange={(e) => setActiveFilter(e.target.value)}
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
										setActiveFilter(eventName);
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
						{sortedAndFilteredItems.slice(0, visibleCount).map((item, i) => {
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

			{/* Load More Button */}
			{visibleCount < sortedAndFilteredItems.length && (
				<div className="flex justify-center mt-8">
					<button
						onClick={() => setVisibleCount(prev => Math.min(prev + 12, sortedAndFilteredItems.length))}
						className="relative inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all duration-300 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						Load More
					</button>
				</div>
			)}
		</div>
	);
}

import Image from "next/image";
import React from "react";
import ShinyButton from "@/ui-components/ShinyButton";

const Event = ({ event }) => {
	const formatDate = (dateString) => {
		if (!dateString) return "TBD";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	const formatTime = (dateString) => {
		if (!dateString) return "TBD";
		const date = new Date(dateString);
		return date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	const eventDetails = [
		{ detail: "PARTICIPATION", ans: event?.rules?.includes("team") ? "Team" : "Individual" },
		{ detail: "DATE", ans: formatDate(event?.date) },
		{ detail: "TIME", ans: event?.time ? formatTime(event?.date) : "-" },
		{ detail: "VENUE", ans: event?.location || "TBD" },
	];

	return (
		<div className="w-full flex justify-center">
			<div className="w-full max-w-[1200px] flex flex-col md:flex-row gap-20">
				<div className="w-full md:w-[45%]">
					<Image
						src={event?.imageUrl || "/ImageContainer.png"}
						alt={event?.title || "Event Image"}
						className="rounded-md w-full object-cover"
						width={800}
						height={800}
						draggable={false}
						priority
					/>
				</div>

				<div className="w-full md:w-[55%] flex flex-col">
					<h1 className="text-white border border-white rounded-md text-left py-1 px-3 bg-[#00000080] w-max mb-4 text-lg sm:text-xl font-semibold">
						{event?.title || "EVENT NAME"}
					</h1>
					<p className="text-[#B0B0B0] text-[15px] sm:text-base leading-relaxed max-w-[600px]">
						{event?.description || "Event description will be displayed here."}
					</p>
					<div className="mt-6 flex flex-col gap-4 max-w-[500px]">
						{eventDetails.map((item, index) => (
						<div key={index} className="flex justify-between text-white text-sm sm:text-base">
							<span className="font-medium w-[40%]">{item.detail}</span>
							<span className="font-light w-[60%]">{item.ans}</span>
						</div>
						))}
					</div>
					<div className="mt-6 w-full sm:w-[60%]">
						{event?.registrationOpen ? (
						<ShinyButton
							className="w-full"
							onClick={() => window.open(`/events/register/${event._id}`, "_blank")}
							title="Register"
						/>
						) : (
						<span className="border border-gray-400 text-gray-400 rounded-xl px-4 py-2 text-sm cursor-not-allowed select-none flex items-center justify-center w-full">
							Opening soon..
						</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Event;

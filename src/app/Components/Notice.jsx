"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaInstagram } from "react-icons/fa";

const Notice = () => {
	const [notice, setNotice] = useState(null);

	useEffect(() => {
		fetch("/api/notice")
			.then((res) => res.json())
			.then((data) => setNotice(data))
			.catch(() => setNotice({ show: false }));
	}, []);

	if (!notice || !notice.show) return null;

	return (
		<div className="notice-container w-full min-h-[2.5rem] bg-[linear-gradient(90deg,_#026C71_0%,_#004457_100%)] font-inter flex items-center justify-center shadow-xl relative px-4">
			<a
				href="https://www.instagram.com/ahduni_programmingclub/"
				target="_blank"
				rel="noopener noreferrer"
				className="absolute left-4"
				aria-label="Visit our Instagram"
			>
				<FaInstagram color="white" size={20} />
			</a>
			<div className="text-white font-bold text-xs md:text-base text-center truncate max-w-full px-6">
				{notice.message}
			</div>
		</div>
	);
};

export default Notice;

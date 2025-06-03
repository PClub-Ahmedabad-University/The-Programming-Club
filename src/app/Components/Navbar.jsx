"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import DrawerIcon from "../Client Components/DrawerIcon";
import Sidebar from "../Client Components/Sidebar";
import { InteractiveHoverButton } from "@/ui-components/InteractiveHover";

const navLinks = [
	{ name: "Home" },
	{ name: "Events" },
	{ name: "About Us" },
	{ name: "Join Us" },
	{ name: "Contact Us" },
];

const Navbar = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const memoizedNavLinks = useMemo(() => navLinks, []);
	const location = usePathname();

	useEffect(() => setLoading(false), [location]);

	return (
		<>
			<header className="z-30 w-full sticky top-0 bg-pclubBg px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
				<nav className="h-16 sm:h-18 flex justify-between items-center font-inter">
					<Link href="/" className="logo">
						<Image
							src="/logo.png"
							alt="PClub Logo"
							height={40}
							width={40}
							className="h-28 w-28 sm:h-28 sm:w-28 object-contain"
						/>
					</Link>
					<ul className="hidden md:flex items-center gap-4 sm:gap-6 lg:gap-8 text-white">
						{memoizedNavLinks.map((item, index) => (
							<Link
								key={index}
								href={
									item.name === "Home"
										? "/"
										: `/${item.name
												.toLowerCase()
												.replace(/\s+/g, "-")}`
								}
								className="relative text-sm sm:text-base after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:h-[1px] after:w-0 after:bg-gradient-to-r after:from-[#00bec7] after:to-[#004457] after:transition-all after:duration-500 hover:after:w-full"
							>
								{item.name}
							</Link>
						))}
						<li>
							<InteractiveHoverButton
								children={loading ? "Loading..." : "Login"}
								onClick={() => {
									if (location === "/users/login") return;
									router.push("/users/login");
									setLoading(true);
								}}
								className="ml-4"
							/>
						</li>
					</ul>
					<DrawerIcon onClick={() => setSidebarOpen(true)} />
				</nav>
			</header>
			{sidebarOpen && <Sidebar setSidebarOpen={setSidebarOpen} />}
		</>
	);
};

export default Navbar;

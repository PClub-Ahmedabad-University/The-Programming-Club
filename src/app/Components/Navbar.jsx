"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { FiLogOut, FiCalendar } from "react-icons/fi";
import DrawerIcon from "../Client Components/DrawerIcon";
import Sidebar from "../Client Components/Sidebar";
import { InteractiveHoverButton } from "@/ui-components/InteractiveHover";

const ProfileDropdown = ({ userEmail = "", handleLogout }) => {
	const [derivedUserName, setDerivedUserName] = useState("User");
	const [derivedUserInitials, setDerivedUserInitials] = useState("U");
	const [formattedEmail, setFormattedEmail] = useState("");

	useEffect(() => {
		if (userEmail && typeof userEmail === "string" && userEmail.includes("@")) {
			const parts = userEmail.split("@")[0].split(".");
			const user = parts[0] || "User";
			const initials = user[0]?.toUpperCase() || "U";
			const formatted = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : user.toLowerCase();

			setDerivedUserName(user);
			setDerivedUserInitials(initials);
			setFormattedEmail(formatted);
		}
	}, [userEmail]);

	return (
		<Menu as="div" className="relative ml-4">
			<div>
				<Menu.Button className="flex rounded-full bg-pclubBg border-2 border-[#00bec7] p-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bec7] focus:ring-offset-2 focus:ring-offset-pclubBg transition-all duration-200 hover:shadow-[0_0_10px_rgba(0,190,199,0.5)]">
					<span className="sr-only">Open user menu</span>
					<div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00bec7] to-[#004457] flex items-center justify-center text-white font-medium">
						{derivedUserInitials.toUpperCase()}
					</div>
				</Menu.Button>
			</div>
			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-[#0f172a] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-700 overflow-hidden">
					{/* Welcome section */}
					<div className="px-4 py-3 border-b border-gray-700">
						<p className="text-sm text-white font-medium">Welcome back</p>
						<p className="text-sm text-[#00bec7] font-medium truncate">
							{derivedUserName.charAt(0).toUpperCase() + derivedUserName.slice(1)}
						</p>
					</div>

					{/* Menu items */}
					<div className="py-1">
						<Menu.Item>
							{({ active }) => (
								<Link
									href={`/users/events/${formattedEmail}`}
									className={`${active ? "bg-gray-800 text-white" : "text-gray-300"
										} flex items-center px-4 py-2.5 text-sm w-full text-left`}
								>
									<FiCalendar className="mr-3 h-5 w-5 text-[#00bec7] flex-shrink-0" />
									My Registered Events
								</Link>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<button
									onClick={handleLogout}
									className={`${active ? "bg-gray-800 text-white" : "text-gray-300"
										} w-full text-left flex items-center px-4 py-2.5 text-sm`}
								>
									<FiLogOut className="mr-3 h-5 w-5 text-red-400 flex-shrink-0" />
									Log out
								</button>
							)}
						</Menu.Item>
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
};

const navLinks = [
	{ name: "WMC", path: "/WMC" },
	{ name: "Home", path: "/" },
	{ name: "Events", path: "/events" },
	{ name: "Gallery", path: "/gallery" },
	{ name: "Our Team", path: "/our-team" },
	{ name: "Recruitment", path: "/recruitment" },
	{ name: "Report a bug", path: "/contact-us" },
];

const Navbar = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const memoizedNavLinks = useMemo(() => navLinks, []);
	const location = usePathname();
	const [isLoggedIn, setIsLoggedIn] = useState(true);
	const [userInitials, setUserInitials] = useState("U");

	// Get user data from localStorage
	const [userEmail, setUserEmail] = useState("");

	useEffect(() => {
		const isAuthenticated = localStorage.getItem("token") && localStorage.getItem("user");
		setIsLoggedIn(isAuthenticated);
		if (isAuthenticated) {
			const user = localStorage.getItem("user");
			if (user) {
				setUserEmail(user);
			}
		}
	}, []);

	const handleLogout = () => {
		if (confirm("Are you sure you want to logout?")) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			setIsLoggedIn(false);
			setUserEmail("");
			router.push("/");
			setTimeout(() => window.location.reload(), 200);
		}
	};

	const handleLogin = () => {
		if (location === "/users/login") return;
		setLoading(true);
		router.push("/users/login");
		router.refresh();
	};

	useEffect(() => setLoading(false), [location]);

	return (
		<>
			<header className="z-30 font-content w-full sticky top-0 bg-pclubBg px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
				<nav className="h-16 sm:h-18 flex justify-between items-center text-lg font-content">
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
								href={item.path}
								target={item.path === "/WMC" ? "_blank" : "_self"}
								className={`relative text-lg sm:text-lg after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:h-[1px] after:bg-gradient-to-r after:from-[#00bec7] after:to-[#004457] after:transition-all after:duration-500 ${location === item.path
									? "after:w-full"
									: "after:w-0 hover:after:w-full"
									} ${location === item.path
										? "font-medium text-white"
										: item.name === "WMC"
											? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-fire-glow drop-shadow-[0_0_6px_rgba(255,100,0,0.8)]"
											: "text-gray-300"
									}`}
							>
								{item.name === "WMC" ? (
									<span className="text-red-500 animate-pulse">🔥<span className="mx-2 text-md text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-fire-glow drop-shadow-[0_0_6px_rgba(255,100,0,0.8)]">
										WMC

									</span></span>

								) : (
									item.name
								)}
							</Link>

						))}
						{isLoggedIn ? (
							<li className="flex items-center">
								<ProfileDropdown
									userEmail={userEmail}
									handleLogout={handleLogout}
								/>
							</li>
						) : (
							<li>
								<InteractiveHoverButton
									onClick={handleLogin}
									className="ml-4"
									disabled={loading}
								>
									{loading ? "Loading..." : "Login"}
								</InteractiveHoverButton>
							</li>
						)}
					</ul>
					<DrawerIcon onClick={() => setSidebarOpen(true)} />
				</nav>
			</header>
			{sidebarOpen && <Sidebar setSidebarOpen={setSidebarOpen} />}
		</>
	);
};

export default Navbar;

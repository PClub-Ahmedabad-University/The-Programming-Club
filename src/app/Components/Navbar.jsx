"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { FiLogOut, FiCalendar, FiCode, FiRefreshCw, FiX, FiCheck } from "react-icons/fi";
import DrawerIcon from "../Client Components/DrawerIcon";
import Sidebar from "../Client Components/Sidebar";
import { InteractiveHoverButton } from "@/ui-components/InteractiveHover";
import CodeforcesVerificationModal from "./CodeforcesVerificationModal";

const ProfileDropdown = ({ userEmail = "", handleLogout }) => {
	const [derivedUserName, setDerivedUserName] = useState("User");
	const [derivedUserInitials, setDerivedUserInitials] = useState("U");
	const [formattedEmail, setFormattedEmail] = useState("");
	const [showCodeforcesModal, setShowCodeforcesModal] = useState(false);
	const [codeforcesHandle, setCodeforcesHandle] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
	const [error, setError] = useState("");

	const showToast = (message, type = 'success') => {
		setToast({ show: true, message, type });
		setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
	};

	const handleVerificationComplete = (verifiedHandle) => {
		setCodeforcesHandle(verifiedHandle);
		setShowCodeforcesModal(false);
		showToast(`Successfully ${codeforcesHandle ? 'updated' : 'added'} Codeforces handle: ${verifiedHandle}`, 'success');
		fetchUserProfile();
	};

	const handleModalClose = () => {
		setShowCodeforcesModal(false);
		fetchUserProfile();
	};

	const handleStartVerification = async (handle) => {
		try {
			setIsLoading(true);
			return true;
		} catch (error) {
			console.error('Error starting verification:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const fetchUserProfile = async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem('token');
			if (!token) return;

			const response = await fetch('/api/users/me', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			const data = await response.json();
			const { codeforcesHandle } = data.data;
			if (codeforcesHandle) {
				setCodeforcesHandle(codeforcesHandle);
			}
			
			if (!response.ok) {
				if (response.status === 401) {
					localStorage.removeItem('token');
					window.location.href = '/login';
					return;
				}
				
				setError(data.message || 'Failed to load profile data');
				return;
			}

		} catch (error) {
			console.error('Error fetching user profile:', error);
			setError('Network error. Please check your connection.');
		} finally {
			setIsLoading(false);
		}
	};

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

		fetchUserProfile();
	}, [userEmail]);

	useEffect(() => {
		if (userEmail) {
			fetchUserProfile();
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
				<Menu.Items className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-[#0f172a] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-700 overflow-hidden">
					{/* Welcome section */}
					<div className="px-4 py-3 border-b border-gray-700">
						<p className="text-sm text-white font-medium">Welcome back</p>
						<p className="text-sm text-[#00bec7] font-medium truncate">
							{derivedUserName.charAt(0).toUpperCase() + derivedUserName.slice(1)}
						</p>
						{codeforcesHandle && (
							<div className="mt-1 flex items-center text-xs text-gray-400">
								<FiCode className="mr-1" />
								<span>Codeforces: </span>
								<a 
									href={`https://codeforces.com/profile/${codeforcesHandle}`} 
									target="_blank" 
									rel="noopener noreferrer"
									className="text-[#00bec7] hover:underline ml-1"
								>
									{codeforcesHandle}
								</a>
							</div>
						)}
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
									onClick={() => setShowCodeforcesModal(true)}
									disabled={isLoading}
									className={`${
										active ? "bg-[#1e293b] text-white" : "text-gray-300"
									} group flex w-full items-center px-4 py-2 text-sm disabled:opacity-50`}
								>
									{isLoading ? (
										<>
											<FiRefreshCw className="mr-3 h-5 w-5 animate-spin" />
											Loading...
										</>
									) : (
										<>
											<FiCode
												className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white"
												aria-hidden="true"
											/>
											{codeforcesHandle ? 'Update Codeforces' : 'Add Codeforces Handle'}
										</>
									)}
								</button>
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

			{/* Toast Notification */}
			<div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform ${
				toast.show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
			} ${
				toast.type === 'success' 
					? 'bg-green-600 text-white' 
					: 'bg-red-600 text-white'
			}`}>
				<div className="flex items-center">
					{toast.type === 'success' ? (
						<FiCheck className="mr-2" size={20} />
					) : (
						<FiX className="mr-2" size={20} />
					)}
					<span>{toast.message}</span>
					<button 
						onClick={() => setToast(prev => ({ ...prev, show: false }))}
						className="ml-4 text-white hover:text-gray-200"
						aria-label="Dismiss notification"
					>
						<FiX size={18} />
					</button>
				</div>
			</div>

			<CodeforcesVerificationModal
				isOpen={showCodeforcesModal}
				onClose={handleModalClose}
				handle={codeforcesHandle}
				onHandleChange={setCodeforcesHandle}
				onVerificationComplete={handleVerificationComplete}
				onError={(errorMessage) => {
					setError(errorMessage);
					showToast(errorMessage, 'error');
				}}
			/>
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

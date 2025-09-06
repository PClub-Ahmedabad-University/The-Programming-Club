"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { FiLogOut, FiCalendar, FiCode, FiRefreshCw, FiX, FiCheck, FiSettings } from "react-icons/fi";
import DrawerIcon from "../Client Components/DrawerIcon";
import Sidebar from "../Client Components/Sidebar";
import { InteractiveHoverButton } from "@/ui-components/InteractiveHover";
import CodeforcesVerificationModal from "./CodeforcesVerificationModal";
import { getRankColor } from "@/lib/cfUtils";
import { getUserRoleFromToken, isExpired, clearToken } from "@/lib/auth";


const ProfileDropdown = ({ userEmail = "", handleLogout }) => {
	const [derivedUserName, setDerivedUserName] = useState("User");
	const [derivedUserInitials, setDerivedUserInitials] = useState("U");
	const [formattedEmail, setFormattedEmail] = useState("");
	const [showCodeforcesModal, setShowCodeforcesModal] = useState(false);
	const [codeforcesHandle, setCodeforcesHandle] = useState("");
	const [codeforcesRank, setCodeforcesRank] = useState("unrated");
	const [codeforcesRating, setCodeforcesRating] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
	const [error, setError] = useState("");
	const [userRole, setUserRole] = useState("user");

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			setUserRole(getUserRoleFromToken(token));
		}
	}, []);

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

	const removeHandle = async () => {
		if (!confirm("Are you sure you want to remove your Codeforces handle?")) return;
		try {
			setIsLoading(true);
			const response = await fetch('/api/users/remove-handle', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			if (!response.ok) {
				throw new Error('Failed to remove handle');
			}
			const data = await response.json();
			showToast(data.message, 'success');
			setCodeforcesHandle(null);
			setCodeforcesRank('unrated');
			setCodeforcesRating(0);
			setShowCodeforcesModal(false);
			return true;
		} catch (error) {
			console.error('Error removing handle:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
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
			if (!token) {
				console.log('No token found');
				return;
			}
			if (isExpired(token)) {
				clearToken();
				return;
			}
			const response = await fetch('/api/users/me', {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Error response:', errorText);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			// console.log('User profile data:', JSON.stringify(data, null, 2));

			// Check if data.data exists
			if (!data || !data.data) {
				console.error('Invalid response format - missing data property');
				return;
			}

			const { codeforcesHandle, codeforcesRank, codeforcesRating } = data.data;

			setCodeforcesHandle(codeforcesHandle || '');
			setCodeforcesRank(codeforcesRank || 'unrated');
			setCodeforcesRating(codeforcesRating || 0);

			if (!response.ok) {
				if (response.status === 401 || isExpired(token)) {
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
				<Menu.Button className="flex rounded-full bg-slate-800 border-2 border-cyan-500 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:border-cyan-400">
					<span className="sr-only">Open user menu</span>
					<div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
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
				<Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-xl bg-slate-800 shadow-2xl ring-1 ring-slate-700 focus:outline-none border border-slate-600 overflow-hidden backdrop-blur-sm">
					{/* User Profile Header */}
					<div className="px-5 py-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-750">
						<div className="flex items-center space-x-3">
							<div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
								{derivedUserInitials.toUpperCase()}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-slate-300 mb-1">Welcome back</p>
								<p className="text-lg font-semibold text-white truncate">
									{derivedUserName.charAt(0).toUpperCase() + derivedUserName.slice(1)}
								</p>
								<p className="text-xs text-slate-400 truncate">
									{userEmail}
								</p>
							</div>
						</div>

						{/* Codeforces Badge */}
						{codeforcesHandle && (
							<div className="mt-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<FiCode className="h-4 w-4 text-cyan-400" />
										<span className="text-sm font-medium text-slate-300">Codeforces:</span>
									</div>
									<div className="flex items-center space-x-2">
										<a
											href={`https://codeforces.com/profile/${codeforcesHandle}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm font-medium hover:underline transition-colors"
											style={{ color: getRankColor(codeforcesRank) }}
										>
											{codeforcesHandle}
										</a>
										<span className="text-xs px-2 py-1 rounded-full bg-slate-600 text-slate-300 font-medium">
											{codeforcesRank}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Menu Items */}
					<div className="py-2">
						{userRole === "admin" && <Menu.Item>
							{({ active }) => (
								<Link
									href={`/admin/dashboard`}
									target="_blank"
									className={`${active ? "bg-slate-700 text-white" : "text-slate-300"
										} flex items-center px-5 py-3 text-sm font-medium w-full text-left transition-colors hover:bg-slate-700 group`}
								>
									<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 text-green-400 mr-3 group-hover:bg-green-500/20 transition-colors">
										<FiSettings className="h-4 w-4" />
									</div>
									<div className="flex-1">
										<p className="text-sm font-medium">Admin Panel</p>
										<p className="text-xs text-slate-400">Welcome to the admin panel</p>
									</div>
								</Link>
							)}
						</Menu.Item>}
						<Menu.Item>
							{({ active }) => (
								<Link
									href={`/users/events/${formattedEmail}`}
									className={`${active ? "bg-slate-700 text-white" : "text-slate-300"
										} flex items-center px-5 py-3 text-sm font-medium w-full text-left transition-colors hover:bg-slate-700 group`}
								>
									<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 mr-3 group-hover:bg-cyan-500/20 transition-colors">
										<FiCalendar className="h-4 w-4" />
									</div>
									<div className="flex-1">
										<p className="text-sm font-medium">My Registered Events</p>
										<p className="text-xs text-slate-400">View your upcoming events</p>
									</div>
								</Link>
							)}
						</Menu.Item>


						<Menu.Item>
							{({ active }) => (
								<button
									onClick={() => setShowCodeforcesModal(true)}
									disabled={isLoading}
									className={`${active ? "bg-slate-700 text-white" : "text-slate-300"
										} group flex w-full items-center px-5 py-3 text-sm font-medium disabled:opacity-50 transition-colors hover:bg-slate-700`}
								>
									<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 mr-3 group-hover:bg-purple-500/20 transition-colors">
										{isLoading ? (
											<FiRefreshCw className="h-4 w-4 animate-spin" />
										) : (
											<FiCode className="h-4 w-4" />
										)}
									</div>
									<div className="flex-1 text-left">
										<p className="text-sm font-medium">
											{isLoading ? 'Loading...' : (codeforcesHandle ? 'Update Codeforces' : 'Add Codeforces Handle')}
										</p>
										<p className="text-xs text-slate-400">
											{codeforcesHandle ? 'Update your handle' : 'Connect your Codeforces account'}
										</p>
									</div>
								</button>
							)}
						</Menu.Item>

						<Menu.Item>
							{({ active }) => (
								<button
									onClick={removeHandle}
									disabled={isRefreshing || !codeforcesHandle}
									className={`${active ? 'bg-slate-700 text-white' : 'text-slate-300'} ${!codeforcesHandle ? 'opacity-50 cursor-not-allowed' : ''
										} group flex w-full items-center px-5 py-3 text-sm font-medium transition-colors hover:bg-slate-700`}
								>
									<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 text-orange-700 mr-3 group-hover:bg-orange-500/20 transition-colors">
										<FiX className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
									</div>
									<div className="flex-1 text-left">
										<p className="text-sm font-medium">
											{isRefreshing ? 'Removing Handle...' : 'Remove Codeforces Handle'}
										</p>
										<p className="text-xs text-slate-400">
											{!codeforcesHandle ? 'Add handle first' : 'Remove your Codeforces handle'}
										</p>
									</div>
								</button>
							)}
						</Menu.Item>

						{/* Divider */}
						<div className="my-2 border-t border-slate-700"></div>

						<Menu.Item>
							{({ active }) => (
								<button
									onClick={handleLogout}
									className={`${active ? "bg-red-500/10 text-red-400" : "text-slate-300"
										} w-full text-left flex items-center px-5 py-3 text-sm font-medium transition-colors hover:bg-red-500/10 hover:text-red-400 group`}
								>
									<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 mr-3 group-hover:bg-red-500/20 transition-colors">
										<FiLogOut className="h-4 w-4" />
									</div>
									<div className="flex-1">
										<p className="text-sm font-medium">Sign Out</p>
										<p className="text-xs text-slate-400">End your current session</p>
									</div>
								</button>
							)}
						</Menu.Item>
					</div>
				</Menu.Items>
			</Transition>

			{/* Enhanced Toast Notification */}
			<div className={`fixed top-4 right-4 max-w-md px-6 py-4 rounded-xl shadow-2xl z-50 transition-all duration-300 transform ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
				} ${toast.type === 'success'
					? 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-400'
					: 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400'
				} backdrop-blur-sm`}>
				<div className="flex items-start space-x-3">
					<div className="flex-shrink-0">
						{toast.type === 'success' ? (
							<div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
								<FiCheck className="h-4 w-4" />
							</div>
						) : (
							<div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
								<FiX className="h-4 w-4" />
							</div>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium">{toast.message}</p>
					</div>
					<button
						onClick={() => setToast(prev => ({ ...prev, show: false }))}
						className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
						aria-label="Dismiss notification"
					>
						<FiX className="h-5 w-5" />
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
	{ name: "Home", path: "/" },
	{ name: "Events", path: "/events" },
	{ name: "CP Gym", path: "/cp-gym" },
	{ name: "Gallery", path: "/gallery" },
	{ name: "Our Team", path: "/our-team" },
	{ name: "Blogs", path: "/blogs" },
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
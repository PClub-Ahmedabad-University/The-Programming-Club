"use client";

import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FiUser, FiLogIn, FiLogOut, FiUserCheck, FiX, FiCode, FiCheck, FiEdit2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import CodeforcesVerificationModal from "../Components/CodeforcesVerificationModal";

const LogoutConfirmation = ({ onConfirm, onCancel }) => {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
			<motion.div
				className="bg-pclubBg border border-blue-500/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
			>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold text-white">Confirm Logout</h3>
					<button
						onClick={onCancel}
						className="text-gray-400 hover:text-white transition-colors"
						aria-label="Close"
					>
						<FiX className="w-5 h-5" />
					</button>
				</div>
				<p className="text-gray-300 mb-6">
					Are you sure you want to sign out? You'll need to sign in again to access your
					account.
				</p>
				<div className="flex justify-end space-x-3">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
					>
						<FiLogOut className="w-4 h-4" />
						Sign Out
					</button>
				</div>
			</motion.div>
		</div>
	);
};

const Sidebar = ({ setSidebarOpen }) => {
	const router = useRouter();
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userEmail, setUserEmail] = useState("");
	const [userName, setUserName] = useState("");
	const [isClient, setIsClient] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [showCodeforcesModal, setShowCodeforcesModal] = useState(false);
	const [codeforcesHandle, setCodeforcesHandle] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

	useEffect(() => {
		setIsClient(true);
		const user = localStorage.getItem("user"); 
		// console.log("Raw user from localStorage:", user);
	  
		setIsLoggedIn(!!user);
	  
		if (user) {
		  try {
			const email = user; 	
			const name = email.split(".")[0]
			setUserName(name);  
			const formattedEmail = email.split("@")[0].replace(/\./g, "-");
			setUserEmail(formattedEmail);
			// Fetch user profile including Codeforces handle
			fetchUserProfile();
		  } catch (e) {
			console.error("Error processing user email:", e);
		  }
		}
	  }, []);
	  
	  

	const fetchUserProfile = async () => {
	try {
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
		if (response.status === 401 || isExpired(token)) {
		  localStorage.removeItem('token');
		  window.location.href = '/login';
		  return;
		}
		setError(data.message || 'Failed to load profile data');
	  }

	} catch (error) {
	  console.error('Error fetching user profile:', error);
	  setError('Network error. Please check your connection.');
	} finally {
	  setIsLoading(false);
	}
  };

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

const navLinks = [
	{ name: "Home" },
	{ name: "Events" },
	{ name: "CP Gym"},
	{ name: "Gallery"},
	{ name: "Our Team"},
	{ name: "Blogs"},
	{ name: "Report a bug"}
];

	const handleLogout = () => {
		setShowLogoutConfirm(true);
	};

	const confirmLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setIsLoggedIn(false);
		setUserEmail("");
		setShowLogoutConfirm(false);
		setSidebarOpen(false);
		router.push("/");
		router.refresh();
	};

	const cancelLogout = () => {
		setShowLogoutConfirm(false);
	};

	return (
		<>
			<AnimatePresence>
				{showLogoutConfirm && (
					<LogoutConfirmation onConfirm={confirmLogout} onCancel={cancelLogout} />
				)}
			</AnimatePresence>
			<motion.div
				className="sidebar h-screen max-xs:w-[70%] w-[40%] bg-white fixed top-0 right-0 rounded-l-xl flex flex-col p-2 z-[100]"
				initial={{ opacity: 0.5, x: "100%" }}
				animate={{ opacity: 1, x: "0%", transition: { duration: 1 } }}
				exit={{ opacity: 0.5, x: "100%", transition: { duration: 1 } }}
			>
				<div className="flex justify-between items-center p-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold">Menu</h2>
					<button
						onClick={() => setSidebarOpen(false)}
						className="p-1 hover:bg-gray-100 rounded-full"
						aria-label="Close menu"
					>
						<RxCross2 className="text-xl" />
					</button>
				</div>

				{/* User Profile Section */}
				{isClient && (
					<div className="px-4 py-6 border-b border-gray-200">
						{isLoggedIn ? (
							<div className="flex flex-col items-center text-center">
								<div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
									<FiUserCheck className="text-blue-500 text-2xl" />
								</div>
								<h3 className="font-medium text-gray-900">{userName[0].toUpperCase() + userName.slice(1) || "User"}</h3>
								
								{codeforcesHandle ? (
									<div className="mt-2 flex flex-col items-center space-y-2">
										<div className="flex items-center">
											<FiCode className="mr-1 text-blue-500" />
											<span className="text-sm text-gray-600">Codeforces: </span>
											<a 
												href={`https://codeforces.com/profile/${codeforcesHandle}`} 
												target="_blank" 
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline ml-1 text-sm font-medium"
											>
												{codeforcesHandle}
											</a>
										</div>
										<button
											onClick={() => setShowCodeforcesModal(true)}
											className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
										>
											<FiEdit2 size={12} />
											Update Handle
										</button>
									</div>
								) : (
									<button
										onClick={() => setShowCodeforcesModal(true)}
										className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
									>
										<FiCode className="mr-1" />
										Add Codeforces Handle
									</button>
								)}

								<button
									onClick={handleLogout}
									className="mt-3 flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
								>
									<FiLogOut /> Sign Out
								</button>
							</div>
						) : (
							<div className="flex flex-col items-center">
								<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
									<FiUser className="text-gray-500 text-2xl" />
								</div>
								<p className="text-gray-600 mb-3">Welcome, Guest</p>
								<Link
									href="/users/login"
									className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
									onClick={() => setSidebarOpen(false)}
								>
									<FiLogIn /> Sign In
								</Link>
							</div>
						)}
					</div>
				)}

				{/* Navigation Links */}
				<ul className="flex-1 overflow-y-auto p-4 space-y-3">
					{/* Add link to user events if logged in */}
					{isLoggedIn && (
						<li>
							<Link
								href={`/users/events/${userEmail}`}
								className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
								onClick={() => setSidebarOpen(false)}
							>
								My Events
							</Link>
						</li>
					)}
					{navLinks.map((item, index) => (
						<li key={index}>
							<Link
								href={
									item.name === "Home"
										? "/"
										: item.name === "WMC"
											? "/WMC"
										: `/${item.name.toLowerCase().replace(/\s+/g, "-")}`
								}
								className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
								onClick={() => setSidebarOpen(false)}
							>
								{item.name}
							</Link>
						</li>
					))}
				</ul>
			</motion.div>

			{toast.show && (
				<div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[1001] transition-all duration-300 transform ${
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
			)}

			<CodeforcesVerificationModal
				isOpen={showCodeforcesModal}
				onClose={handleModalClose}
				handle={codeforcesHandle}
				onHandleChange={setCodeforcesHandle}
				onVerificationComplete={handleVerificationComplete}
				onError={(errorMessage) => {
					showToast(errorMessage, 'error');
				}}
			/>
		</>
	);
};

export default Sidebar;

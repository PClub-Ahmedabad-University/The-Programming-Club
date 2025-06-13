"use client";

import React, { useEffect, useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import { FiUser, FiLogIn, FiLogOut, FiUserCheck, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

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
        <p className="text-gray-300 mb-6">Are you sure you want to sign out? You'll need to sign in again to access your account.</p>
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
  const [userEmail, setUserEmail] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    setIsLoggedIn(!!user);
    if (user) {
      try {
        const email = JSON.parse(user);
        setUserEmail(email.split('@')[0].replace(/\./g, "-"));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const navLinks = [
    { name: "Home" },
    { name: "Events" },
    { name: "Gallery" },
    { name: "Our Team" },
    { name: "Join Us" },
    { name: "Contact Us" },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserEmail('');
    setShowLogoutConfirm(false);
    setSidebarOpen(false);
    router.push('/');
    router.refresh();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <AnimatePresence>
        {showLogoutConfirm && (
          <LogoutConfirmation
            onConfirm={confirmLogout}
            onCancel={cancelLogout}
          />
        )}
      </AnimatePresence>
      <motion.div
        className='sidebar h-screen max-xs:w-[70%] w-[40%] bg-white fixed top-0 right-0 rounded-l-xl flex flex-col p-2 z-[100]'
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
                <h3 className="font-medium text-gray-900">{userEmail || 'User'}</h3>
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
    </>

  )
}

export default Sidebar
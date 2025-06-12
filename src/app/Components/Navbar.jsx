"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Transition } from '@headlessui/react';
import { FiUser, FiLogOut, FiCalendar } from 'react-icons/fi';
import DrawerIcon from "../Client Components/DrawerIcon";
import Sidebar from "../Client Components/Sidebar";
import { InteractiveHoverButton } from "@/ui-components/InteractiveHover";

// Profile dropdown component
const ProfileDropdown = ({ userName, userEmail, userInitials, handleLogout }) => {
  return (
    <Menu as="div" className="relative ml-4">
      <div>
        <Menu.Button className="flex rounded-full bg-pclubBg border-2 border-[#00bec7] p-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bec7] focus:ring-offset-2 focus:ring-offset-pclubBg transition-all duration-200 hover:shadow-[0_0_10px_rgba(0,190,199,0.5)]">
          <span className="sr-only">Open user menu</span>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00bec7] to-[#004457] flex items-center justify-center text-white font-medium">
            {userInitials}
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
            <p className="text-sm text-[#00bec7] font-medium truncate">{userName || "User"}</p>
          </div>
          
          {/* Menu items */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={`/users/events/${userEmail}`}
                  className={`${active ? 'bg-gray-800 text-white' : 'text-gray-300'} flex items-center px-4 py-2.5 text-sm w-full text-left`}
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
                  className={`${active ? 'bg-gray-800 text-white' : 'text-gray-300'} w-full text-left flex items-center px-4 py-2.5 text-sm`}
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
	{ name: "Home" },
	{ name: "Events" },
	{ name: "Gallery" },
	{ name: "Our Team" },
	{ name: "Join Us" },
	{ name: "Contact Us" },
];

const Navbar = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const memoizedNavLinks = useMemo(() => navLinks, []);
	const location = usePathname();
	const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userInitials, setUserInitials] = useState('U');

  // Get user data from localStorage
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const isAuthenticated = !!token;
      setIsLoggedIn(isAuthenticated);
      
      if (isAuthenticated) {
        try {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          if(userData.email){
            setUserEmail(userData.email);
          }
          if (userData.name) {
            setUserName(userData.name);
            const names = userData.name.split(' ');
            const initials = names.length > 1 
              ? `${names[0][0]}${names[names.length - 1][0]}`
              : names[0][0];
            setUserInitials(initials.toUpperCase());
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserEmail('');
      router.push('/');
      setTimeout(() => window.location.reload(), 200);
    }
  };

  const handleLogin = () => {
    if (location === '/users/login') return;
    setLoading(true);
    router.push('/users/login');
  };

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
						{isLoggedIn ? (
              <li className="flex items-center">
                <ProfileDropdown 
                  userName={userName}
                  userEmail={userEmail}
                  userInitials={userInitials} 
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
                  {loading ? 'Loading...' : 'Login'}
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

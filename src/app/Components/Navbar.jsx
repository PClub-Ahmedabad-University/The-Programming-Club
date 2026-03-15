"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import {
  FiLogOut,
  FiCalendar,
  FiCode,
  FiRefreshCw,
  FiX,
  FiCheck,
  FiSettings,
  FiCodepen,
} from "react-icons/fi";
import DrawerIcon from "../Client Components/DrawerIcon";
import Sidebar from "../Client Components/Sidebar";
import { InteractiveHoverButton } from "@/ui-components/InteractiveHover";
import CodeforcesVerificationModal from "./CodeforcesVerificationModal";
import { getRankColor } from "@/lib/cfUtils";
import { getUserRoleFromToken, isExpired } from "@/lib/auth";
import { useUser } from "@/lib/UserContext";

const ProfileDropdown = ({ handleLogout }) => {
  const { user, token } = useUser();

  const [derivedUserName, setDerivedUserName] = useState("User");
  const [derivedUserInitials, setDerivedUserInitials] = useState("U");
  const [formattedEmail, setFormattedEmail] = useState("");

  const [showCodeforcesModal, setShowCodeforcesModal] = useState(false);
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [codeforcesRank, setCodeforcesRank] = useState("unrated");
  const [codeforcesRating, setCodeforcesRating] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    if (token) {
      setUserRole(getUserRoleFromToken(token));
    }
  }, [token]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const fetchUserProfile = async () => {
    try {
      if (!token) return;

      if (isExpired(token)) return;

      setIsLoading(true);

      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data?.data) {
        const { codeforcesHandle, codeforcesRank, codeforcesRating } =
          data.data;

        setCodeforcesHandle(codeforcesHandle || "");
        setCodeforcesRank(codeforcesRank || "unrated");
        setCodeforcesRating(codeforcesRating || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeHandle = async () => {
    if (!confirm("Remove Codeforces handle?")) return;

    try {
      setIsRefreshing(true);

      const res = await fetch("/api/users/remove-handle", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      showToast(data.message || "Handle removed");

      setCodeforcesHandle("");
      setCodeforcesRank("unrated");
      setCodeforcesRating(0);
    } catch {
      showToast("Failed to remove handle", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const parts = user.split("@")[0].split(".");

    const name = parts[0] || "User";
    const initials = name[0]?.toUpperCase() || "U";

    const formatted =
      parts.length >= 2 ? `${parts[0]}-${parts[1]}` : name.toLowerCase();

    setDerivedUserName(name);
    setDerivedUserInitials(initials);
    setFormattedEmail(formatted);

    fetchUserProfile();
  }, [user]);

  return (
    <Menu as="div" className="relative ml-4">
      <Menu.Button className="flex rounded-full bg-slate-800 border-2 border-cyan-500 p-1">
        <div className="h-9 w-9 rounded-full bg-cyan-600 flex items-center justify-center text-white font-semibold">
          {derivedUserInitials}
        </div>
      </Menu.Button>

      <Transition as={Fragment}>
        <Menu.Items className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-800 shadow-xl border border-slate-700">
          <div className="px-5 py-4 border-b border-slate-700">
            <p className="text-white font-semibold">
              {derivedUserName.charAt(0).toUpperCase() + derivedUserName.slice(1)}
            </p>
            <p className="text-xs text-slate-400">{user}</p>

            {codeforcesHandle && (
              <div className="mt-3 text-sm">
                <a
                  href={`https://codeforces.com/profile/${codeforcesHandle}`}
                  target="_blank"
                  style={{ color: getRankColor(codeforcesRank) }}
                >
                  {codeforcesHandle}
                </a>
              </div>
            )}
          </div>

          {userRole === "admin" && (
            <Menu.Item>
              <Link
                href="/admin/dashboard"
                className="flex items-center px-5 py-3 text-sm text-slate-300 hover:bg-slate-700"
              >
                <FiSettings className="mr-3" />
                Admin Panel
              </Link>
            </Menu.Item>
          )}

          <Menu.Item>
            <Link
              href={`/users/events/${formattedEmail}`}
              className="flex items-center px-5 py-3 text-sm text-slate-300 hover:bg-slate-700"
            >
              <FiCalendar className="mr-3" />
              My Registered Events
            </Link>
          </Menu.Item>

          <Menu.Item>
            <button
              onClick={() => setShowCodeforcesModal(true)}
              className="flex items-center px-5 py-3 text-sm text-slate-300 hover:bg-slate-700 w-full"
            >
              <FiCode className="mr-3" />
              {codeforcesHandle ? "Update Handle" : "Add Codeforces Handle"}
            </button>
          </Menu.Item>

          <Menu.Item>
            <button
              onClick={removeHandle}
              className="flex items-center px-5 py-3 text-sm text-slate-300 hover:bg-slate-700 w-full"
            >
              <FiX className="mr-3" />
              Remove Codeforces Handle
            </button>
          </Menu.Item>

          <div className="border-t border-slate-700"></div>

          <Menu.Item>
            <button
              onClick={handleLogout}
              className="flex items-center px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 w-full"
            >
              <FiLogOut className="mr-3" />
              Sign Out
            </button>
          </Menu.Item>
        </Menu.Items>
      </Transition>

      <CodeforcesVerificationModal
        isOpen={showCodeforcesModal}
        onClose={() => setShowCodeforcesModal(false)}
        handle={codeforcesHandle}
        onHandleChange={setCodeforcesHandle}
        onVerificationComplete={(handle) => {
          setCodeforcesHandle(handle);
          showToast("Handle verified");
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
  const router = useRouter();
  const location = usePathname();

  const { user, logout } = useUser();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoggedIn = !!user;

  const memoizedNavLinks = useMemo(() => navLinks, []);

  const handleLogin = () => {
    router.push("/users/login");
  };

  return (
    <>
      <header className="z-30 w-full sticky top-0 bg-pclubBg px-6 shadow-lg">
        <nav className="h-16 flex justify-between items-center">
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
          </Link>

          <ul className="hidden md:flex items-center gap-8 text-white">
            {memoizedNavLinks.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${
                  location === item.path ? "text-white" : "text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {isLoggedIn ? (
              <ProfileDropdown handleLogout={logout} />
            ) : (
              <InteractiveHoverButton onClick={handleLogin}>
                Login
              </InteractiveHoverButton>
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
"use client";

import Image from "next/image";
import Link from "next/link";
import { React, useState } from "react";
import DrawerIcon from "../Client Components/DrawerIcon";
import { motion } from "motion";
import Sidebar from "../Client Components/Sidebar";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { name: "Home" },
    { name: "Past Events" },
    { name: "Join Us" },
    { name: "Contact Us" },
  ];

  return (
    <>
      <header className="z-30 w-full sticky top-0 backdrop-blur-2xl px-8 md:px-16 lg:px-25">
        {/* Navbar */}
        <nav className="nav flex justify-between items-center font-inter">
          <Link href="/" className="logo">
            <Image
              src="/logo.png"
              alt="PClub Logo"
              height={100}
              width={100}
              className="h-30 w-15"
            />
          </Link>
          <ul className="nav-items max-md:hidden flex gap-8 text-white">
            {navLinks.map((item, index) => (
              <Link
                key={index}
                href={
                  item.name === "Home"
                    ? "/"
                    : `/${item.name.toLowerCase().replace(/\s+/g, "-")}`
                }
                className="relative after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:h-[1px] after:w-0 after:bg-gradient-to-r after:from-[#00bec7] after:to-[#004457] after:transition-all after:duration-500 hover:after:w-full"
              >
                {item.name}
              </Link>
            ))}
          </ul>
          <DrawerIcon onClick={() => setSidebarOpen(true)} />
        </nav>
      </header>
      {sidebarOpen && <Sidebar setSidebarOpen={setSidebarOpen} />}
    </>
  );
};

export default Navbar;
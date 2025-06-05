"use client";

import React from 'react';
import { RxCross2 } from "react-icons/rx";
import { motion } from "motion/react";
import Link from 'next/link';

const Sidebar = ({ setSidebarOpen }) => {
  const navLinks = [
    { name: "Home" },
    { name: "Past Events" },
    { name: "Join Us" },
    { name: "Contact Us" },
  ];

  return (
    <motion.div
      className='sidebar h-screen max-xs:w-[70%] w-[40%] bg-white fixed top-0 right-0 rounded-l-xl flex flex-col p-2 z-[100]'
      initial={{ opacity: 0.5, x: "100%" }}
      animate={{ opacity: 1, x: "0%", transition: { duration: 1 } }}
      exit={{ opacity: 0.5, x: "100%", transition: { duration: 1 } }}
    >
      <div className="top w-full flex justify-end" onClick={() => setSidebarOpen(false)}>
        <RxCross2 />
      </div>
      <ul className="nav-items flex flex-col gap-5 mt-10 items-center">
        {navLinks.map((items, index) => (
          <Link key={index} href={
            items.name === "Home"
              ? "/"
              : `/${items.name.toLowerCase().replace(/\s+/g, "-")}`
          }>{items.name}</Link>
        ))}
      </ul>
    </motion.div>
  )
}

export default Sidebar
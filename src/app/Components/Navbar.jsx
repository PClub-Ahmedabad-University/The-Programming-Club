"use client";

import Image from 'next/image';
import Link from 'next/link';
import {React, useState} from 'react';
import "../Styles/Navbar.css";
import DrawerIcon from '../Client Components/DrawerIcon';
import { AnimatePresence, motion } from "motion/react";
import Sidebar from '../Client Components/Sidebar';

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    {name: "Home"},
    {name: "Past Events"},
    {name: "Join Us"},
    {name: "Contact Us"},
  ];

  return (
    <>
    <header className="w-full sticky top-0 backdrop-blur-2xl px-8 md:px-16 lg:px-25">
        {/* Navbar */}
        <nav className='nav flex justify-between items-center font-inter'>
            <Link href="/" className="logo">
                <Image src="/logo.png" alt='PClub Logo' height={100} width={100} className='h-30 w-15'/>
            </Link>
            <ul className="nav-items max-md:hidden flex gap-8 text-white">
                {navLinks.map((item,index) => (
                    <Link key={index} href="/" className='nav-links relative'>{item.name}</Link>
                ))}
            </ul>
            <DrawerIcon onClick={() => setSidebarOpen(true)}/>
        </nav>
    </header>
    <AnimatePresence>
        {sidebarOpen && (
            <Sidebar setSidebarOpen={setSidebarOpen}/>
        )}
    </AnimatePresence>
    </>
  )
}

export default Navbar
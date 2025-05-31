import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import "../Styles/Navbar.css";
import DrawerIcon from '../Client Components/DrawerIcon';

const Navbar = () => {
  const navLinks = [
    {name: "Home"},
    {name: "Past Events"},
    {name: "Join Us"},
    {name: "Contact Us"},
  ];

  return (
    // Container
    <header className="container w-[90%] mx-auto sticky top-0 backdrop-blur-2xl">
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
            <DrawerIcon/>
        </nav>
    </header>
  )
}

export default Navbar
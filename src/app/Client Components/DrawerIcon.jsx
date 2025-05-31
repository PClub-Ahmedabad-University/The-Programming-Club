"use client";

import React, { useState } from 'react';
import { FaCode } from "react-icons/fa6";
import { AnimatePresence, motion } from "motion/react";
import Sidebar from './Sidebar';

const DrawerIcon = () => {
   const [sidebarOpen, setSidebarOpen] = useState(false); 

  return (
        <div className="drawer-icon max-md:block hidden">
            <FaCode color='white' size={25} onClick={() => setSidebarOpen(true)}/>
            <AnimatePresence>
                {sidebarOpen && (
                    <Sidebar setSidebarOpen={setSidebarOpen}/>
                )}
            </AnimatePresence>
        </div>
  )
}

export default DrawerIcon
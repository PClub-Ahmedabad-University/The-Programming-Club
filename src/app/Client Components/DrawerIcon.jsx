"use client";

import React, { useState } from 'react';
import { FaCode } from "react-icons/fa6";

const DrawerIcon = ({onClick}) => {
   const [sidebarOpen, setSidebarOpen] = useState(false); 

  return (
        <div className="drawer-icon max-md:block hidden">
            <FaCode color='white' size={25} onClick={onClick}/>
        </div>
  )
}

export default DrawerIcon
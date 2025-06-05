import Link from 'next/link';
import React from 'react';
import { FaInstagram } from "react-icons/fa";

const Notice = () => {
  return (
    <div className="notice-container h-10 w-screen bg-[linear-gradient(90deg,_#026C71_0%,_#004457_100%)] font-inter flex justify-center items-center shadow-xl relative">
        <Link href="https://www.instagram.com/ahduni_programmingclub/" target='_blank' className='absolute left-5'>
            <FaInstagram color='white' size={22}/>
        </Link>
        <h1 className='text-white font-bold'>Meme the code is live !</h1>
    </div>
  )
}

export default Notice
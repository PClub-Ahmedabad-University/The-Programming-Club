"use client";
import Link from 'next/link';
import React from 'react';
import { FaInstagram } from "react-icons/fa";

const Notice = () => {
  const [notice, setNotice] = React.useState(null);

  React.useEffect(() => {
    fetch('/api/notice')
      .then(res => res.json())
      .then(data => setNotice(data))
      .catch(() => setNotice({ show: false }));
  }, []);
  console.log(notice);
  if (!notice || !notice.show) return null;

  return (
    <div className="notice-container h-10 w-screen bg-[linear-gradient(90deg,_#026C71_0%,_#004457_100%)] font-inter flex justify-center items-center shadow-xl relative">
      <Link href={notice.link} target='_blank' className='absolute left-5'>
        <FaInstagram color='white' size={22}/>
      </Link>
      <h1 className='text-white font-bold'>{notice.message}</h1>
    </div>
  );
}

export default Notice;
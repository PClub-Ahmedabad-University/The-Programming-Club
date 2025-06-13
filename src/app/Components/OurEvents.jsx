import React from 'react';
import "../Styles/OurEvents.css";
import Image from 'next/image';

const OurEvents = () => {
  return (
    <section className='font-emigow px-8 md:px-16 lg:px-25 mb-3 lg:mt-5 lg:mb-20 '>
        <h1 className='our-event font-extrabold text-[35px] md:text-[100px] lg:text-[140px] text-transparent text-center tracking-[3px] pt-8 lg:pt-0'>OUR EVENTS</h1>
        <div className="our-events-image flex justify-center mt-5 mb-10 lg:mt-10">
            <Image src="/OurEvents.png" alt='Our Events' height={800} width={800} className='w-full border border-[rgb(50,50,50)] shadow-white shadow-[0px_0px_2px_3px_rgb(50,50,50)]' draggable={false} priority/>
        </div>
    </section>
  )
}

export default OurEvents
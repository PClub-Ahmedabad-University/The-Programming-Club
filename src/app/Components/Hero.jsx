import React from 'react';
import UpcomingEvent from './UpcomingEvent';
import Image from 'next/image';
import "../Styles/Hero.css";

const Hero = () => {
  return (
    <>
    <section className="font-content hero-section w-full flex flex-col-reverse lg:flex-row px-8 mt-8 mb-18 md:px-16 lg:px-25 lg:mt-10 lg:mb-30">
        {/* Left Section */}
        <div className="hero-section-left w-full lg:w-[55%] flex flex-col justify-center mt-5 lg:mt-0">
            <div className="hero-header">
                <h2 className='text-white font-normal text-lg lg:text-2xl'>Welcome !!</h2>
                <h1 className='font-heading font-bold text-3xl lg:text-5xl text-[#00C8FF] my-1 lg:my-3'>Programming Club</h1>
                <h2 className='text-white font-semibold text-lg'>Ahmedabad University</h2>
                <p className='w-full lg:w-3/4 text-lg font-normal text-[#8E8E8E] mt-5'>Unleashing creativity through the power of code. Join us to learn, explore, and build innovative solutions, sharpen your skills, and connect with like-minded enthusiasts in a vibrant tech community.</p>
            </div>
            {/* <div className="join-us mt-8">
                <form className='flex gap-3'>
                    <input type="email" name='email' placeholder='Your Email Address' className='bg-white rounded-md text-sm px-3 py-2 lg:px-4 lg:py-3 w-4/6 lg:w-2/5'/>
                    <button type='submit' className='bg-[#04556F] text-white text-sm px-2 py-2 lg:px-4 lg:py-3 rounded-md cursor-pointer'>JOIN US</button>
                </form>
            </div> */}
            <UpcomingEvent/>
        </div>
        <div className="hero-section-right w-full lg:w-[45%] flex justify-center lg:justify-center items-center">
            <Image src="/hero.png" alt='Hero Image' height={600} width={600} className='hero-image w-full max-w-md sm:max-w-lg lg:max-w-xl h-auto object-contain' priority/>
        </div>
    </section>
    </>
  )
}

export default Hero
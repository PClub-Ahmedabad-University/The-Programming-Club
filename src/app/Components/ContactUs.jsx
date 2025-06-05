import React from 'react';
import AnimatedIcons from './AnimatedIcons';

const ContactUs = () => {
  return (
    <section className="contact-us w-full px-8 md:px-16 lg:px-25 mb-3 font-inter flex flex-col-reverse lg:flex-row justify-around items-center">
        <div className="contact-us-left w-full lg:w-2/6">
            <h1 className='font-bold text-[50px] text-[#00C8FF]'>Contact Us</h1>
            <form className='contact-us-form mt-5 flex flex-col gap-8'>
                <div className="name flex flex-col gap-3">
                    <label htmlFor="fullname" className='font-extralight text-lg text-white'>Full Name</label>
                    <input type="text" name='fullname' className='border-b border-white focus:outline-0 text-white py-2' placeholder='John Doe' required/>
                </div>
                <div className="email flex flex-col gap-3">
                    <label htmlFor="email" className='font-extralight text-lg text-white'>E-mail</label>
                    <input type="email" name='email' className='border-b border-white focus:outline-0 text-white py-2 lowercase' placeholder='johndoe@gmail.com' required/>
                </div>
                <div className="message flex flex-col gap-3">
                    <label htmlFor="message" className='font-extralight text-lg text-white'>Message</label>
                    <input name="message" placeholder='Mesaage' className='border-b border-white py-2 focus:outline-0 text-white' required/>
                </div>
                <button type='submit' className='bg-[#004457] font-medium text-lg text-white py-3 rounded-md mt-2'>
                    Send
                </button>
            </form>
        </div>
        <div className="contact-us-right flex justify-end items-center">
            <AnimatedIcons/>
        </div>
    </section>
  )
}

export default ContactUs
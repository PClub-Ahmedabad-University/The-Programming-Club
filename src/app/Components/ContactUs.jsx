"use client";

import React, { useState } from 'react';
import AnimatedIcons from './AnimatedIcons';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="font-content contact-us w-full px-8 md:px-16 lg:px-25 mb-3 flex flex-col-reverse lg:flex-row justify-around items-center">
      <div className="contact-us-left w-full lg:w-2/6">
        <h1 className='font-heading font-bold text-[50px] text-[#00C8FF]'>Contact Us</h1>
        <form className='contact-us-form mt-5 flex flex-col gap-8' onSubmit={handleSubmit}>
          <div className="name flex flex-col gap-3">
            <label htmlFor="name" className='font-extralight text-lg text-white'>Full Name</label>
            <input
              type="text"
              name='name'
              className='border-b border-white focus:outline-0 text-white py-2'
              placeholder='John Doe'
              required
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="email flex flex-col gap-3">
            <label htmlFor="email" className='font-extralight text-lg text-white'>E-mail</label>
            <input
              type="email"
              name='email'
              className='border-b border-white focus:outline-0 text-white py-2 lowercase'
              placeholder='johndoe@gmail.com'
              required
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="message flex flex-col gap-3">
            <label htmlFor="message" className='font-extralight text-lg text-white'>Message</label>
            <input
              name="message"
              placeholder='Message'
              className='border-b border-white py-2 focus:outline-0 text-white'
              required
              value={formData.message}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          <button
            type='submit'
            className='bg-[#004457] font-medium text-lg text-white py-3 rounded-md mt-2'
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send"}
          </button>
          {submitStatus === "success" && (
            <p className="text-green-400 mt-2">Message sent successfully!</p>
          )}
          {submitStatus === "error" && (
            <p className="text-red-400 mt-2">Something went wrong. Please try again.</p>
          )}
        </form>
      </div>
      <div className="contact-us-right flex justify-end items-center">
        <AnimatedIcons />
      </div>
    </section>
  );
}

export default ContactUs;
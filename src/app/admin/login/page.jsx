"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { InteractiveGridPattern } from '@/ui-components/InteractiveGrid';
import { ShineBorder } from '@/ui-components/ShinyBorder';
import { cn } from '@/lib/utils';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));


    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        console.log('Login attempt with:', formData);

        await new Promise(resolve => setTimeout(resolve, 1000));
        

        console.log('Login successful');
      } catch (error) {
        console.error('Login failed:', error);
        setErrors({ form: 'Invalid credentials. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-pclubBg">
      <div className="relative w-full md:w-2/5 h-[30vh] md:h-auto flex items-center justify-center bg-[#0A0F1C] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <InteractiveGridPattern
            className={cn(
              "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
            )}
            width={30}
            height={30}
            squares={[30, 30]}
            squaresClassName="stroke-indigo-500/20 hover:stroke-indigo-400/40 hover:fill-indigo-600/10"
          />
        </div>
        <div className="relative z-10 flex items-center justify-center p-4">
          <Image
            src="/logo.png"
            alt="Programming Club Logo"
            width={200}
            height={200}
            className="w-28 sm:w-36 md:w-44 lg:w-52 h-auto object-contain"
            priority
          />
        </div>
      </div>


      <div className="z-10 w-full md:w-3/5 bg-pclubBg flex items-center justify-center px-4 py-10 sm:px-8 md:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-sm sm:max-w-md relative overflow-hidden rounded-xl bg-[#0C1224] shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />

          <div className="relative z-10 p-5 sm:p-6 md:p-8 space-y-5">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Admin Login
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Access the admin dashboard
              </p>
            </div>

            {errors.form && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-md text-sm">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className={cn(
                    "w-full bg-[#131B36] text-white rounded-md py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-sm",
                    errors.email ? "border border-red-500" : "border border-transparent"
                  )}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={cn(
                    "w-full bg-[#131B36] text-white rounded-md py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-sm",
                    errors.password ? "border border-red-500" : "border border-transparent"
                  )}
                  disabled={isSubmitting}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

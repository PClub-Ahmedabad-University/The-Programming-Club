"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FlickeringGrid } from '@/ui-components/FlickeringGrid';
import { ShineBorder } from '@/ui-components/ShinyBorder';


const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt with:', formData);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Half - Flickering Grid with Logo */}
      <div className="bg-black relative w-full md:w-2/5 h-[40vh] sm:h-[45vh] md:h-auto md:min-h-screen flex items-center justify-center">
        <FlickeringGrid
          className="absolute inset-0 z-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.5}
          flickerChance={0.1}
          height={800}
          width={800}
        />
        <div className="relative z-10 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <Image
            src="/logo1.png"
            alt="Programming Club Logo"
            width={180}
            height={180}
            className="object-contain w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 xl:w-56 xl:h-56"
            priority
          />
        </div>
      </div>

      {/* Right Half - Login Form */}
      <div className="w-full md:w-3/5 bg-pclubBg flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-[60vh] sm:min-h-[55vh] md:min-h-screen z-10">
        <div className="w-full max-w-sm sm:max-w-md relative overflow-hidden rounded-xl bg-[#0C1224]">
          <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]
} />
          
          <div className="relative z-10 p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Login to your Programming Club account
              </p>
            </div>

            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="relative block w-full rounded-md border-0 bg-[#131B36] py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:z-10 text-sm md:text-base"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="relative block w-full rounded-md border-0 bg-[#131B36] py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:z-10 text-sm md:text-base"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-600 bg-[#131B36] text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="#" className="text-indigo-400 hover:text-indigo-300">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="w-full justify-center rounded-md bg-indigo-600 py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300"
              >
                Sign In
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link href="/users/sign-up" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

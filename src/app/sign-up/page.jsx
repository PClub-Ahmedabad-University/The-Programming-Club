"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FlickeringGrid } from '@/ui-components/FlickeringGrid';
import { ShineBorder } from '@/ui-components/ShinyBorder';

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        enrollmentNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing again
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Enrollment number validation
        if (!formData.enrollmentNumber.trim()) {
            newErrors.enrollmentNumber = 'Enrollment number is required';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            // Handle sign up logic here
            console.log('Sign up attempt with:', formData);
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* Left Half - Flickering Grid with Logo */}
            <div className="bg-black relative w-full md:w-2/5 h-[30vh] sm:h-[35vh] md:h-auto md:min-h-screen flex items-center justify-center">
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
                        src="/logo.png"
                        alt="Programming Club Logo"
                        width={180}
                        height={180}
                        className="object-contain w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-52 xl:h-52"
                        priority
                    />
                </div>
            </div>

            {/* Right Half - Sign Up Form */}
            <div className="w-full md:w-3/5 bg-pclubBg flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-[70vh] sm:min-h-[65vh] md:min-h-screen z-10">
                <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl relative overflow-hidden rounded-xl bg-[#0C1224]">
                    <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />

                    <div className="relative z-10 p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
                                Join the Club
                            </h2>
                            <p className="mt-2 text-sm text-gray-400">
                                Create your Programming Club account
                            </p>
                        </div>

                        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Name Field */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    {/* Name Field */}
                                    <div className="w-full">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                            Name
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="relative block w-full rounded-md border-0 bg-[#131B36] py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:z-10 text-sm md:text-base"
                                            placeholder="Your full name"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    {/* Enrollment Number Field */}
                                    <div className="w-full">
                                        <label htmlFor="enrollmentNumber" className="block text-sm font-medium text-gray-300">
                                            Enrollment Number
                                        </label>
                                        <input
                                            id="enrollmentNumber"
                                            name="enrollmentNumber"
                                            type="text"
                                            required
                                            value={formData.enrollmentNumber}
                                            onChange={handleChange}
                                            className="relative block w-full rounded-md border-0 bg-[#131B36] py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:z-10 text-sm md:text-base"
                                            placeholder="Your enrollment number"
                                        />
                                        {errors.enrollmentNumber && <p className="text-red-500 text-xs mt-1">{errors.enrollmentNumber}</p>}
                                    </div>
                                </div>

                                {/* Email Field */}
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
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="relative block w-full rounded-md border-0 bg-[#131B36] py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:z-10 text-sm md:text-base"
                                        placeholder="Create a password"
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="relative block w-full rounded-md border-0 bg-[#131B36] py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:z-10 text-sm md:text-base"
                                        placeholder="Confirm your password"
                                    />
                                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full justify-center rounded-md bg-indigo-600 py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300"
                            >
                                Create Account
                            </button>
                        </form>

                        <div className="text-center">
                            <p className="text-sm text-gray-400">
                                Already have an account?{' '}
                                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;

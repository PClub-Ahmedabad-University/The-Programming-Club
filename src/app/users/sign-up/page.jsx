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

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.enrollmentNumber.trim()) newErrors.enrollmentNumber = 'Enrollment number is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Sign up attempt with:', formData);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-black">
            <div className="relative w-full md:w-2/5 h-[30vh] md:h-auto flex items-center justify-center">
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

            {/* Right Form Section */}
            <div className="z-10 w-full md:w-3/5 bg-pclubBg flex items-center justify-center px-4 py-10 sm:px-8 md:px-10 lg:px-14 xl:px-20">
                <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl relative overflow-hidden rounded-xl bg-[#0C1224]">
                    <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />

                    <div className="relative z-10 p-5 sm:p-6 md:p-8 space-y-5">
                        <div className="text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                Join the Club
                            </h2>
                            <p className="mt-2 text-sm text-gray-400">
                                Create your Programming Club account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Name */}
                                <div className="w-full">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        className="w-full bg-[#131B36] text-white rounded-md py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                {/* Enrollment Number */}
                                <div className="w-full">
                                    <label htmlFor="enrollmentNumber" className="block text-sm font-medium text-gray-300">
                                        Enrollment Number
                                    </label>
                                    <input
                                        id="enrollmentNumber"
                                        name="enrollmentNumber"
                                        type="text"
                                        value={formData.enrollmentNumber}
                                        onChange={handleChange}
                                        placeholder="Enrollment number"
                                        className="w-full bg-[#131B36] text-white rounded-md py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                    {errors.enrollmentNumber && <p className="text-red-500 text-xs mt-1">{errors.enrollmentNumber}</p>}
                                </div>
                            </div>

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
                                    placeholder="name@example.com"
                                    className="w-full bg-[#131B36] text-white rounded-md py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-sm"
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
                                    placeholder="Create a password"
                                    className="w-full bg-[#131B36] text-white rounded-md py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="w-full bg-[#131B36] text-white rounded-md py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                            >
                                Create Account
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-400 mt-4">
                            Already have an account?{" "}
                            <Link href="/users/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;

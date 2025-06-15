"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlickeringGrid } from "@/ui-components/FlickeringGrid";
import { ShineBorder } from "@/ui-components/ShinyBorder";
import { cn } from "@/lib/utils";
import Button from "@/ui-components/Button1";
import PasswordInput from "@/app/Components/PasswordInput";
import Loader from "@/ui-components/Loader1";

const LoginPage = () => {
	const router = useRouter();
	const [isClient, setIsClient] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsClient(true);
		const user = localStorage.getItem("user");
		if (user) {
			router.push("/");
		} else {
			setIsLoading(false);
		}
	}, [router]);

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email";
		}
		if (!formData.password) {
			newErrors.password = "Password is required";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (validateForm()) {
			setIsSubmitting(true);

			try {
				const response = await fetch("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: formData.email,
						password: formData.password,
					}),
				}).then((data) => (data.status === 200 ? data.json() : "error"));

				if (response !== "error") {
					localStorage.setItem("token", response.token);
					localStorage.setItem("user", formData.email);
					window.location.href = "/";
				} else {
					setErrors({ form: "Invalid Credentials!" });
				}
			} catch (error) {
				setErrors({ form: error.message });
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	// Show loading state while checking auth status
	if (!isClient || isLoading) {
		return (
			<div className="min-h-screen bg-pclubBg text-white p-8 flex items-center justify-center">
				<div className="animate-pulse">
					<Loader />
				</div>
			</div>
		);
	}

	// Redirect if already logged in (client-side check)
	if (localStorage.getItem("user")) {
		return (
			<div className="min-h-screen bg-pclubBg text-white p-8 flex items-center justify-center">
				<div className="animate-pulse">
					<Loader />{" "}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full flex flex-col md:flex-row bg-gray-950">
			<div className="relative w-full md:w-2/5 h-[30vh] md:h-auto flex items-center justify-center bg-gray-950 overflow-hidden">
				<FlickeringGrid
					className="absolute inset-0 z-0 size-full"
					squareSize={4}
					gridGap={6}
					color="#6B7280"
					maxOpacity={0.5}
					flickerChance={0.1}
				/>
				<div className="relative z-10 flex items-center justify-center p-4">
					<Image
						src="/logo1.png"
						alt="Programming Club Logo"
						width={200}
						height={200}
						className="w-24 sm:w-32 md:w-40 lg:w-48 h-auto object-contain"
						priority
					/>
				</div>
			</div>

			<div className="font-content z-10 w-full md:w-3/5 bg-gray-950 flex items-center justify-center px-4 py-8 sm:py-12 md:py-16 lg:py-20">
				<div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg relative overflow-hidden rounded-xl bg-[#0C1224] shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
					<ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />

					<div className="relative z-10 p-4 sm:p-6 md:p-8 space-y-5">
						<div className="text-center font-content">
							<h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
								Welcome Back
							</h2>
							<p className="mt-2 text-xs sm:text-sm text-gray-400">
								Login to your Programming Club account
							</p>
						</div>

						{errors.form && (
							<div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-md text-xs sm:text-sm">
								{errors.form}
							</div>
						)}

						<form
							onSubmit={handleSubmit}
							className="space-y-4 flex flex-col items-center"
						>
							<div className="w-full space-y-4">
								<div className="w-full">
									<label
										htmlFor="email"
										className="block text-xs sm:text-sm font-medium text-gray-300"
									>
										Email
									</label>
									<input
										id="email"
										name="email"
										type="email"
										autoComplete="email"
										value={formData.email}
										onChange={handleChange}
										placeholder="name@example.com"
										className={cn(
											"w-full bg-[#131B36] text-white rounded-md py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm",
											errors.email
												? "border border-red-500"
												: "border border-transparent"
										)}
										disabled={isSubmitting}
									/>
									{errors.email && (
										<p className="text-red-500 text-xs mt-1">{errors.email}</p>
									)}
								</div>

								<div className="w-full">
									<label
										htmlFor="password"
										className="block text-xs sm:text-sm font-medium text-gray-300"
									>
										Password
									</label>
									<PasswordInput
										id="password"
										name="password"
										autoComplete="current-password"
										value={formData.password}
										onChange={handleChange}
										placeholder="Enter your password"
										className={cn(
											"w-full bg-[#131B36] text-white rounded-md py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm",
											errors.password
												? "border border-red-500"
												: "border border-transparent"
										)}
										disabled={isSubmitting}
									/>
									{errors.password && (
										<p className="text-red-500 text-xs mt-1">
											{errors.password}
										</p>
									)}
								</div>
							</div>

							<div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
								<div className="text-xs sm:text-sm">
									<Link
										href="/users/forget-password"
										className="text-indigo-400 hover:text-indigo-300"
									>
										Forgot password?
									</Link>
								</div>
							</div>

							<div className="w-full flex justify-center">
								<Button
									type="submit"
									isSubmitting={isSubmitting}
									className="mt-4 px-24 w-full sm:w-auto"
								>
									Sign In
								</Button>
							</div>
						</form>

						<p className="text-center text-xs sm:text-sm text-gray-400 mt-4">
							Don't have an account?{" "}
							<Link
								href="/users/sign-up"
								className="text-indigo-400 hover:text-indigo-300 font-medium"
							>
								Sign up
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;

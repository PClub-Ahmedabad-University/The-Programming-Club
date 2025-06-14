"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FlickeringGrid } from "@/ui-components/FlickeringGrid";
import { ShineBorder } from "@/ui-components/ShinyBorder";
import { cn } from "@/lib/utils";
import Button from "@/ui-components/Button1";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		enrollmentNumber: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "user",
		otp: "",
	});
	const router = useRouter();
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showOtpModal, setShowOtpModal] = useState(false);
	const [isOtpSent, setIsOtpSent] = useState(false);

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
		if (!formData.name.trim()) newErrors.name = "Name is required";
		if (!formData.enrollmentNumber.trim())
			newErrors.enrollmentNumber = "Enrollment number is required";
		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email";
		}
		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}
		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsSubmitting(true);
		try {
			console.log("Sign up attempt with:", formData);

			// First API call - send OTP
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					enrollmentNumber: formData.enrollmentNumber,
					email: formData.email,
					password: formData.password,
					role: formData.role,
				}),
			});

			const data = await response.json();
			console.log("API Response:", data);

			if (!response.ok) {
				setErrors({ form: data.error || "Sign up failed" });
				return;
			}

			// If we reach here, the request was successful (200 status)
			// Show the OTP modal regardless of the response structure
			console.log("OTP sent successfully, showing modal");
			setIsOtpSent(true);
			setShowOtpModal(true);
			setFormData((prev) => ({ ...prev, otp: "" })); // Clear any existing OTP
			setErrors({}); // Clear any previous errors
		} catch (error) {
			console.error("Sign up failed:", error);
			setErrors({ form: "Sign up failed. Please try again." });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOtpSubmit = async () => {
		if (!formData.otp.trim() || formData.otp.length !== 6) {
			setErrors((prev) => ({ ...prev, otp: "Please enter a valid 6-digit OTP" }));
			return;
		}

		setIsSubmitting(true);
		try {
			// Second API call - verify OTP and complete registration
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					enrollmentNumber: formData.enrollmentNumber,
					email: formData.email,
					password: formData.password,
					otp: formData.otp,
					role: formData.role,
					verifyOtp: true, // Add a flag to indicate OTP verification
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setErrors({ otp: data.error || "OTP verification failed" });
				return;
			}
			console.log(data);
			console.log(formData);
			localStorage.setItem("user", formData.email);
			localStorage.setItem("token", data.token);
			// Success - close modal and redirect
			setShowOtpModal(false);
			console.log("OTP verified successfully");
			router.push("/");
		} catch (error) {
			console.error("OTP verification failed:", error);
			setErrors({ otp: "OTP verification failed. Please try again." });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOtpCancel = () => {
		setShowOtpModal(false);
		setIsOtpSent(false);
		setFormData((prev) => ({ ...prev, otp: "" }));
		setErrors((prev) => ({ ...prev, otp: "" }));
	};

	return (
		<div className="min-h-screen w-full flex flex-col md:flex-row bg-pclubBg">
			<div className="relative w-full md:w-2/5 h-[30vh] md:h-auto flex items-center justify-center bg-[#0A0F1C] overflow-hidden">
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

			<div className="z-10 w-full md:w-3/5 bg-pclubBg flex items-center justify-center px-4 py-8 sm:py-12 md:py-16 lg:py-20">
				<div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg relative overflow-hidden rounded-xl bg-[#0C1224] shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
					<ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />

					<div className="relative z-10 p-4 sm:p-6 md:p-8 space-y-5">
						<div className="text-center">
							<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
								Join the Club
							</h2>
							<p className="mt-2 text-xs sm:text-sm text-gray-400">
								Create your Programming Club account
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
							<div className="w-full flex flex-col sm:flex-row gap-4">
								<div className="w-full">
									<label
										htmlFor="name"
										className="block text-xs sm:text-sm font-medium text-gray-300"
									>
										Name
									</label>
									<input
										id="name"
										name="name"
										type="text"
										value={formData.name}
										onChange={handleChange}
										placeholder="Your full name"
										className={cn(
											"w-full bg-[#131B36] text-white rounded-md py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm",
											errors.name
												? "border border-red-500"
												: "border border-transparent"
										)}
										disabled={isSubmitting}
									/>
									{errors.name && (
										<p className="text-red-500 text-xs mt-1">{errors.name}</p>
									)}
								</div>

								<div className="w-full">
									<label
										htmlFor="enrollmentNumber"
										className="block text-xs sm:text-sm font-medium text-gray-300"
									>
										Enrollment Number
									</label>
									<input
										id="enrollmentNumber"
										name="enrollmentNumber"
										type="text"
										value={formData.enrollmentNumber}
										onChange={handleChange}
										placeholder="Enrollment number"
										className={cn(
											"w-full bg-[#131B36] text-white rounded-md py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm",
											errors.enrollmentNumber
												? "border border-red-500"
												: "border border-transparent"
										)}
										disabled={isSubmitting}
									/>
									{errors.enrollmentNumber && (
										<p className="text-red-500 text-xs mt-1">
											{errors.enrollmentNumber}
										</p>
									)}
								</div>
							</div>

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
								<input
									id="password"
									name="password"
									type="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="Create a password"
									className={cn(
										"w-full bg-[#131B36] text-white rounded-md py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm",
										errors.password
											? "border border-red-500"
											: "border border-transparent"
									)}
									disabled={isSubmitting}
								/>
								{errors.password && (
									<p className="text-red-500 text-xs mt-1">{errors.password}</p>
								)}
							</div>

							<div className="w-full">
								<label
									htmlFor="confirmPassword"
									className="block text-xs sm:text-sm font-medium text-gray-300"
								>
									Confirm Password
								</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									value={formData.confirmPassword}
									onChange={handleChange}
									placeholder="Confirm your password"
									className={cn(
										"w-full bg-[#131B36] text-white rounded-md py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm",
										errors.confirmPassword
											? "border border-red-500"
											: "border border-transparent"
									)}
									disabled={isSubmitting}
								/>
								{errors.confirmPassword && (
									<p className="text-red-500 text-xs mt-1">
										{errors.confirmPassword}
									</p>
								)}
							</div>

							<div className="w-full flex justify-center">
								<Button
									type="submit"
									isSubmitting={isSubmitting}
									className="mt-4 px-24 w-full sm:w-auto"
								>
									{isOtpSent ? "Resend OTP" : "Create Account"}
								</Button>
							</div>
						</form>

						<p className="text-center text-xs sm:text-sm text-gray-400 mt-4">
							Already have an account?{" "}
							<Link
								href="/users/login"
								className="text-indigo-400 hover:text-indigo-300 font-medium"
							>
								Sign in
							</Link>
						</p>
					</div>
				</div>

				{/* OTP Modal */}
				{showOtpModal && (
					<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
						<div className="bg-[#0C1224] p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 text-white relative">
							<h3 className="text-xl font-semibold mb-4 text-center">Enter OTP</h3>
							<p className="text-sm text-gray-400 mb-4 text-center">
								We've sent a 6-digit code to {formData.email}
							</p>

							<div className="flex justify-between gap-2 mb-4">
								{[...Array(6)].map((_, i) => (
									<input
										key={i}
										type="text"
										inputMode="numeric"
										maxLength="1"
										className="w-10 h-12 text-center text-lg rounded border border-gray-600 bg-[#131B36] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
										value={formData.otp[i] || ""}
										onChange={(e) => {
											const val = e.target.value.replace(/[^0-9]/g, "");
											const newOtp =
												formData.otp.substring(0, i) +
												val +
												formData.otp.substring(i + 1);
											setFormData((prev) => ({ ...prev, otp: newOtp }));

											// Clear OTP error when user starts typing
											if (errors.otp) {
												setErrors((prev) => ({ ...prev, otp: "" }));
											}

											// Auto-focus next input
											if (val && e.target.nextSibling) {
												e.target.nextSibling.focus();
											}
										}}
										onKeyDown={(e) => {
											if (
												e.key === "Backspace" &&
												!formData.otp[i] &&
												e.target.previousSibling
											) {
												e.target.previousSibling.focus();
											}
										}}
									/>
								))}
							</div>

							{errors.otp && (
								<p className="text-red-500 text-sm mb-4 text-center">
									{errors.otp}
								</p>
							)}

							<div className="flex justify-end gap-4">
								<button
									onClick={handleOtpCancel}
									className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
									disabled={isSubmitting}
								>
									Cancel
								</button>
								<button
									onClick={handleOtpSubmit}
									className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
									disabled={isSubmitting || formData.otp.length !== 6}
								>
									{isSubmitting ? "Verifying..." : "Verify OTP"}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SignUpPage;

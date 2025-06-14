"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { InteractiveGridPattern } from "@/ui-components/InteractiveGrid";
import { ShineBorder } from "@/ui-components/ShinyBorder";
import { cn } from "@/lib/utils";
import Button from "@/ui-components/Button1";
import PasswordInput from "@/app/Components/PasswordInput";

const AdminLoginPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		(async () => {
			if (localStorage.getItem("user") && localStorage.getItem("token")) {
				try {
					const validToken = await fetch("/api/auth/validate", {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							authorization: "Bearer " + localStorage.getItem("token"),
						},
					});
					if (validToken.status !== 200) {
						return;
					}
					const role = JSON.parse(atob(token.split(".")[1])).role;
					if (role.toLowerCase() !== "admin") {
						window.location.href = "/admin/dashboard";
					}
				} catch (error) {}
			}
		})();
	}, []);

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
				const response = await fetch("/api/admin/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: formData.email,
						password: formData.password,
					}),
				}).then((data) => {
					if (data.status === 200) return data.json();
					throw new Error("Invalid user credentials");
				});
				const { token } = response;
				if (!token) {
					throw new Error("Invalid user credentials");
				}
				localStorage.setItem("user", formData.email);
				localStorage.setItem("token", token);
				window.location.href = "/admin/dashboard";
			} catch (error) {
				console.error("Login failed:", error);
				setErrors({ form: "Invalid credentials. Please try again." });
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
								Admin Login
							</h2>
							<p className="mt-2 text-xs sm:text-sm text-gray-400">
								Access the admin dashboard
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
									placeholder="admin@example.com"
									className={cn(
										"w-full bg-[#131B36] text-white rounded-md py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm",
										errors.email
											? "border-red-500"
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
									value={formData.password}
									onChange={handleChange}
									placeholder="••••••••"
									className={cn(
										"w-full bg-[#131B36] text-white rounded-md py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm",
										errors.password
											? "border-red-500"
											: "border border-transparent"
									)}
									disabled={isSubmitting}
								/>
								{errors.password && (
									<p className="text-red-500 text-xs mt-1">{errors.password}</p>
								)}
							</div>

							<div className="w-full flex justify-center">
								<Button
									type="submit"
									isSubmitting={isSubmitting}
									className="mt-4 px-24 w-full sm:w-auto"
								>
									Login
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminLoginPage;

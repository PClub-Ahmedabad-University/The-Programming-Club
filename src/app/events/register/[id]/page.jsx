"use client";

import { useEffect, useRef, useState } from "react";
import Loader from "@/ui-components/Loader1";

export default function RegisterEvent({ params }) {
	const [loggedIn, setLoggedIn] = useState(false);
	const [currentEvent, setCurrentEvent] = useState();
	const [otpCorrect, setOtpCorrect] = useState(false);
	const [errors, setErrors] = useState(["", ""]);
	const [loading, setLoading] = useState(true);
	const [sendingOtp, setSendingOtp] = useState(false);
	const [verifyingOtp, setVerifyingOtp] = useState(false);
	const emailInputRef = useRef();
	const otpInputRef = useRef();
	const [otpToken, setOtpToken] = useState(null);
	const sendOtpButtonRef = useRef();
	const verifyOtpButtonRef = useRef();

	useEffect(() => {
		(async () => {
			const token = localStorage.getItem("token");
			const awaitedParams = await params;
			Promise.allSettled([
				fetch("/api/auth/validate", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						authorization: token ? "Bearer " + token : undefined,
					},
				}).then((data) => (data.status === 200 ? setLoggedIn(true) : setLoggedIn(false))),
				fetch("/api/events/get/" + awaitedParams.id)
					.then((data) => {
						if (data.status === 200) return data;
						else throw new Error(data.error);
					})
					.then((data) => data.json())
					.then((data) => setCurrentEvent(data.event))
					.catch((err) => {}),
			]).finally(() => {
				setLoading(false);
			});
		})();
	}, []);

	function checkValidEmail(email) {
		if (/^(?!.*\+).{4,}@ahduni\.edu\.in$/.test(email)) return true;
		else return false;
	}

	async function sendOTP(email) {
		if (checkValidEmail(email)) {
			setSendingOtp(true);
			setErrors(["", ""]);

			await fetch("/api/event-registration", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					otherData: {
						email,
					},
				}),
			})
				.then((data) => (data.status === 200 ? data.json() : [data]))
				.then((data) => {
					if (data && !Array.isArray(data) && data.data) {
						setOtpToken(data.data);
						setErrors((prev) => [
							[
								"OTP sent successfully! Please check your email (including spam folder)",
								"success",
							],
							prev[1],
						]);
					} else if (Array.isArray(data) && data[0].status === 404) {
						(async () => {
							const jsonData = await data[0].json();
							if (jsonData.data === "User does not exist") {
								setErrors((prev) => [
									[
										"You need to register in our website before registering for the event",
										"error",
									],
									prev[1],
								]);
							}
						})();
					} else {
						setErrors((prev) => [
							["Failed to send OTP. Please try again.", "error"],
							prev[1],
						]);
					}
				})
				.catch(() => {
					setErrors((prev) => [
						["Network error. Please check your connection and try again.", "error"],
						prev[1],
					]);
				})
				.finally(() => {
					setSendingOtp(false);
				});
		} else {
			setErrors((prev) => [
				["Please enter a valid AHD University email address", "error"],
				prev[1],
			]);
		}
	}

	async function verifyOTP(otpFirstInput) {
		if (!otpToken) {
			setErrors((prev) => [["Please request OTP first", "error"], prev[1]]);
			return;
		}

		setVerifyingOtp(true);
		setErrors((prev) => [prev[0], ""]);

		let otp = "";
		let nextSibling = otpFirstInput;
		while (nextSibling && nextSibling.tagName === "INPUT") {
			otp += nextSibling.value;
			nextSibling = nextSibling.nextElementSibling;
		}

		if (otp.length !== 4) {
			setErrors((prev) => [prev[0], ["Please enter complete 4-digit OTP", "error"]]);
			setVerifyingOtp(false);
			return;
		}

		await fetch("/api/event-registration", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				otherData: {
					otp,
					otpToken,
				},
			}),
		})
			.then((data) => {
				if (data.status === 200) {
					setOtpCorrect(true);
					setErrors((prev) => [prev[0], ["OTP verified successfully!", "success"]]);
				} else if (data.status === 401) {
					setErrors((prev) => [prev[0], ["Invalid OTP. Please try again.", "error"]]);
				} else if (data.status === 404) {
					setErrors((prev) => [["Email not registered", "error"], prev[1]]);
				} else {
					setErrors((prev) => [
						prev[0],
						["Verification failed. Please try again.", "error"],
					]);
				}
			})
			.catch(() => {
				setErrors((prev) => [prev[0], ["Network error. Please try again.", "error"]]);
			})
			.finally(() => {
				setVerifyingOtp(false);
			});
	}
	if (loading) {
		return (
			<div className="fixed inset-0 bg-black flex items-center justify-center z-50">
				<Loader />
			</div>
		);
	}

	return (
		<>
			<style jsx>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fade-in {
					animation: fadeIn 0.5s ease-out;
				}
			`}</style>
			<div className="min-h-screen bg-gray-950 p-4 sm:p-8 flex justify-center items-start">
				{!currentEvent ? (
					<div className="flex items-center justify-center min-h-96 text-center bg-white rounded-2xl mx-4 p-8 shadow-2xl max-w-md w-full">
						<div>
							<h2 className="text-red-600 text-2xl font-bold mb-4">
								Event Not Found
							</h2>
							<p className="text-gray-600">
								The requested event could not be loaded. Please try again later.
							</p>
						</div>
					</div>
				) : (
					<div className="w-full max-w-4xl bg-neutral-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
						<div className="bg-gradient-to-r  from-blue-950 to-[#0C1224] text-white p-8 sm:p-12 text-center">
							<div className="flex flex-col sm:flex-row items-center justify-around gap-4 sm:gap-0 text-center sm:text-left">
								<img
									src="/logo1.png"
									alt="pclub-logo"
									className="w-32 sm:w-48 h-auto object-contain"
								/>
								<h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight">
									{currentEvent.title}
								</h1>
							</div>

							<div className="mt-6">
								<div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
									<span className="font-semibold mr-2">Date:</span>
									<span>
										{new Date(currentEvent.date).toLocaleString().split(",")[0]}
									</span>
								</div>
							</div>
						</div>

						{!loggedIn && !otpCorrect && (
							<div className="p-8 sm:p-12">
								<div className="text-center mb-8">
									<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
										Verify Your Identity
									</h2>
									<p className="text-gray-900 text-lg">
										Please verify your Ahmedabad University email to register
										for this event
									</p>
								</div>

								<form
									className="max-w-lg mx-auto space-y-8"
									onSubmit={(e) => e.preventDefault()}
								>
									<div className="space-y-4">
										<label
											htmlFor="email"
											className="block text-md font-semibold text-gray-800 mb-3"
										>
											University Email Address
										</label>
										<div className="relative">
											<input
												type="email"
												name="email"
												id="email"
												className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all duration-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
												placeholder="your.name@ahduni.edu.in"
												ref={emailInputRef}
												disabled={sendingOtp}
												onKeyDown={(e) => {
													if (e.isTrusted && e.key === "Enter") {
														e.preventDefault();
														sendOtpButtonRef.current?.focus();
														sendOtpButtonRef.current?.click();
													}
												}}
											/>
										</div>
										{errors[0] && errors[0][0] && (
											<div
												className={`mt-3 p-3 rounded-lg text-sm font-medium ${
													errors[0][1] === "success"
														? "bg-green-50 text-green-800 border border-green-200"
														: "bg-red-50 text-red-800 border border-red-200"
												}`}
											>
												{errors[0][0]}
											</div>
										)}
										<button
											type="button"
											className="w-full bg-gradient-to-r from-cyan-950 to-cyan-800 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center min-h-[56px]"
											disabled={sendingOtp}
											onClick={() => {
												const email = emailInputRef.current?.value;
												if (email) sendOTP(email);
											}}
											ref={sendOtpButtonRef}
										>
											{sendingOtp ? (
												<>
													<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
													Sending OTP...
												</>
											) : (
												"Send OTP"
											)}
										</button>
									</div>

									{otpToken && (
										<div className="space-y-4 animate-fade-in">
											<label
												htmlFor="otp"
												className="block text-sm font-semibold text-gray-800 mb-3"
											>
												Enter Verification Code
											</label>
											<div className="flex justify-center gap-3 sm:gap-4 mb-4">
												<OTPInput
													name="otp"
													id="otp"
													inputRef={otpInputRef}
													disabled={verifyingOtp}
												/>
												<OTPInput disabled={verifyingOtp} />
												<OTPInput disabled={verifyingOtp} />
												<OTPInput disabled={verifyingOtp} />
											</div>
											{errors[1] && errors[1][0] && (
												<div
													className={`mt-3 p-3 rounded-lg text-sm font-medium ${
														errors[1][1] === "success"
															? "bg-green-50 text-green-800 border border-green-200"
															: "bg-red-50 text-red-800 border border-red-200"
													}`}
												>
													{errors[1][0]}
												</div>
											)}
											<button
												type="button"
												className="w-full bg-gradient-to-r from-cyan-950 to-cyan-800 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center min-h-[56px]"
												disabled={verifyingOtp}
												onClick={() => {
													if (otpInputRef.current)
														verifyOTP(otpInputRef.current);
												}}
												ref={verifyOtpButtonRef}
											>
												{verifyingOtp ? (
													<>
														<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
														Verifying...
													</>
												) : (
													"Verify OTP"
												)}
											</button>
										</div>
									)}
								</form>
							</div>
						)}

						{(loggedIn || otpCorrect) && (
							<div className="p-8 sm:p-12 bg-gray-50">
								{currentEvent.registrationOpen ? (
									currentEvent.formLink ? (
										<div>
											<div className="text-center mb-8">
												<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
													Event Registration Form
												</h2>
												<p className="text-gray-600 text-lg">
													Please fill out the form below to complete your
													registration
												</p>
											</div>
											<div className="bg-white rounded-2xl p-4 shadow-xl">
												<iframe
													src={currentEvent.formLink}
													className="w-full h-96 sm:h-[700px] lg:h-[900px] border-0 rounded-xl"
													title="Event Registration Form"
												>
													<div className="text-center p-12">
														<p className="text-gray-600 mb-6 text-lg">
															Unable to load the registration form.
														</p>
														<a
															href={currentEvent.formLink}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-block bg-white text-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300"
														>
															Open Form in New Tab
														</a>
													</div>
												</iframe>
											</div>
										</div>
									) : (
										<div className="text-center p-12 bg-blue-50 rounded-2xl border border-blue-200">
											<h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4">
												Registration Form Coming Soon
											</h3>
											<p className="text-blue-700 text-lg">
												The registration form is not available yet. Please
												check back later.
											</p>
										</div>
									)
								) : (
									<div className="text-center p-12 bg-yellow-50 rounded-2xl border border-yellow-200">
										<h3 className="text-xl sm:text-2xl font-bold text-yellow-800 mb-4">
											Registration Closed
										</h3>
										<p className="text-yellow-700 text-lg">
											Registration for this event has been closed. Contact the
											organizers if you have any questions.
										</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
}

function OTPInput({ name, id, inputRef, disabled = false }) {
	return (
		<input
			type="text"
			maxLength={1}
			minLength={1}
			pattern="[0-9]"
			className="w-12 h-12 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:scale-105 transition-all duration-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
			ref={inputRef}
			disabled={disabled}
			onKeyDown={(e) => {
				function focusNext() {
					const next = e.target.nextElementSibling;
					if (next && next.tagName === "INPUT" && !next.disabled) {
						next.focus();
					}
				}

				function focusPrevious() {
					const prev = e.target.previousElementSibling;
					if (prev && prev.tagName === "INPUT" && !prev.disabled) {
						prev.focus();
					}
				}

				if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "Enter")
					focusNext();
				else if (e.key === "ArrowLeft" || e.key === "ArrowUp") focusPrevious();
				else if (e.key.match(/[0-9]/g)) {
					e.preventDefault();
					e.target.value = e.key;
					focusNext();
				} else if (e.key === "Backspace") {
					e.target.value = "";
					focusPrevious();
				} else if (
					e.key.length === 1 &&
					!e.key.match(/[0-9]/g) &&
					!e.ctrlKey &&
					!e.metaKey &&
					!e.altKey
				) {
					e.preventDefault();
				}
			}}
			name={name}
			id={id}
			inputMode="numeric"
		/>
	);
}

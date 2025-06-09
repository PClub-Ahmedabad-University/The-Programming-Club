"use client";

import { useEffect, useRef, useState } from "react";
import "../../../Styles/RegisterEvent.css";

export default function RegisterEvent({ params }) {
	const [loggedIn, setLoggedIn] = useState(false);
	const [currentEvent, setCurrentEvent] = useState();
	const [otpCorrect, setOtpCorrect] = useState(false);
	const [errors, setErrors] = useState(["", ""]);
	const emailInputRef = useRef();
	const otpInputRef = useRef();
	const [otpToken, setOtpToken] = useState(null);
	const sendOtpButtonRef = useRef();
	const verifyOtpButtonRef = useRef();

	useEffect(() => {
		console.log(process.env.GOOGLE_FORM_IFRAME_LINK);
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
						console.log("received response");
						if (data.status === 200) return data;
						else throw new Error(data.error);
					})
					.then((data) => data.json())
					.then((data) => setCurrentEvent(data.event))
					.catch((err) => {
						if (process.env.NODE_ENV === "development")
							console.error("Error in getting events!", err);
					}),
			]);
		})();
	}, []);

	function checkValidEmail(email) {
		if (/^(?!.*\+).{4,}@ahduni\.edu\.in$/.test(email)) return true;
		else return false;
	}

	async function sendOTP(email) {
		if (checkValidEmail(email)) {
			console.log("valid email");
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
				.then((data) => (data.status === 200 ? data.json() : null))
				.then((data) => {
					if (data && data.data) {
						setOtpToken(data.data);
						setErrors((prev) => [["OTP sent, please check", "green"], prev[1]]);
					} else {
						setErrors((prev) => [
							["Unable to send the otp, please try again", "red"],
							prev[1],
						]);
					}
				});
		} else {
			setErrors((prev) => [["Invalid Email", "red"], prev[1]]);
		}
	}

	async function verifyOTP(otpFirstInput) {
		if (!otpToken) {
			setErrors((prev) => [["Need to request OTP before verifying!", "red"], prev[1]]);
		}
		let otp = "";
		let nextSibling = otpFirstInput;
		console.log("otpFirstInput:", otpFirstInput);
		while (nextSibling && nextSibling.tagName === "INPUT") {
			console.log(nextSibling);
			otp += nextSibling.value;
			nextSibling = nextSibling.nextElementSibling;
		}
		console.log("Verifying OTP:", otp);
		const otpCorrect = await fetch("/api/event-registration", {
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
		}).then((data) => {
			if (data.status === 200) {
				setOtpCorrect(true);
			} else if (data.status === 401) {
				setErrors((prev) => [prev[0], ["Invalid OTP!", "red"]]);
			} else if (data.status === 404) {
				setErrors((prev) => [["Email not registered", "red"], prev[1]]);
			} else {
				setErrors((prev) => [prev[0], ["Unknown Error Occurred", "red"]]);
			}
		});
	}

	return (
		<div className="form-container-wrapper">
			{!currentEvent ? (
				<div className="events-loading">Loading...</div>
			) : (
				<div className="form-container">
					<h1>Event Name: {currentEvent.title}</h1>
					<p>Date: {new Date(currentEvent.date).toLocaleString().split(",")[0]}</p>
					{!loggedIn ? (
						<form className="email-otp" action="" method="">
							<div className="group">
								<div className="inner-group">
									<label htmlFor="email">Email:</label>
									<input
										type="email"
										name="email"
										id="email"
										ref={emailInputRef}
										onKeyDown={(e) => {
											if (e.isTrusted) {
												if (e.key === "Enter") {
													e.preventDefault();
													sendOtpButtonRef.current.focus();
													sendOtpButtonRef.current.click();
												}
											}
										}}
									/>
								</div>
								{errors[0][0] ? (
									<p tabIndex={0} style={{ color: errors[0][1] }}>
										{errors[0][0]}
									</p>
								) : null}
								<button
									type="button"
									onClick={(e) =>
										emailInputRef.current && emailInputRef.current.value
											? sendOTP(emailInputRef.current.value)
											: null
									}
									ref={sendOtpButtonRef}
								>
									Send OTP
								</button>
							</div>
							{otpToken ? (
								<div className="group">
									<div className="inner-group">
										<label htmlFor="otp">OTP:</label>
										<div className="otp-container">
											<OTPInput name="otp" id="otp" inputRef={otpInputRef} />
											<OTPInput />
											<OTPInput />
											<OTPInput />
										</div>
									</div>
									{errors[1][0] ? (
										<p style={{ color: errors[1][1] }}>{errors[1][0]}</p>
									) : null}
									<button
										type="button"
										onClick={(e) =>
											e.isTrusted ? verifyOTP(otpInputRef.current) : null
										}
										ref={verifyOtpButtonRef}
									>
										Verify OTP
									</button>
								</div>
							) : null}
						</form>
					) : null}
					{process.env.NEXT_PUBLIC_GOOGLE_FORM_IFRAME_LINK ? (
						loggedIn || otpCorrect ? (
							<iframe
								src={process.env.NEXT_PUBLIC_GOOGLE_FORM_IFRAME_LINK}
								width="640"
								height="900"
							>
								Loading…
							</iframe>
						) : null
					) : (
						"Google Form Link"
					)}
				</div>
			)}
		</div>
	);
}

function OTPInput({ name, id, inputRef }) {
	return (
		<input
			type="text"
			maxLength={1}
			minLength={1}
			pattern="[0-9]"
			ref={inputRef}
			onKeyDown={(e) => {
				function focusNext() {
					const next = e.target.nextElementSibling;
					if (next && next.tagName === "INPUT") {
						next.focus();
					}
				}

				function focusPrevious() {
					const prev = e.target.previousElementSibling;
					if (prev && prev.tagName === "INPUT") {
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

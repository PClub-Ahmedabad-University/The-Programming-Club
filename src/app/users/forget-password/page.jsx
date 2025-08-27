"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PasswordInput from "@/app/Components/PasswordInput";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // API call function
  const callForgotPasswordAPI = async (data) => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // Handle backend errors even if status is 200
    if (result?.error || !response.ok) {
      throw new Error(result.message || "API call failed");
    }

    return result;
  };

  // Step 1: Send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email");
    if (!email.endsWith("@ahduni.edu.in")) return setError("Please use your Ahmedabad University email");

    setIsSubmitting(true);
    setError("");

    try {
      await callForgotPasswordAPI({ email });
      setStep(2);
      setSuccess("OTP sent to your email");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Step 2: Reset password with OTP, new password, and confirm password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (otp.some((digit) => digit === "")) return setError("Please enter the 6-digit OTP");
    if (!newPassword || !confirmPassword) return setError("Please fill in all password fields");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters long");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    setIsSubmitting(true);
    setError("");

    try {
      await callForgotPasswordAPI({
        email,
        otp: otp.join(""),
        newPassword,
        confirmPassword,
      });

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/users/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!email) return;
    setIsSubmitting(true);
    setError("");

    try {
      await callForgotPasswordAPI({ email });
      setSuccess("OTP resent to your email");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render UI based on step
  const renderStep = () => {
    if (step === 1) {
      return (
        <form onSubmit={handleEmailSubmit} className="space-y-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
          <p className="text-gray-400 mb-6">Enter your email to receive a verification code</p>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#131B36] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="your.email@ahduni.edu.in"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>
          <div className="text-center mt-2">
            <Link href="/users/login" className="text-indigo-400 hover:text-indigo-300 text-sm">Back to Login</Link>
          </div>
        </form>
      );
    }

    if (step === 2) {
      return (
        <form onSubmit={handleResetPasswordSubmit} className="space-y-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400 mb-6">Enter the OTP sent to {email} and your new password</p>

          {/* OTP */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">OTP</label>
            <div className="flex justify-center space-x-3">
              {[0,1,2,3,4,5].map((index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-xl bg-[#131B36] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <PasswordInput
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#131B36] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter new password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#131B36] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Resetting Password..." : "Reset Password"}
          </button>

          <div className="text-center mt-2">
            <button type="button" onClick={() => setStep(1)} className="text-indigo-400 hover:text-indigo-300 text-sm">
              Change Email
            </button>
            <span className="mx-2 text-gray-500">|</span>
            <button type="button" onClick={handleResendOTP} disabled={isSubmitting} className="text-indigo-400 hover:text-indigo-300 text-sm">
              {isSubmitting ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </form>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center">
        <Image src="/logo1.png" alt="Logo" width={50} height={50} className="w-16 h-16 bg-indigo-600 rounded-lg" />
      </div>

      <motion.div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-[#0F172A] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-800">
          {error && <div className="mb-4 bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded">{error}</div>}
          {success && <div className="mb-4 bg-green-900/30 border border-green-700 text-green-200 px-4 py-3 rounded">{success}</div>}
          {renderStep()}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
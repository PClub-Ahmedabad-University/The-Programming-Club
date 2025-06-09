"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock function to simulate API call
  const simulateAPICall = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    if (!email.endsWith('@ahduni.edu.in')) {
      setError('Please use your Ahmedabad University email');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Simulate API call to send OTP
      await simulateAPICall();
      setStep(2);
      setSuccess('OTP sent to your email');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    
    // If all OTP digits are filled, verify
    if (newOtp.every(digit => digit !== '') && index === 5) {
      verifyOtp(newOtp.join(''));
    }
  };

  const verifyOtp = async (otpCode) => {
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Simulate OTP verification
      await simulateAPICall();
      setStep(3);
      setSuccess('OTP verified successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Simulate password reset
      await simulateAPICall();
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/users/login');
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-6 w-full max-w-md">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
              <p className="text-gray-400 mb-6">Enter your email to receive a verification code</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
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
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending OTP...' : 'Send Verification Code'}
                </button>
                
                <div className="text-center">
                  <Link href="/users/login" className="text-indigo-400 hover:text-indigo-300 text-sm">
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </form>
        );
        
      case 2:
        return (
          <div className="space-y-6 w-full max-w-md">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
              <p className="text-gray-400 mb-6">Enter the 6-digit code sent to {email}</p>
              
              <div className="space-y-6">
                <div className="flex justify-center space-x-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
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
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => verifyOtp(otp.join(''))}
                    disabled={isSubmitting || otp.some(digit => digit === '')}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify Code'}
                  </button>
                  
                  <div className="mt-4 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp(['', '', '', '', '', '']);
                      }}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      Change Email
                    </button>
                    <span className="mx-2 text-gray-500">|</span>
                    <button
                      type="button"
                      onClick={handleEmailSubmit}
                      className="text-indigo-400 hover:text-indigo-300"
                      disabled={isSubmitting}
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-6 w-full max-w-md">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
              <p className="text-gray-400 mb-6">Enter your new password below</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131B36] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
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
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                  >
                    Back to OTP Verification
                  </button>
                </div>
              </div>
            </div>
          </form>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {/* Add your logo here */}
          <Image
            src="/logo1.png"
            alt="Logo"
            width={50}
            height={50}
            className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center"
          />
        </div>
      </div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-[#0F172A] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-800">
          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-900/30 border border-green-700 text-green-200 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          {renderStep()}
        </div>

      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
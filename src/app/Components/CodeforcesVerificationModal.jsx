'use client';

import { useState, useEffect } from 'react';
import { FiX, FiExternalLink, FiRefreshCw, FiCheck, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-[60] p-4 rounded-lg shadow-lg border max-w-md ${
      type === 'error' 
        ? 'bg-red-900/90 border-red-600 text-red-100' 
        : 'bg-green-900/90 border-green-600 text-green-100'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {type === 'error' ? (
            <FiAlertTriangle className="text-red-400" size={20} />
          ) : (
            <FiCheckCircle className="text-green-400" size={20} />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 text-current hover:opacity-70 transition-opacity"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};

// Codeforces verification modal component - handles handle verification flow
export default function CodeforcesVerificationModal({ 
  isOpen, 
  onClose, 
  handle,
  onHandleChange,
  onVerificationComplete,
  onError
}) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [verificationStarted, setVerificationStarted] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setError('');
      setTimeLeft(180);
      setVerificationStarted(false);
      setToast(null);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!verificationStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationStarted, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const startVerification = async () => {
    if (!handle.trim()) {
      const errorMessage = 'Please enter your Codeforces handle';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      if (onError) onError(errorMessage);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const errorMessage = 'Session expired. Please log in again.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        if (onError) onError(errorMessage);
        return;
      }

      const response = await fetch('/api/users/verify-handle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'start',
          handle: handle.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'Failed to start verification';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        if (onError) onError(errorMessage);
        return;
      }

      setVerificationStarted(true);
      setStep(2);
      showToast('Verification process started successfully', 'success');
    } catch (error) {
      const errorMessage = error.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifySubmission = async () => {
    setIsVerifying(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Session expired. Please log in again.');
      }

      const response = await fetch('/api/users/verify-handle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action: 'verify',
          handle: handle.trim()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed. Please make sure you submitted to problem 1408A with a compilation error.');
      }

      setStep(3);
      showToast(`Handle ${data.handle} verified successfully!`, 'success');
      onVerificationComplete(data.handle);
    } catch (error) {
      const errorMessage = error.message || 'Failed to verify submission. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
          className="fixed top-4 right-4 z-[500] p-4 rounded-lg shadow-lg border max-w-md"
        />
      )}
      
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
        <div className="bg-gray-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative border border-gray-700 shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
            disabled={isLoading}
          >
            <FiX size={24} />
          </button>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Verify Codeforces Handle
              </h2>
              <p className="text-gray-400 mt-2">
                Link your Codeforces account to unlock advanced features
              </p>
            </div>

            {step === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="codeforces-handle" className="block text-sm font-medium text-gray-300 mb-3">
                      Your Codeforces Handle
                    </label>
                    <input
                      type="text"
                      id="codeforces-handle"
                      value={handle}
                      onChange={(e) => onHandleChange(e.target.value)}
                      placeholder="e.g. tourist"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex justify-start space-x-4 pt-4">
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 text-gray-300 hover:text-white transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={startVerification}
                      disabled={isLoading || !handle.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <FiRefreshCw className="animate-spin mr-2" />
                          Starting...
                        </div>
                      ) : (
                        'Start Verification'
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Why verify your handle?</h3>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start">
                      <FiCheck className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Track your contest performance</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Access personalized analytics</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Join leaderboards and competitions</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Get achievement badges</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6 rounded-xl border border-blue-500/20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      Verification Steps
                    </h3>
                    <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-mono border border-yellow-500/30">
                      Time: {formatTime(timeLeft)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                          1
                        </div>
                        <h4 className="font-medium text-white">Open Problem</h4>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        Navigate to the Codeforces problem page
                      </p>
                      <a 
                        href="https://codeforces.com/problemset/problem/1408/A" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Problem 1408A <FiExternalLink className="ml-1" size={14} />
                      </a>
                    </div>

                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                          2
                        </div>
                        <h4 className="font-medium text-white">Submit Code</h4>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        Submit any code that causes a compilation error
                      </p>
                      <div className="bg-gray-900 p-2 rounded text-xs text-gray-400 font-mono">
                        int main() {'{'}{'{'} // Extra bracket
                      </div>
                    </div>

                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                          3
                        </div>
                        <h4 className="font-medium text-white">Verify</h4>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        Click the verify button to complete the process
                      </p>
                      <button
                        onClick={verifySubmission}
                        disabled={isVerifying || timeLeft <= 0}
                        className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          isVerifying || timeLeft <= 0
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                        }`}
                      >
                        {isVerifying ? (
                          <div className="flex items-center justify-center">
                            <FiRefreshCw className="animate-spin mr-2" />
                            Verifying...
                          </div>
                        ) : (
                          timeLeft <= 0 ? 'Time Expired' : 'Verify Submission'
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h4 className="font-medium text-yellow-400 mb-2">Important Notes:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• You must be logged into your Codeforces account</li>
                      <li>• Only submissions to problem 1408A will be checked</li>
                      <li>• The submission must result in a compilation error</li>
                      <li>• Complete verification within 3 minutes</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <FiCheck className="text-green-400" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Verification Complete!</h3>
                <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                  Your Codeforces handle <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{handle}</span> has been successfully verified and linked to your account.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
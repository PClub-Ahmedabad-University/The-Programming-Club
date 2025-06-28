"use client";

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { FiX, FiExternalLink } from 'react-icons/fi';

export default function FormSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/forms/submissions', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }
        const data = await response.json();
        // console.log(data);
        const sortedData = data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setSubmissions(sortedData);
        setFilteredSubmissions(sortedData);
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching submissions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSubmissions(submissions);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = submissions.filter(
      (submission) =>
        submission.userName?.toLowerCase().includes(searchLower) ||
        submission.userEnrollmentnum?.toLowerCase().includes(searchLower) ||
        submission.userEmail?.toLowerCase().includes(searchLower) ||
        submission.title?.toLowerCase().includes(searchLower)
    );
    setFilteredSubmissions(filtered);
  }, [searchTerm, submissions]);

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'PPpp');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const openSubmissionDetails = (submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Close modal when clicking outside content
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-r-3 border-blue-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-blue-400 opacity-30"></div>
          <div className="absolute inset-2 animate-pulse rounded-full bg-blue-500/20"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-900 rounded-2xl border border-red-500/20 shadow-2xl">
          <div className="mb-4 text-red-400 text-6xl">⚠️</div>
          <div className="text-red-400 text-xl font-semibold mb-2">Oops! Something went wrong</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Form Submissions
              </h1>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
              <h2 className="text-xl font-semibold text-white mt-2">
                Click on any card to view its response
              </h2>
          </div>
          
          <div className="mb-8">
            {/* Enhanced Stats and Search Bar */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-8 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {filteredSubmissions.length}
                    </h2>
                    <p className="text-sm text-gray-400">Total Submissions</p>
                  </div>
                </div>
                
                <div className="relative w-full md:w-96">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl blur opacity-50"></div>
                  <input
                    type="text"
                    placeholder="Search by name, enrollment, email, or title..."
                    className="relative w-full px-4 py-3 pl-12 rounded-xl bg-gray-800/80 backdrop-blur-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-gray-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Content Area */}
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-block p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm mb-6">
                  <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    {searchTerm ? 'No matching submissions found' : 'No submissions yet'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Submissions will appear here when available.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubmissions.map((submission, index) => (
                  <div
                    key={index}
                    className="group relative transform transition-all duration-500 hover:-translate-y-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    
                    {/* Enhanced Card */}
                    <div 
                      className="relative bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-800 hover:border-blue-500/30 hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden cursor-pointer"
                      onClick={() => openSubmissionDetails(submission)}
                    >
                      {/* Subtle top accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-50"></div>
                      
                      <div className="flex flex-col space-y-4">
                        {/* User Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {submission.userName?.charAt(0) || 'U'}
                              </div>
                              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                {submission.userName || 'N/A'}
                              </h3>
                            </div>
                            <p className="text-md text-gray-400 ml-13 font-mono">
                              {submission.userEnrollmentnum || 'No enrollment number'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Enhanced Details */}
                        <div className="space-y-3 pt-2 border-t border-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-500 uppercase tracking-wide">Email</p>
                              <p className="text-md text-gray-300 truncate">{submission.userEmail || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-500 uppercase tracking-wide">Form Title</p>
                              <p className="text-md text-gray-300 truncate">{submission.title || 'Untitled Form'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-500 uppercase tracking-wide">Submitted At</p>
                              <p className="text-md text-gray-400">
                                {submission.submittedAt ? formatDate(submission.submittedAt) : 'Unknown date'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Details Modal */}
      {isModalOpen && selectedSubmission && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleBackdropClick}
        >
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-sm p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedSubmission.title || 'Form Submission Details'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Submitted by {selectedSubmission.userName || 'Unknown User'} • {formatDate(selectedSubmission.submittedAt)}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  User Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white">{selectedSubmission.userName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Enrollment</p>
                    <p className="text-white font-mono">{selectedSubmission.userEnrollmentnum || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{selectedSubmission.userEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedSubmission.status === 'submitted' 
                        ? 'bg-blue-100 text-blue-800' 
                        : selectedSubmission.status === 'reviewed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedSubmission.status?.charAt(0).toUpperCase() + selectedSubmission.status?.slice(1) || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Responses */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Responses
                </h3>
                
                {selectedSubmission.responses?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedSubmission.responses.map((response, idx) => (
                      <div key={idx} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                        <h4 className="font-medium text-gray-200 mb-2">
                          {response.question || `Question ${idx + 1}`}
                          {response.required && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-gray-200 whitespace-pre-wrap break-words">
                          {Array.isArray(response.answer) 
                            ? response.answer.join(', ') 
                            : response.answer?.toString() || <span className="text-gray-400">No response</span>}
                        </div>
                        {response.fieldType && (
                          <p className="mt-1 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <FiExternalLink className="w-3 h-3" />
                              {response.fieldType}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No responses available for this submission.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-sm p-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        )}
    </div>
  );
}
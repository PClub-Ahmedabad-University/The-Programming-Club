"use client";
import React from 'react';
import Link from 'next/link';

const NotAuthorised = () => {
    return (
        <div className="bg-black min-h-screen flex items-center justify-center px-4">
            <div className="text-center py-12 px-8 sm:px-12 md:px-16 bg-gray-900 text-white shadow-2xl rounded-lg max-w-md w-full border border-gray-700">
                {/* Lock Icon */}
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-red-600 rounded-full">
                    <svg 
                        className="w-8 h-8 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                        />
                    </svg>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-heading">
                    Access Denied
                </h1>
                
                <h2 className="text-xl sm:text-2xl font-semibold text-red-400 mb-6">
                    Not Authorised
                </h2>
                
                <p className="text-gray-300 text-base sm:text-lg mb-8 font-content leading-relaxed">
                    You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
                </p>
                
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium font-content border border-gray-600 hover:border-gray-500"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
};

export default NotAuthorised;
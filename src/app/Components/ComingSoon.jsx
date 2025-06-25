"use client";
import React from "react";
export default function ComingSoon() {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-pink-600/20 to-orange-600/20 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-600/10 to-purple-600/10 blur-3xl animate-pulse delay-500"></div>
        </div>
  
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo/Brand */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 mb-8 shadow-2xl shadow-purple-500/25">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
  
          {/* Main heading */}
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
            Coming Soon
          </h1>
  
          {/* Main message */}
          <div className="mb-12">
            <p className="font-content text-xl sm:text-2xl md:text-3xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
              This page will be available soon
            </p>
            
            <p className="font-content text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We’re holding this back—for now. The page will unlock soon. Thanks for waiting with us.
            </p>
          </div>
  
          {/* Decorative elements */}
          <div className="flex justify-center items-center space-x-4 mb-12">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300"></div>
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse delay-700"></div>
          </div>
  
          {/* Status indicator */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-3 animate-pulse"></div>
            <span className="font-content text-gray-300 text-sm sm:text-base">
              Development in Progress
            </span>
          </div>
        </div>
  
        {/* Bottom decorative line */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
      </div>
    );
  }
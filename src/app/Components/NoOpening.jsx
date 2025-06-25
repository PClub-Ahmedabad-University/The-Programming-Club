import React from 'react';
import { Briefcase, Clock, Bell } from 'lucide-react';

const NoOpening = () => {
    return (
        <div className="font-content min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-900/20 to-cyan-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-slate-800/10 to-gray-800/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-gray-500/30 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            <div className="text-center relative z-10 max-w-md mx-auto px-6">
                {/* Icon container with animated border */}
                <div className="relative mb-8 inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-full p-6 shadow-2xl">
                        <div className="relative">
                            <Briefcase className="w-12 h-12 text-gray-400 mx-auto animate-bounce" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500/80 rounded-full animate-ping"></div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="space-y-4">
                <h2 className="font-heading text-4xl font-bold w-96 mx-auto text-white mb-2 animate-fade-in text-center">
    No Open Positions
</h2>

                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-4"></div>
                    <p className="text-gray-400 text-xl leading-relaxed animate-fade-in-delay">
                    Annual hiring only. No open positions currently — check back during our next recruitment cycle!
                    </p>
                </div>

                {/* Call to action cards */}
                <div className="mt-8 space-y-4">
                    {/* <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                <Bell className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">Get Notified</p>
                                <p className="text-gray-500 text-sm">Be the first to know about new openings</p>
                            </div>
                        </div>
                    </div> */}

                    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105">
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-500/20 p-2 rounded-lg">
                                <Clock className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="text-left text-lg">
                                <p className="text-white font-medium">Recruitment happens annually</p>
                                <p className="text-gray-500 text-md">Don’t miss your chance to apply!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtle animation hint */}
                <div className="mt-8">
                    <p className="text-gray-600 text-sm flex items-center justify-center space-x-2">
                        <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></span>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-delay {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
                .animate-fade-in-delay {
                    animation: fade-in-delay 0.8s ease-out 0.2s forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default NoOpening;
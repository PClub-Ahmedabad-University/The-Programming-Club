'use client';

import { useState, useEffect } from 'react';
import CpGymProfile from '../CpGymProfile';

export default function CodeforcesProfile({ params }) {
    const { codeforcesHandle } = params;
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch solved problems
    useEffect(() => {
        const fetchSolvedProblems = async () => {
            try {
                const response = await fetch(`/api/problem-solve/get/${codeforcesHandle}`);
                const data = await response.json();
                if (data.success) {
                    setSolvedProblems(data.data);
                }
            } catch (err) {
                console.error('Error fetching solved problems:', err);
                setError('Failed to load solved problems');
            } finally {
                setIsLoading(false);
            }
        };

        if (codeforcesHandle) {
            fetchSolvedProblems();
        }
    }, [codeforcesHandle]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-cyan-400 border-r-cyan-400"></div>
                    <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-transparent border-b-gray-600 border-l-gray-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20 text-red-400 text-lg font-medium">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white font-content">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-800/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-700/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10 p-4 md:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Main Heading */}
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-gray-300 to-cyan-400 bg-clip-text text-transparent mb-4">
                            CP-GYM Profile
                        </h1>
                        <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-gray-500 mx-auto rounded-full"></div>
                        <p className="text-gray-400 mt-4 text-lg">Competitive Programming Journey</p>
                    </div>

                    {/* CP Gym Profile Component */}
                    <div className="backdrop-blur-xl bg-gray-900/50 rounded-3xl p-1 border border-gray-800/50 shadow-2xl">
                        <div className="bg-gray-900/80 rounded-3xl p-8">
                            <CpGymProfile codeforcesHandle={codeforcesHandle} />
                        </div>
                    </div>

                    {/* Solved Problems Section */}
                    <div className="backdrop-blur-xl bg-gray-900/50 rounded-3xl p-1 border border-gray-800/50 shadow-2xl">
                        <div className="bg-gray-900/80 rounded-3xl p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                        Solved Problems
                                    </h2>
                                    <p className="text-gray-400">
                                        {solvedProblems.length} problems conquered
                                    </p>
                                </div>
                            </div>

                            {solvedProblems.length > 0 ? (
                                <div className="overflow-hidden rounded-2xl border border-gray-800/50">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-800/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                        Problem
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                        Solved At
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800">
                                                {solvedProblems.map((problem, index) => (
                                                    <tr key={problem._id || index} className="hover:bg-gray-800/50 transition-all duration-300 group">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <a href={`https://codeforces.com/problemset/problem/${problem.problemId.slice(0, 4)}/${problem.problemId.slice(4)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200 flex items-center gap-2 group-hover:scale-105 transform"
                                                            >
                                                                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                                                {problem.problemId}
                                                            </a>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 bg-gray-700/50 rounded-lg">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-sm">
                                                                    {new Date(problem.solvedAt).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {problem.submissionId && (
                                                                <a
                                                                    href={`https://codeforces.com/contest/${problem.problemId.slice(0, 4)}/submission/${problem.submissionId}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                                                                >
                                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                                                    </svg>
                                                                    View Code
                                                                </a>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="mb-6">
                                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-4">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Problems Solved Yet</h3>
                                    <p className="text-gray-400 text-lg">Start your competitive programming journey today!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
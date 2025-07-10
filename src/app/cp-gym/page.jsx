'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, TrendingUp, Code, ExternalLink, Loader2, Trophy, X, XCircle, Zap, Clock, List } from 'lucide-react';
import { getRankColor } from '@/lib/cfUtils';
import AllCFSubmissions from '@/app/cp-gym/AllCFSubmissions';
import QuestionCf from '@/app/cp-gym/QuestionCf';

const CPGymPage = () => {
    const [activeTab, setActiveTab] = useState('problems');
    const [problems, setProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [solverModal, setSolverModal] = useState({
        isOpen: false,
        problemId: null,
        solvers: [],
        isLoading: false,
        error: null
    });

    const [userProgress, setUserProgress] = useState({
        username: "",
        handle: "",
        codeforcesRank: "",
        solved: 0,
        rank: "NA"
    });
    
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                const data = await response.json();
                console.log(data);
                setUserProgress({
                    username: data.data.name,
                    handle: data.data.codeforcesHandle,
                    codeforcesRank: data.data.codeforcesRank,
                    solved: 0,
                    rank: "NA"
                });
            } catch (err) {
                console.error('Error fetching user:', err);
                setError(err.message || 'Failed to load user');
            }
            if(userProgress.handle === "") {
                return(
                    <div className="min-h-screen font-content bg-pclubBg text-white overflow-hidden relative">
                        <p>Please add your codeforces handle through profile section to access CP Gym</p>
                        <p className='text-gray-500'>Make sure you are logged in</p>
                        <p className='text-gray-500'>Click on top right profile icon and add your codeforces handle</p>
                    </div>
                );
            }
        };
        fetchUser();
    }, []);

    // Check problem status using get-verdict API
    const checkProblemStatus = async (problemId, codeforcesHandle) => {
        try {
            // Format problem ID for API (remove hyphen if present)
            const formattedProblemId = problemId.includes('-') ? problemId.replace('-', '') : problemId;
            
            const response = await fetch(
                `/api/problem-solve/get-verdict?problemId=${encodeURIComponent(formattedProblemId)}&codeforcesHandle=${encodeURIComponent(codeforcesHandle)}`
            );

            if (response.status === 404) {
                return { isSolved: false };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to check problem status');
            }

            const data = await response.json();
            return {
                isSolved: data && data.verdict === 'OK',
                solvedAt: data?.solvedAt,
                submissionId: data?.submissionId
            };
        } catch (error) {
            console.error('Error checking problem status:', error);
            return { isSolved: false };
        }
    };

    // Auto-verify problem statuses when problems or handle changes
    useEffect(() => {
        const verifyProblemStatuses = async () => {
            if (!userProgress.handle || problems.length === 0) return;

            try {
                const updatedProblems = await Promise.all(
                    problems.map(async (problem) => {
                        if (problem.status === 'solved') return problem;

                        const { isSolved, solvedAt, submissionId } = await checkProblemStatus(
                            problem.id,
                            userProgress.handle
                        );

                        if (isSolved) {
                            return {
                                ...problem,
                                status: 'solved',
                                solvedAt: solvedAt,
                                submissionId: submissionId
                            };
                        }
                        return problem;
                    })
                );

                // Update state only if there are changes
                const solvedCount = updatedProblems.filter(p => p.status === 'solved').length;
                if (solvedCount !== userProgress.solved) {
                    setProblems(updatedProblems);
                    setUserProgress(prev => ({
                        ...prev,
                        solved: solvedCount
                    }));
                }
            } catch (error) {
                console.error('Error verifying problem statuses:', error);
            }
        };

        // Initial verification
        verifyProblemStatuses();

        // Set up interval for periodic verification (every 30 seconds)
        const intervalId = setInterval(verifyProblemStatuses, 30000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [problems, userProgress.handle]);

    // Open solver details modal
    const openSolverModal = async (problemId) => {
        try {
            setSolverModal(prev => ({
                ...prev,
                isOpen: true,
                problemId,
                isLoading: true,
                error: null
            }));

            // Fetch solver details
            const formattedProblemId = problemId.includes('-') ? problemId.replace('-', '') : problemId;
            const response = await fetch(`/api/problem-solve/get-solved-by/${formattedProblemId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch solver details');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to load solver details');
            }

            // Fetch Codeforces rank information for each solver
            const solversWithRank = await Promise.all(
                data.submissions.map(async (solver) => {
                    try {
                        const rankResponse = await fetch(
                            `https://codeforces.com/api/user.info?handles=${encodeURIComponent(solver.codeforcesHandle)}`
                        );
                        
                        if (rankResponse.ok) {
                            const rankData = await rankResponse.json();
                            if (rankData.status === 'OK' && rankData.result.length > 0) {
                                return {
                                    ...solver,
                                    rank: rankData.result[0].rank || 'unrated',
                                    maxRank: rankData.result[0].maxRank || 'unrated'
                                };
                            }
                        }
                        return { ...solver, rank: 'unrated', maxRank: 'unrated' };
                    } catch (error) {
                        console.error(`Error fetching rank for ${solver.codeforcesHandle}:`, error);
                        return { ...solver, rank: 'unrated', maxRank: 'unrated' };
                    }
                })
            );

            setSolverModal(prev => ({
                ...prev,
                solvers: solversWithRank,
                isLoading: false
            }));
        } catch (error) {
            console.error('Error fetching solver details:', error);
            setSolverModal(prev => ({
                ...prev,
                error: error.message,
                isLoading: false
            }));
        }
    };

    // Handle body scroll when modal is open/closed
    useEffect(() => {
        if (solverModal.isOpen) {
            // Get the current scroll position
            const scrollY = window.scrollY;
            // Apply styles to lock the body
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflowY = 'scroll';
            
            // Store the scroll position to restore later
            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                document.body.style.overflowY = '';
                // Restore the scroll position
                window.scrollTo(0, scrollY);
            };
        }
    }, [solverModal.isOpen]);

    // Close solver details modal
    const closeSolverModal = () => {
        setSolverModal({
            isOpen: false,
            problemId: null,
            solvers: [],
            isLoading: false,
            error: null
        });
    };

    // Format date to readable format
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleString('en-US', options);
    };

    // Get Codeforces submission URL
    const getSubmissionUrl = (submission) => {
        const contestId = submission.problemId.match(/^\d+/)?.[0];
        if (!contestId) return '#';
        return `https://codeforces.com/contest/${contestId}/submission/${submission.submissionId}`;
    };

    // Fetch solved counts for all problems
    const fetchSolvedCounts = async (problemIds) => {
        try {
    
            const uniqueProblemIds = [];
            const seen = new Set();
    
            problemIds.forEach(id => {
                const withoutHyphen = id.includes('-') ? id.replace('-', '') : id;
                if (!seen.has(withoutHyphen)) {
                    seen.add(withoutHyphen);
                    uniqueProblemIds.push(withoutHyphen);
                }
            });

            const counts = await Promise.all(
                uniqueProblemIds.map(async (problemId) => {
                    try {
                        const response = await fetch(`/api/problem-solve/get-solved-by/${problemId}`);
                        
                        if (!response.ok) {
                            console.error(`Failed to fetch solved count for problem ${problemId}`);
                            return { problemId, count: 0 };
                        }
                        
                        const data = await response.json();
                        if (!data.success) {
                            console.error(`API error for problem ${problemId}:`, data.error);
                            return { problemId, count: 0 };
                        }

                        return {
                            problemId,
                            count: Array.isArray(data.submissions) ? data.submissions.length : 0
                        };
                    } catch (error) {
                        console.error(`Error fetching solved count for problem ${problemId}:`, error);
                        return { problemId, count: 0 };
                    }
                })
            );
            
            const countMap = {};
            
            counts.forEach(({ problemId, count }) => {
                countMap[problemId] = count;
                
                if (!problemId.includes('-') && problemId.length > 1) {
                    const hyphenated = `${problemId.slice(0, -1)}-${problemId.slice(-1)}`;
                    countMap[hyphenated] = count;
                }
            });
            
            return countMap;
        } catch (error) {
            console.error('Error in fetchSolvedCounts:', error);
            return {};
        }
    };

    // Fetch problems from the server
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/cp/post-problem');

                if (!response.ok) {
                    throw new Error('Failed to fetch problems');
                }

                const data = await response.json();
                if (data.success && data.problems) {
                    // Map the API response to match the expected format
                    const formattedProblems = data.problems.map(problem => {
                        // Convert UTC date to Indian time
                        const postedDate = new Date(problem.postedAt);
                        const options = { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Kolkata'
                        };
                        const indianTime = postedDate.toLocaleString('en-IN', options);
                        
                        return {
                            ...problem,
                            id: problem.problemId,
                            title: problem.title,
                            status: problem.status || 'unsolved',
                            link: problem.link,
                            postedAt: indianTime,
                            solvedBy: 0 // Initialize solvedBy count
                        };
                    });

                    setProblems(formattedProblems);
                    
                    // Initial solved count (will be updated by the verification effect)
                    const initialSolved = formattedProblems.filter(p => p.status === 'solved').length;
                    setUserProgress(prev => ({
                        ...prev,
                        solved: initialSolved,
                        total: formattedProblems.length
                    }));

                    // Fetch and update solved counts for all problems
                    const problemIds = formattedProblems.map(p => p.id);
                    const counts = await fetchSolvedCounts(problemIds);
                    
                    // Update problems with solved counts
                    setProblems(prevProblems => 
                        prevProblems.map(problem => ({
                            ...problem,
                            solvedBy: counts[problem.id] || 0
                        }))
                    );
                }
            } catch (err) {
                console.error('Error fetching problems:', err);
                setError(err.message || 'Failed to load problems');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProblems();
    }, []);

    const [isVerifying, setIsVerifying] = useState({});

    // Convert problem ID from format "2119-B" to "2119B"
    const formatProblemIdForApi = (problemId) => {
        // If the problemId is in format "2119-B", convert to "2119B"
        if (problemId.includes('-')) {
            return problemId.replace('-', '');
        }
        return problemId;
    };

    const checkForAcceptedSubmission = async (problemId, codeforcesHandle) => {
        try {
            // Format the problem ID for the API
            const formattedProblemId = formatProblemIdForApi(problemId);
            
            const response = await fetch(`/api/problem-solve/get-verdict?problemId=${encodeURIComponent(formattedProblemId)}&codeforcesHandle=${encodeURIComponent(codeforcesHandle)}`);
            
            // If we get a 404, it means no accepted submission was found
            if (response.status === 404) {
                return { isSolved: false };
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to check submission status');
            }
            
            const data = await response.json();
            
            // If we have a submission with verdict OK
            if (data && data.verdict === 'OK') {
                return {
                    isSolved: true,
                    solvedAt: data.solvedAt,
                    submissionId: data.submissionId
                };
            }
            
            return { isSolved: false };
        } catch (error) {
            console.error('Error checking submission status:', error);
            throw error;
        }
    };

    const handleVerify = async (problemId) => {
        try {
            setIsVerifying(prev => ({ ...prev, [problemId]: true }));
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please log in to verify your submission');
            }

            // Get the problem to get the postedAt time and link
            const problem = problems.find(p => p.id === problemId);
            if (!problem) {
                throw new Error('Problem not found');
            }
            
            // Get the current user's data
            const userResponse = await fetch('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!userResponse.ok) {
                throw new Error('Failed to fetch user data');
            }
            
            const userData = await userResponse.json();
            const userId = userData.data._id;
            const codeforcesHandle = userData.data.codeforcesHandle;
            
            if (!userId || !codeforcesHandle) {
                throw new Error('User ID or Codeforces handle not found');
            }

            // First, check if there's already an accepted submission
            const submissionCheck = await checkForAcceptedSubmission(problemId, codeforcesHandle);
            if (submissionCheck.isSolved) {
                // Problem already solved
                const wasAlreadySolved = problem.status === 'solved';
                
                setProblems(prev => 
                    prev.map(p => 
                        p.id === problemId ? { 
                            ...p, 
                            status: 'solved',
                            solvedAt: submissionCheck.solvedAt,
                            submissionId: submissionCheck.submissionId
                        } : p
                    )
                );
                
                // Update solved count if it wasn't already marked as solved
                if (!wasAlreadySolved) {
                    setUserProgress(prev => ({
                        ...prev,
                        solved: prev.solved + 1
                    }));
                }
                
                if (!wasAlreadySolved) {
                    // Show success message with submission details
                    const solvedDate = new Date(submissionCheck.solvedAt).toLocaleString();
                    alert(`You've already solved this problem on ${solvedDate}.`);
                }
                return;
            }
            
            // Format the problem ID for the API (remove hyphen if present)
            const formattedProblemId = formatProblemIdForApi(problemId);
            
            // If no accepted submission found, check for new submissions
            const response = await fetch('/api/problem-solve/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    problemId: formattedProblemId,
                    userId,
                    codeforcesHandle,
                    postedAt: new Date(problem.postedAt).toISOString()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify submission');
            }

            // After processing submissions, check again for accepted solution
            const finalCheck = await checkForAcceptedSubmission(problemId, codeforcesHandle);
            
            if (finalCheck.isSolved) {
                // Update problem status in local state
                setProblems(prev => 
                    prev.map(p => 
                        p.id === problemId ? { 
                            ...p, 
                            status: 'solved',
                            solvedAt: finalCheck.solvedAt,
                            submissionId: finalCheck.submissionId
                        } : p
                    )
                );
                
                // Update solved count if it wasn't already marked as solved
                if (problem.status !== 'solved') {
                    setUserProgress(prev => ({
                        ...prev,
                        solved: prev.solved + 1
                    }));
                }

                // Show success message with submission details
                const solvedDate = new Date(finalCheck.solvedAt).toLocaleString();
                alert(`✅ Problem solved! Your submission was accepted on ${solvedDate}.`);
            } else {
                // Show helpful error message
                alert(`❌ No accepted submission found yet. Please make sure you've submitted a correct solution on Codeforces and try again.`);
            }
        } catch (err) {
            console.error('Error verifying problem:', err);
            alert(err.message || 'Failed to verify submission');
        } finally {
            setIsVerifying(prev => ({ ...prev, [problemId]: false }));
        }
    };

    return (
        <div className="min-h-screen font-content bg-pclubBg text-white overflow-hidden relative">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 bg-pclubBg"></div>
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-900/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

                {/* Floating particles */}
                <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400/60 rounded-full animate-ping"></div>
                <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/60 rounded-full animate-ping delay-300"></div>
                <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-ping delay-700"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 sm:mb-8"
                >
                    <section className="relative pt-6 sm:pt-10 pb-8 sm:pb-12 px-2 sm:px-4 md:px-8 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider relative inline-block mb-3 sm:mb-4">
                            <span className="text-white font-heading relative z-10 border-2 sm:border-3 border-blue-400 rounded-lg px-4 sm:px-8 lg:px-12 py-2 sm:py-3 lg:py-4 text-4xl sm:text-4xl md:text-5xl lg:text-6xl">
                                CP Gym
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
                        </h1>
                    </section>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                        Solve handpicked Codeforces problems, verify your solutions, and climb the leaderboard.
                    </p>
                <p className="bg-gray-600 px-6 my-5 backdrop-blur-xl rounded-3xl border border-gray-800/30 p-6 sticky top-8 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 text-base sm:text-md md:text-lg lg:text-xl text-gray-300 max-w-6xl mx-auto leading-relaxed">
                    To participate, navigate to the listed problems and submit your solution. Once submitted, click the <strong>"Confirm Submission"</strong> button. If your solution is accepted, the problem will be marked as solved and reflected on the leaderboard.<br/><br/>
                    <em>Note:</em> If you have already solved the problem before it was posted here, you&apos;ll need to resubmit your solution.
                </p>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                        <span className="ml-3 text-lg text-gray-300">Loading problems...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-800/50 text-red-200 p-6 rounded-xl text-center">
                        <p className="text-lg font-medium">Failed to load problems</p>
                        <p className="text-sm mt-2 text-red-300">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-800/50 hover:bg-red-800/70 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
                        {/* Main Content Area */}
                        <div className="w-full">
                            {/* Tab Navigation */}
                            <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-gray-800/30 mb-8 overflow-hidden shadow-2xl">
                                <div className="flex">
                                    <div className="h-8 w-px bg-gray-700 my-auto" />
                                    <button
                                        onClick={() => setActiveTab('problems')}
                                        className={`flex-1 py-4 text-center text-sm font-medium transition-colors flex items-center justify-center ${activeTab === 'problems' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-800/50'}`}
                                    >
                                        <Code className="w-4 h-4 mr-2" />
                                        Problems
                                    </button>
                                    <div className="h-8 w-px bg-gray-700 my-auto" />
                                    <button
                                        onClick={() => setActiveTab('leaderboard')}
                                        className={`flex-1 py-4 text-center text-sm font-medium transition-colors flex items-center justify-center ${activeTab === 'leaderboard' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-800/50'}`}
                                    >
                                        <Trophy className="w-4 h-4 mr-2" />
                                        Leaderboard
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('all-submissions')}
                                        className={`flex-1 py-4 text-center text-sm font-medium transition-colors flex items-center justify-center ${activeTab === 'all-submissions' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-800/50'}`}
                                    >
                                        <List className="w-4 h-4 mr-2" />
                                        All Submissions
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="mt-6">
                                {activeTab === 'all-submissions' && <AllCFSubmissions />}
                                {activeTab === 'problems' && (
                                    <QuestionCf 
                                        problems={problems} 
                                        isVerifying={isVerifying} 
                                        handleVerify={handleVerify} 
                                        openSolverModal={openSolverModal} 
                                    />
                                )}

                                {activeTab === 'leaderboard' && (
                                    <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-gray-800/30 p-16 shadow-2xl">
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                                                <Award className="w-10 h-10 text-white" />
                                            </div>
                                            <h3 className="text-4xl font-bold text-white mb-4">Leaderboard</h3>
                                            <p className="text-gray-500 text-lg mb-8">Coming Soon...</p>
                                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/30">
                                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                                                <span className="text-cyan-400 font-medium">Rankings will be available soon</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Solver Details Modal */}
            <AnimatePresence>
                {solverModal.isOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
                        onClick={(e) => e.target === e.currentTarget && closeSolverModal()}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-[#1a1a1a]/90 to-[#222]/90 border border-gray-700/40 backdrop-blur-xl shadow-2xl rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/40">
                                <h3 className="text-xl font-semibold text-white">Problem Solvers</h3>
                                <button
                                    onClick={closeSolverModal}
                                    className="p-2 rounded-full hover:bg-gray-800/60 transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} className="text-gray-300" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {solverModal.isLoading ? (
                                    <div className="flex justify-center items-center h-full py-12">
                                        <Loader2 className="animate-spin h-8 w-8 text-cyan-500" />
                                    </div>
                                ) : solverModal.error ? (
                                    <div className="p-8 text-center text-red-400">
                                        <p className="mb-4">Error loading solver details: {solverModal.error}</p>
                                        <button
                                            onClick={() => openSolverModal(solverModal.problemId)}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-all"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : solverModal.solvers.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        No solvers found for this problem yet.
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-800">
                                        {solverModal.solvers.map((solver, index) => (
                                            <li
                                                key={`${solver.codeforcesHandle}-${solver.submissionId}`}
                                                className="px-6 py-4 hover:bg-gray-800/40 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-sm text-gray-500 w-6">{index + 1}.</span>
                                                        <a
                                                            href={`https://codeforces.com/profile/${solver.codeforcesHandle}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline font-semibold"
                                                            style={{ color: getRankColor(solver.rank) }}
                                                        >
                                                            {solver.codeforcesHandle}
                                                        </a>
                                                        <span className="text-xs text-gray-500">{formatDate(solver.solvedAt)}</span>
                                                    </div>
                                                    <a
                                                        href={getSubmissionUrl(solver)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-900 hover:bg-gray-700 rounded-md text-white transition-colors"
                                                    >
                                                        <Code size={14} />
                                                        View
                                                    </a>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-700/40 flex justify-end">
                                <button
                                    onClick={closeSolverModal}
                                    className="px-4 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CPGymPage;
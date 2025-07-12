"use client";

import { User, Trophy, Star, CheckCircle, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

const CpGymProfile = ({ 
    codeforcesHandle
}) => {
    const [problemSolved, setProblemSolved] = useState(0);
    const [totalProblems, setTotalProblems] = useState(0);
    const [rankLeaderboard, setRankLeaderboard] = useState('NA');
    const [rating, setRating] = useState(0);
    const [rankCodeforces, setRankCodeforces] = useState('unrated');

    useEffect(() => {
        const fetchCodeforcesData = async () => {
            try {
                const response = await fetch(`https://codeforces.com/api/user.info?handles=${codeforcesHandle}`);
                const data = await response.json();
                // console.log("Codeforces data: ",data);
                if (data.status === 'OK') {
                    setRating(data.result[0].rating);
                    setRankCodeforces(data.result[0].rank);
                }
            } catch (error) {
                console.error('Error fetching Codeforces data:', error);
            }
        };
        fetchCodeforcesData();
    }, [codeforcesHandle]);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            if (!codeforcesHandle) return;
            
            try {
                // First, fetch the entire leaderboard
                const response = await fetch('/api/leaderboard');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                
                if (result.success && Array.isArray(result.data)) {
                    // Find the user's rank in the leaderboard
                    const userEntry = result.data.find(entry => 
                        entry.codeforcesHandle.toLowerCase() === codeforcesHandle.toLowerCase()
                    );
                    
                    if (userEntry) {
                        // Rank is index + 1 (0-based to 1-based)
                        const rank = result.data.indexOf(userEntry) + 1;
                        setRankLeaderboard(rank);
                    } else {
                        console.log('User not found in leaderboard');
                        setRankLeaderboard('NA');
                    }
                } else {
                    console.log('Invalid leaderboard data format:', result);
                    setRankLeaderboard('NA');
                }
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
                setRankLeaderboard('NA');
            }
        };
        fetchLeaderboardData();
    }, [codeforcesHandle]);

    useEffect(() => {
        const fetchProblemData = async () => {
            if (!codeforcesHandle) return;
            
            try {
                // First, try to get all problems
                const [problemsRes, solvedRes] = await Promise.all([
                    fetch('/api/cp/post-problem'),
                    fetch(`/api/problem-solve/get/${codeforcesHandle}`)
                ]);

                // Handle problems response
                let total = 0;
                if (problemsRes.ok) {
                    const problemsData = await problemsRes.json();
                    // console.log("Problems data:", problemsData);
        
                        total = problemsData.problems.length;
                        setTotalProblems(total);
                    
                }

                // Handle solved problems response
                if (solvedRes.ok) {
                    const solvedData = await solvedRes.json();
                    // console.log("Solved problems data:", solvedData);
                    
                    if (solvedData.data && Array.isArray(solvedData.data)) {
                        const solvedCount = solvedData.data.length;
                        setProblemSolved(solvedCount);
                        // console.log(`Found ${solvedCount} solved problems`);
                        
                        // If we couldn't get total from /api/cp, use the solved count as minimum
                        if (total === 0) {
                            setTotalProblems(Math.max(solvedCount, 1));
                        }
                    } else {
                        console.log("No solved problems data found");
                        setProblemSolved(0);
                    }
                } else {
                    console.error(`Failed to fetch solved problems: ${solvedRes.status}`);
                    setProblemSolved(0);
                }
            } catch (error) {
                console.error('Error fetching problem data:', error);
                setProblemSolved(0);
                // Set a default total if we can't fetch it
                if (totalProblems === 0) {
                    setTotalProblems(1);
                }
            }
        };
        
        fetchProblemData();
    }, [codeforcesHandle, totalProblems]);

    const getRankColor = (rating) => {
        if (!rating) return 'text-gray-400';
        if (rating >= 2400) return 'text-red-500';
        if (rating >= 2100) return 'text-orange-500';
        if (rating >= 1900) return 'text-purple-500';
        if (rating >= 1600) return 'text-blue-500';
        if (rating >= 1400) return 'text-cyan-500';
        if (rating >= 1200) return 'text-green-500';
        return 'text-gray-400';
    };

    // Function to get rank name based on Codeforces rating
    const getRankName = (rating) => {
        if (!rating) return 'Unrated';
        if (rating >= 3000) return 'Legendary Grandmaster';
        if (rating >= 2600) return 'International Grandmaster';
        if (rating >= 2400) return 'Grandmaster';
        if (rating >= 2300) return 'International Master';
        if (rating >= 2100) return 'Master';
        if (rating >= 1900) return 'Candidate Master';
        if (rating >= 1600) return 'Expert';
        if (rating >= 1400) return 'Specialist';
        if (rating >= 1200) return 'Pupil';
        return 'Newbie';
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
                {/* User Info */}
                <div className="flex items-center space-x-4 min-w-[200px]">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <User className="w-8 h-8 text-white/90" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{codeforcesHandle || 'User'}</h3>
                        <div className={`text-sm font-medium ${getRankColor(rating)}`}>
                            {getRankName(rating)}
                        </div>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="text-gray-400 text-sm font-medium mb-1">Rating</div>
                    <div className={`text-2xl font-bold ${getRankColor(rating)}`}>
                        {rating || '—'}
                    </div>

                </div>

                {/* Problems Solved */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="text-gray-400 text-sm font-medium mb-1">Problems</div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-xl font-bold text-white">
                            {problemSolved || 0}
                            <span className="text-gray-500 text-sm font-normal">/{totalProblems || '?'}</span>
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {totalProblems ? `${Math.round((problemSolved / totalProblems) * 100)}%` : '0%'} solved
                    </div>
                </div>

                {/* Leaderboard Rank */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="text-gray-400 text-sm font-medium mb-1">Rank</div>
                    <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        <span className="text-xl font-bold text-white">
                            {rankLeaderboard !== 'NA' ? `#${rankLeaderboard}` : '—'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        in leaderboard
                    </div>
                </div>

                {/* Rank Badge */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="text-gray-400 text-sm font-medium mb-1">Current Rank</div>
                    <div className={`px-4 py-2 rounded-full ${getRankColor(rating).replace('text-', 'bg-').replace('500', '500/20')} ${getRankColor(rating)} font-medium`}>
                        {getRankName(rating).split(' ').pop()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CpGymProfile;
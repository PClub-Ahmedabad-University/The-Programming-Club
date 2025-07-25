"use client";

import { User, Trophy, Star, CheckCircle, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ActivityHeatmap = dynamic(
  () => import('react-calendar-heatmap').then((mod) => mod.default),
  { ssr: false }
);

const ActivityTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 text-white p-2 text-xs rounded border border-gray-600">
        <p>Date: {data.date}</p>
        <p>Problems: {data.count}</p>
      </div>
    );
  }
  return null;
};

const CpGymProfile = ({ codeforcesHandle }) => {
  const [problemSolved, setProblemSolved] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [rankLeaderboard, setRankLeaderboard] = useState('NA');
  const [rating, setRating] = useState(0);
  const [rankCodeforces, setRankCodeforces] = useState('unrated');
  const [city, setCity] = useState('Location Not Specified');
  const [avatar, setAvatar] = useState('https://cdn-1.webcatalog.io/catalog/codeforces/codeforces-icon-filled-256.webp?v=1714773964567');
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCodeforcesData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${codeforcesHandle}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'OK') {
          setRating(data.result[0].rating || 0);
          setRankCodeforces(data.result[0].rank || 'unrated');
          setCity(data.result[0].city || 'Not specified');
          setAvatar(data.result[0].avatar || avatar);
        }
      } catch (error) {
        console.error('Error fetching Codeforces data:', error);
        setError('Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };
    if (codeforcesHandle) {
      fetchCodeforcesData();
    }
  }, [codeforcesHandle]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!codeforcesHandle) return;
      
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          const userEntry = result.data.find(entry => 
            entry.codeforcesHandle.toLowerCase() === codeforcesHandle.toLowerCase()
          );
          
          if (userEntry) {
            const rank = result.data.indexOf(userEntry) + 1;
            setRankLeaderboard(rank);
          } else {
            setRankLeaderboard('NA');
          }
        } else {
          setRankLeaderboard('NA');
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setError('Failed to fetch leaderboard data');
      }
    };
    fetchLeaderboardData();
  }, [codeforcesHandle]);

  useEffect(() => {
    const fetchProblemData = async () => {
      if (!codeforcesHandle) return;
      
      try {
        const [problemsRes, solvedRes] = await Promise.all([
          fetch('/api/cp/post-problem'),
          fetch(`/api/problem-solve/get/${codeforcesHandle}`)
        ]);

        let total = 0;
        if (problemsRes.ok) {
          const problemsData = await problemsRes.json();
          total = problemsData.problems?.length || 0;
          setTotalProblems(total);
        }

        if (solvedRes.ok) {
          const solvedData = await solvedRes.json();
          
          const dailyCounts = {};
          if (solvedData.data && Array.isArray(solvedData.data)) {
            solvedData.data.forEach(({ solvedAt }) => {
              if (!solvedAt) return;
              const date = new Date(solvedAt).toISOString().split('T')[0];
              dailyCounts[date] = (dailyCounts[date] || 0) + 1;
            });
          }
          
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          
          const activity = [];
          const currentDate = new Date();
          
          for (let d = new Date(sixMonthsAgo); d <= currentDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            activity.push({
              date: dateStr,
              count: dailyCounts[dateStr] || 0
            });
          }
          
          setActivityData(activity);
          
          if (solvedData.data && Array.isArray(solvedData.data)) {
            const solvedCount = solvedData.data.length;
            setProblemSolved(solvedCount);
            if (total === 0) {
              setTotalProblems(Math.max(solvedCount, 1));
            }
          } else {
            setProblemSolved(0);
          }
        } else {
          setProblemSolved(0);
        }
      } catch (error) {
        console.error('Error fetching problem data:', error);
        setError('Failed to fetch problem data');
        setProblemSolved(0);
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

  if (isLoading) {
    return <div className="text-white text-center p-6">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-6">{error}</div>;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        {/* User Info */}
        <div className="flex items-center space-x-4 min-w-[200px]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Image 
              src={avatar} 
              width={64} 
              height={64} 
              alt="Avatar" 
              className="w-16 h-16 rounded-full object-cover object-center overflow-hidden"
            />
          </div>
          <div>
            <a 
              href={`https://codeforces.com/profile/${codeforcesHandle}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <h3 className={`text-2xl font-bold ${getRankColor(rating)} hover:text-blue-500 transition-colors cursor-pointer hover:underline`}>
                {codeforcesHandle || 'User'}
              </h3>
            </a>
            <p className={`text-gray-400 text-sm font-medium ${getRankColor(rating)}`}>{getRankName(rating)}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-gray-400 text-md font-medium mb-1">Rating</div>
          <div className={`text-3xl font-bold ${getRankColor(rating)}`}>
            {rating || '—'}
          </div>
        </div>

        {/* Problems Solved */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-gray-400 text-md font-medium mb-1">Problems</div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-white">
              {problemSolved || 0}
              <span className="text-gray-500 text-xl font-normal">/{totalProblems || '?'}</span>
            </span>
          </div>
          <div className="text-xl text-gray-500">
            {totalProblems ? `${Math.round((problemSolved / totalProblems) * 100)}%` : '0%'} solved
          </div>
        </div>

        {/* Leaderboard Rank */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-gray-400 text-md font-medium mb-1">Rank</div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-white">
              {rankLeaderboard !== 'NA' ? `#${rankLeaderboard}` : '—'}
            </span>
          </div>
          <div className="text-xl text-gray-500">
            in leaderboard
          </div>
        </div>

        {/* City */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-gray-400 text-md font-medium mb-1">City</div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white font-medium">{city}</span>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800 mt-10">
        <div className="overflow-x-auto">
          <div className="min-w-[100px] h-fit ">
            {activityData.length > 0 ? (
              <div className="heatmap-container">
                <ActivityHeatmap
                  startDate={new Date(new Date().setMonth(new Date().getMonth() - 6))}
                  endDate={new Date()}
                  values={activityData}
                  classForValue={(value) => {
                    if (!value || value.count === 0) {
                      return 'color-empty';
                    }
                    return `color-scale-${Math.min(4, value.count)}`;
                  }}
                  tooltipDataAttrs={(value) => ({
                    'data-tip': value?.date ? `${value.date}: ${value.count} problem${value.count !== 1 ? 's' : ''} solved` : 'No data',
                  })}
                  showWeekdayLabels={true}
                  gutterSize={2}
                  titleForValue={(value) => value ? `${value.date}: ${value.count} problem${value.count !== 1 ? 's' : ''} solved` : 'No data'}
                />
                <style jsx global>{`
                  .react-calendar-heatmap .color-empty {
                    fill: #2d3748;
                    rx: 1;
                    ry: 1;
                  }
                  .react-calendar-heatmap .color-scale-1 { fill: #0e9f6e; }
                  .react-calendar-heatmap .color-scale-2 { fill: #0a7b53; }
                  .react-calendar-heatmap .color-scale-3 { fill: #065f46; }
                  .react-calendar-heatmap .color-scale-4 { fill: #064e3b; }
                  .react-calendar-heatmap text {
                    font-size: 6px;
                    fill: #9ca3af;
                  }
                  .react-calendar-heatmap .color-empty:hover {
                    fill: #4a5568;
                  }
                `}</style>
              </div>
            ) : (
              <p className="text-gray-400">No activity data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CpGymProfile;
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Users, Shield, User } from 'lucide-react';
import { getToken } from '@/lib/auth';

const AudienceDashboard = () => {
  const [audienceData, setAudienceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('all'); // 'all', 'users', 'admins'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/audience/get',
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = await response.json();
        // console.log(data);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        setAudienceData(data);
      } catch (err) {
        setError('Failed to fetch audience data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = [...audienceData];

    if (activeView === 'users') {
      filtered = filtered.filter(person => person.role === 'user');
    } else if (activeView === 'admins') {
      filtered = filtered.filter(person => person.role === 'admin');
    } else if (activeView === 'clubMembers') {
      filtered = filtered.filter(person => person.role === 'clubMember');
    }

    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  }, [audienceData, activeView, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalUsers = audienceData.filter(person => person.role === 'user').length;
    const totalAdmins = audienceData.filter(person => person.role === 'admin').length;
    const totalClubMembers = audienceData.filter(person => person.role === 'clubMember').length;
    return { totalUsers, totalAdmins, totalClubMembers };
  }, [audienceData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading audience data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-xl mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-white">Audience Dashboard</h1>
            
            {/* Stats Panel */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Total Users: <span className="font-semibold text-white">{stats.totalUsers}</span></span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Total Admins: <span className="font-semibold text-white">{stats.totalAdmins}</span></span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Club Members: <span className="font-semibold text-white">{stats.totalClubMembers}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex space-x-2 mb-4 sm:mb-0">
            <button
              onClick={() => setActiveView('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Audience
            </button>
            <button
              onClick={() => setActiveView('users')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              <span>See Users</span>
            </button>
            <button
              onClick={() => setActiveView('clubMembers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'clubMembers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>See Club Members</span>
            </button>
            <button
              onClick={() => setActiveView('admins')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'admins'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>See Admins</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, enrollment, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
            {activeView !== 'all' && ` for ${activeView}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Audience Cards */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No audience members found</p>
            {searchTerm && (
              <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((person) => (
              <div
                key={person._id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      person.role === 'admin' 
                        ? 'bg-purple-600/20 text-purple-400' 
                        : person.role === 'clubMember'
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      {person.role === 'admin' ? (
                        <Shield className="w-5 h-5" />
                      ) : person.role === 'clubMember' ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{person.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        person.role === 'admin'
                          ? 'bg-purple-600/20 text-purple-400'
                          : person.role === 'clubMember'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-blue-600/20 text-blue-400'
                      }`}>
                        {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Enrollment Number</p>
                    <p className="text-white font-medium">{person.enrollmentNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-medium break-all">{person.email}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                    <div>
                      <p className="text-gray-400 text-sm">Registered Events</p>
                      <p className="text-white font-bold text-lg">{person.registeredEvents.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Joined</p>
                      <p className="text-white text-sm">{formatDate(person.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceDashboard;
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, Users, Shield, User, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // You might need to install 'react-hot-toast'

// A reusable card component for each user
const UserCard = ({ person, onRoleChanged }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(person.role);
  const [loading, setLoading] = useState(false);

  // All possible roles, including the new 'cp-cym-moderator'
  const AVAILABLE_ROLES = ["admin", "user", "cp-cym-moderator", "clubMember"];
  
  // This is the function that calls the backend to change the role
  const handleRoleUpdate = async () => {
    if (selectedRole === person.role) {
      setIsEditing(false); // Do nothing if role didn't change
      return;
    }

    setLoading(true);
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Properly encode the email to handle special characters
      const encodedEmail = encodeURIComponent(person.email);
      console.log('Original email:', person.email);
      console.log('Encoded email:', encodedEmail);
      
      // Make sure we're using the correct URL format
      const url = `/api/admin/assign-role/${encodedEmail}`;
      console.log('Request URL:', url);
      console.log('Request body:', { newRole: selectedRole });
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ newRole: selectedRole }),
      });

      // Log the raw response
      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update role');
      }

      // Update successful - use the response data
      toast.success(`Role updated to ${selectedRole}`);
      onRoleChanged(responseData); // Pass the updated user from the response
      setIsEditing(false);
      
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(`Error: ${error.message}`);
      setSelectedRole(person.role); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  // UI for the role badge and icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'clubMember':
        return <Users className="w-5 h-5 text-green-400" />;
      default: // For user and cp-cym-moderator
        return <User className="w-5 h-5 text-blue-400" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-600/20 text-purple-400';
      case 'clubMember':
        return 'bg-green-600/20 text-green-400';
      case 'cp-cym-moderator':
        return 'bg-yellow-600/20 text-yellow-400';
      default: // For 'user'
        return 'bg-blue-600/20 text-blue-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(person.role)}`}>
            {getRoleIcon(person.role)}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{person.name}</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(person.role)}`}>
              {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
            </span>
          </div>
        </div>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-md transition-all border border-blue-500/30"
          >
            Edit Role
          </button>
        )}
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
      </div>
      
      {isEditing ? (
        <div className="border-t border-gray-800 pt-4 mt-4">
          <div className="flex items-center mb-3">
            <label htmlFor={`role-${person._id || person.email}`} className="text-gray-400 text-sm mr-2">
              Role:
            </label>
            <select
              id={`role-${person._id || person.email}`}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={loading}
            >
              {AVAILABLE_ROLES.map((role) => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={handleRoleUpdate} 
              className="flex-1 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-green-400 border border-green-500/30 rounded-md transition-all flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : 'Save'}
            </button>
            <button 
              onClick={() => setIsEditing(false)} 
              className="flex-1 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-red-400 border border-red-500/30 rounded-md transition-all"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-800">
          <div>
            <p className="text-gray-400 text-sm">Registered Events</p>
            <p className="text-white font-bold text-lg">{person.registeredEvents?.length || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Joined</p>
            <p className="text-white text-sm">{formatDate(person.createdAt)}</p>
          </div>
        </div>
      )}
    </div>
  );
};


// The main page component
const RoleManagementPage = () => {
  const [audienceData, setAudienceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetches ALL users on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        // Fetches all users using the new API
        const response = await fetch('/api/users/search?query=', { // Empty query fetches all users
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch audience data');
        }

        const data = await response.json();
        setAudienceData(data);
      } catch (err) {
        setError('Failed to fetch audience data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filters the data based on search and active view
  const filteredData = useMemo(() => {
    let filtered = [...audienceData];

    // Filter by role (your new tabs)
    if (activeView !== 'all') {
      filtered = filtered.filter(person => person.role === activeView);
    }
    
    // Sort by most recently joined
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  }, [audienceData, activeView]);

  // Handles updates to a single user's role
  const handleUserRoleChange = (updatedUser) => {
    console.log('Updating user in state:', updatedUser);
    // Make sure we have a valid user object with an email
    if (!updatedUser) {
      console.error('Invalid user data received:', updatedUser);
      return;
    }
    
    // Check if the response contains a nested user object
    const userData = updatedUser.user || updatedUser;
    
    if (!userData.email) {
      console.error('User data missing email:', userData);
      return;
    }
    
    setAudienceData(prevData => {
      // Find the user by email and update their data
      const updated = prevData.map(user => {
        if (user.email === userData.email) {
          console.log('Found user to update:', user.email);
          // Merge the existing user data with the updated fields
          return { ...user, ...userData };
        }
        return user;
      });
      return updated;
    });
  };
  
  // Handles search on the main search bar
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        const response = await fetch(`/api/users/search?query=${searchTerm}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Failed to search for user.");
        }
        const data = await response.json();
        setAudienceData(data); // Set the audience data to the search results
        setActiveView('all'); // Reset active view to show all search results
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };
  
  // Renders the component
  return (
    <div className="h-full min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-white">User Role Management</h1>
            
            {/* Stats Panel - could add user stats here similar to Audience.jsx */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Total Users: <span className="font-semibold text-white">{filteredData.length}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and filter bar */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          {/* Filter buttons */}
          <div className="flex flex-wrap space-x-2 mb-4 sm:mb-0">
            <button
              onClick={() => setActiveView('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              See Admins
            </button>
            <button
              onClick={() => setActiveView('clubMember')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'clubMember' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              See Club Members
            </button>
            <button
              onClick={() => setActiveView('user')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              See Standard Users
            </button>
            <button
              onClick={() => setActiveView('cp-cym-moderator')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'cp-cym-moderator' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              See CP-CYM Moderators
            </button>
          </div>
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative my-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, enrollment, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </form>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
            {activeView !== 'all' && ` for ${activeView}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Loading and error messages */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-400">Loading audience data...</p>
          </div>
        )}
        {error && <p className="text-center py-12 text-red-400">{error}</p>}

        {/* Display user cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.length > 0 ? (
              filteredData.map((person) => (
                <UserCard
                  key={person._id}
                  person={person}
                  onRoleChanged={handleUserRoleChange}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No users found.</p>
                {searchTerm && (
                  <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagementPage;
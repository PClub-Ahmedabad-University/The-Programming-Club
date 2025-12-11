"use client";
import React, { useState, useEffect } from "react";

export default function MonitorCoCSection() {
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        totalEvents: 0
    });
    const [users, setUsers] = useState([]);
    const [clanGroups, setClanGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterClan, setFilterClan] = useState("");
    const [filterLeader, setFilterLeader] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/anti-copilot/stats");
            const data = await res.json();
            
            if (data.success) {
                setStats(data.stats);
                setUsers(data.users);
                setClanGroups(data.clanGroups || {});
                setError("");
            } else {
                setError(data.error || "Failed to fetch stats");
            }
        } catch (err) {
            setError("Failed to connect to server");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        
        // Auto-refresh every 5 seconds
        const interval = setInterval(() => {
            fetchStats();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Get unique clans and leaders for filters
    const uniqueClans = [...new Set(users.map(u => u.clan))].sort();
    const uniqueLeaders = [...new Set(users.map(u => u.leaderName))].sort();

    // Filter users based on search and filters
    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === "" || 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesClan = filterClan === "" || user.clan === filterClan;
        const matchesLeader = filterLeader === "" || user.leaderName === filterLeader;
        const matchesStatus = filterStatus === "" || user.currentStatus === filterStatus;

        return matchesSearch && matchesClan && matchesLeader && matchesStatus;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🛡️ Anti-Copilot Monitor Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Real-time monitoring of Code of Conduct compliance
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-gray-500 text-sm mb-1">Total Users</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-gray-500 text-sm mb-1">Currently Active</div>
                        <div className="text-3xl font-bold text-red-600">{stats.active}</div>
                        <div className="text-xs text-gray-400 mt-1">Anti-Copilot Enabled</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-gray-500 text-sm mb-1">Currently Inactive</div>
                        <div className="text-3xl font-bold text-green-600">{stats.inactive}</div>
                        <div className="text-xs text-gray-400 mt-1">Copilot Enabled</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-gray-500 text-sm mb-1">Total Events</div>
                        <div className="text-3xl font-bold text-purple-600">{stats.totalEvents}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search by name or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={filterClan}
                            onChange={(e) => setFilterClan(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Clans</option>
                            {uniqueClans.map(clan => (
                                <option key={clan} value={clan}>{clan}</option>
                            ))}
                        </select>
                        <select
                            value={filterLeader}
                            onChange={(e) => setFilterLeader(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Leaders</option>
                            {uniqueLeaders.map(leader => (
                                <option key={leader} value={leader}>{leader}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="enabled">Anti-Copilot Enabled (Red)</option>
                            <option value="disabled">Copilot Enabled (Green)</option>
                        </select>
                    </div>
                </div>

                {/* Clan Groups */}
                <div className="space-y-6">
                    {Object.keys(clanGroups).sort().map(clan => (
                        <div key={clan} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3">
                                <h2 className="text-xl font-bold uppercase">{clan}</h2>
                            </div>
                            
                            {Object.keys(clanGroups[clan]).sort().map(leader => {
                                const leaderUsers = clanGroups[clan][leader].filter(user => {
                                    const matchesSearch = searchTerm === "" || 
                                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        user.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesStatus = filterStatus === "" || user.currentStatus === filterStatus;
                                    const matchesClan = filterClan === "" || user.clan === filterClan;
                                    const matchesLeader = filterLeader === "" || user.leaderName === filterLeader;
                                    return matchesSearch && matchesStatus && matchesClan && matchesLeader;
                                });

                                if (leaderUsers.length === 0) return null;

                                return (
                                    <div key={leader} className="border-b border-gray-200 last:border-b-0">
                                        <div className="bg-gray-100 px-6 py-2">
                                            <h3 className="font-semibold text-gray-700">
                                                Leader: {leader} ({leaderUsers.length} members)
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Roll Number
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Last Updated
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {leaderUsers.map((user) => (
                                                        <tr key={user.machineId} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {user.name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-500">
                                                                    {user.rollNumber}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {user.currentStatus === 'enabled' ? (
                                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                        🛡️ Anti-Copilot ON
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                        ✅ Copilot ON
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(user.lastSeen)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Show message if no results after filtering */}
                {filteredUsers.length === 0 && users.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mt-4">
                        No users found matching your filters. Try adjusting your search criteria.
                    </div>
                )}

                {/* Last updated timestamp */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    Auto-refreshing every 5 seconds • Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}

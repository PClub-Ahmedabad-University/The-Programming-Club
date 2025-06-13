"use client";
import Image from 'next/image';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiExternalLink, FiUsers, FiTrendingUp, FiStar } from 'react-icons/fi';
import Loader from '@/ui-components/Loader1';
// Event status badge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    'upcoming': 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30',
    'on going': 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30',
    'completed': 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border border-purple-500/30',
  }

  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyles[status.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
      {status}
    </span>
  );
};

// Event type badge component
const EventTypeBadge = ({ type }) => {
  const typeStyles = {
    cp: 'bg-gradient-to-r from-amber-500 to-orange-500',
    dev: 'bg-gradient-to-r from-emerald-500 to-green-500',
    fun: 'bg-gradient-to-r from-pink-500 to-rose-500',
    workshop: 'bg-gradient-to-r from-indigo-500 to-purple-500',
  };

  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full text-white ${typeStyles[type.toLowerCase()] || 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
      {type.toUpperCase()}
    </span>
  );
};

// Format date to readable format
const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function UserEventsPage({ params = {} }) {
  // Unwrap the params promise
  const unwrappedParams = use(params);

  // Safely extract email with fallback
  const ParamEmail = unwrappedParams?.email || '';

  if (!ParamEmail || typeof ParamEmail !== 'string') {
    console.error('Invalid email parameter:', ParamEmail);
    return <div className="min-h-screen bg-pclubBg text-white p-8">
      <h1 className="text-2xl text-red-400 mb-4">Error</h1>
      <p>Invalid user identifier. Please try again.</p>
    </div>;
  }

  const [loading, setLoading] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [realUser, setRealUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredEvent, setHoveredEvent] = useState(null);

  // Process email
  let email;
  if (ParamEmail == "programmingclub-2027") {
    email = "programmingclub.2027@gmail.com"
  } else {
    email = ParamEmail.includes('@') ? ParamEmail : `${ParamEmail.replace(/-/g, '.')}@ahduni.edu.in`;
  }

  // Calculate stats
  const stats = {
    total: registeredEvents.length,
    upcoming: registeredEvents.filter(e => e.status?.toLowerCase() === 'upcoming').length,
    completed: registeredEvents.filter(e => e.status?.toLowerCase() === 'completed').length
  };

  // Filter options
  const filters = ['All', 'Upcoming', 'Completed', 'Ongoing'];

  // Animation variants for the container
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  // Animation variants for each item
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Filter events based on active filter
  const filteredEvents = registeredEvents.filter(event => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Ongoing') {
      return event.status?.toLowerCase() === 'on going';
    }
    return event.status?.toLowerCase() === activeFilter.toLowerCase();
  });
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : '';
      const res = await fetch(`/api/user/events/${email}`, {
        headers: {
          authorization: "Bearer " + token
        },
        method: "GET",
      });
      const data = await res.json();
      console.log(data);
      setRegisteredEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setRegisteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      setRealUser(user ? JSON.parse(user) : null);
      fetchEvents();
    }
  }, [email]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-pclubBg text-white p-8 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Fix the authentication check
  if (!realUser || (realUser.email && email !== realUser.email)) {
    return notFound();
  }
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full border border-cyan-500/20 mb-6">
              <FiStar className="mr-2 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">Your Event Journey</span>
            </div>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent leading-tight">
              Registered Events
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Discover your personalized event dashboard with insights, progress tracking, and seamless navigation
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FiTrendingUp className="text-cyan-400 text-xl" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.total}</span>
              </div>
              <h3 className="text-gray-400 text-sm uppercase tracking-wide">Total Events</h3>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FiClock className="text-emerald-400 text-xl" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.upcoming}</span>
              </div>
              <h3 className="text-gray-400 text-sm uppercase tracking-wide">Upcoming</h3>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-violet-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FiUsers className="text-violet-400 text-xl" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.completed}</span>
              </div>
              <h3 className="text-gray-400 text-sm uppercase tracking-wide">Completed</h3>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-slate-800/50 backdrop-blur-xl rounded-2xl p-2 border border-slate-700/50">
              {filters.map((filter) => (
                <motion.button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden ${activeFilter === filter
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {activeFilter === filter && (
                    <motion.span 
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"
                      style={{ zIndex: -1 }}
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25
                      }}
                    />
                  )}
                  <span className="relative z-10">{filter}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Events Display */}
          {!registeredEvents || registeredEvents.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-12 max-w-lg mx-auto border border-slate-700/50">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCalendar className="text-3xl text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">No events registered yet</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Start your journey by exploring our amazing events collection.
                </p>
                <Link href="/events" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
                  <span className="font-medium">Browse Events</span>
                  <FiExternalLink className="ml-2 text-lg" />
                </Link>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-12 max-w-lg mx-auto border border-slate-700/50">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCalendar className="text-3xl text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">No {activeFilter.toLowerCase()} events found</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Try selecting a different filter to see other events.
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="columns-1 md:columns-2 lg:columns-3 gap-6"
                >
                  {filteredEvents
                    .filter(event => event && event._id)
                    .map((event, index) => (
                      <div
                        key={`${event._id}-${event.title || ''}`}
                        className="break-inside-avoid group"
                        onMouseEnter={() => setHoveredEvent(event._id)}
                        onMouseLeave={() => setHoveredEvent(null)}
                      >
                        <div className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10`}>
                        {/* Image Section */}
                        <div className="relative overflow-hidden">
                          <div className="aspect-[4/3] relative">
                            <Image
                              src={event.imageUrl || '/default-event-image.jpg'}
                              alt={event.title || 'Event'}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Floating badges */}
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                              <StatusBadge status={event.status || 'upcoming'} />
                              <EventTypeBadge type={event.type || 'event'} />
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-300 transition-colors duration-300">
                            {event.title || 'Event Title'}
                          </h3>
                          <p className="text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                            {event.description || 'No description available'}
                          </p>

                          {/* Event Details */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-gray-400">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                                <FiCalendar className="text-cyan-400 text-sm" />
                              </div>
                              <span className="text-sm">{event.date ? formatDate(event.date) : 'Date TBD'}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center text-gray-400">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg flex items-center justify-center mr-3">
                                  <FiMapPin className="text-emerald-400 text-sm" />
                                </div>
                                <span className="text-sm">{event.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Section */}
                          <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                            <Link
                              href={`/events/${event.slug || event._id}`}
                              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300 group"
                            >
                              <span>View Details</span>
                              <FiExternalLink className="ml-2 text-sm group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${event.status?.toLowerCase() === 'completed' ? 'bg-violet-400' : 'bg-emerald-400'
                                }`}></div>
                              <span className="text-xs text-white font-medium">
                                {event.status?.toLowerCase() === 'completed' ? 'Attended' : 'Registered'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                        </div>
                      ))}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
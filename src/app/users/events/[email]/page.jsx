"use client";
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiCalendar, FiClock, FiMapPin, FiExternalLink } from 'react-icons/fi';

// Event status badge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    upcoming: 'bg-blue-500/20 text-blue-400',
    ongoing: 'bg-green-500/20 text-green-400',
    completed: 'bg-purple-500/20 text-purple-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyles[status.toLowerCase()] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
};

// Event type badge component
const EventTypeBadge = ({ type }) => {
  const typeStyles = {
    cp: 'bg-amber-500/20 text-amber-400',
    dev: 'bg-emerald-500/20 text-emerald-400',
    fun: 'bg-pink-500/20 text-pink-400',
    workshop: 'bg-indigo-500/20 text-indigo-400',
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${typeStyles[type.toLowerCase()] || 'bg-gray-500/20 text-gray-400'}`}>
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
    // Safely extract email with fallback
    const ParamEmail = params?.email || '';
    if (!ParamEmail || typeof ParamEmail !== 'string') {
        console.error('Invalid email parameter:', ParamEmail);
        return <div className="min-h-screen bg-pclubBg text-white p-8">
            <h1 className="text-2xl text-red-400 mb-4">Error</h1>
            <p>Invalid user identifier. Please try again.</p>
        </div>;
    }

    const [loading, setLoading]=useState(false);
    const email = ParamEmail.includes('@') ? ParamEmail : `${ParamEmail.replace(/-/g, '.')}@ahduni.edu.in`;
    const [registeredEvents, setRegisteredEvents]=useState([]);
    const RealUser=JSON.parse(localStorage.getItem('user'));



  // Uncomment this in production
  const fetchEvents=async()=>{
    try{
      setLoading(true);
      const res = await fetch(`/api/users/events/${email}`);
      console.log(res);
      const data = await res.json();
      setRegisteredEvents(data.events);
    }
    catch(err){
      console.log(err);
    }
    setLoading(false);    

    }
    useEffect(()=>{
      fetchEvents();
    },[]);


  if (!registeredEvents || email !== RealUser) return notFound();

  return (
    <div className="min-h-screen bg-pclubBg text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#00bec7] to-[#004457] bg-clip-text text-transparent">
            My Registered Events
          </h1>
          <p className="text-gray-400">
            {registeredEvents.length} event{registeredEvents.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {registeredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-[#0f172a] rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-medium mb-2">No events registered yet</h3>
              <p className="text-gray-400 mb-6">You haven't registered for any events yet.</p>
              <Link 
                href="/events" 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#00bec7] to-[#004457] text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Browse Events
                <FiExternalLink className="ml-2" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registeredEvents.map((event) => (
              <div 
                key={event._id} 
                className="group bg-[#0f172a]/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 hover:border-[#00bec7]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00bec7]/10"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <StatusBadge status={event.status} />
                      <EventTypeBadge type={event.type} />
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2 text-[#00bec7]" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <FiMapPin className="mr-2 text-[#00bec7]" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <Link 
                      href={`/events/${event.slug}`}
                      className="text-sm font-medium text-[#00bec7] hover:text-[#00a8b0] transition-colors flex items-center"
                    >
                      View details
                      <FiExternalLink className="ml-1" />
                    </Link>
                    <span className="text-xs text-gray-500">
                      {event.status === 'Completed' ? 'Attended' : 'Registered'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

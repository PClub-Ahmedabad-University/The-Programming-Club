"use client";
import React from 'react';
import { FaRegCalendarAlt } from "react-icons/fa";
import LoaderHome from '@/ui-components/LoaderHome';

const UpcomingEvent = () => {
  const [event, setEvent] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    try{
      fetch('/api/events/get')
      .then(res => res.json())
      .then(data => {
        // Normalize events array
        const allEvents =
          Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.events) ? data.events :
          Array.isArray(data) ? data : [];
        // Find the nearest upcoming event
        const now = new Date();
        const upcoming = allEvents
          .filter(ev => ev.status === "Upcoming" || ev.date && new Date(ev.date) >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvent(upcoming[0] || null);
      })
    } catch (error) {
      console.error('Error fetching upcoming event:', error);
      setEvent(null);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  if (loading) {
    return <div className="text-white py-10 "><LoaderHome/></div>;
  }

  if (!event && !loading) {
    return (
      <div className="upcoming-event-box lg:w-3/5 h-24 flex-col py-3 mt-10 rounded-md bg-[linear-gradient(90deg,_#026C71_0%,_#004457_100%)] shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] text-white flex items-center justify-center">
        <p className="text-lg font-semibold"> No upcoming events at the moment.<br />Stay tuned!</p>
      </div>
    );
  }

  // Format date and time
  const eventDate = new Date(event.date);
  const dateStr = eventDate.toLocaleDateString('en-GB');
  const timeStr = event.time
    ? event.time
    : eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
  return (
    <div className="upcoming-event-box lg:w-3/5 h-24 flex flex-col py-3 mt-10 rounded-md bg-[linear-gradient(90deg,_#026C71_0%,_#004457_100%)] shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)]">
      <div className="box-top w-full flex justify-between items-center text-white text-sm px-4">
        <div className="event-date flex items-center gap-3">
          <FaRegCalendarAlt color='white' size={23}/>
          <p className='date mt-1'>{dateStr}</p>
        </div>
        <p className='event-type'>Upcoming Event</p>
      </div>
      <div className="line h-[1px] w-full bg-white my-3"></div>
      <div className="event-details flex justify-between items-center px-4 text-white text-sm">
        <li>{event.title}</li>
        <p className='event-time'>{timeStr}</p>
      </div>
    </div>
  );
};

export default UpcomingEvent;
"use client";
import React from 'react';
import Event from './Event';

const UpcomingEventBox = () => {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/events/get')
      .then(res => res.json())
      .then(data => {
        // Adjust this line to match your API response shape
        const allEvents =
          Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.events) ? data.events :
          Array.isArray(data) ? data : [];
        // Filter for upcoming events, sort by date, and take the top two
        const now = new Date();
        const upcoming = allEvents
          .filter(ev => ev.status === "Upcoming" && ev.date && new Date(ev.date) >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 2);
        setEvents(upcoming);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className='px-8 md:px-16 lg:px-25 mb-3 lg:mt-5 lg:mb-20 font-inter'>
      <div className="section-name w-full text-center">
        <h1 className='font-bold text-2xl md:text-3xl lg:text-5xl text-[#00C8FF] border-[3px] border-[#008DF3] inline-block px-5 py-3 rounded-lg'>
          UPCOMING EVENTS
        </h1>
      </div>
      <div className="upcoming-events-container flex flex-col mt-15 gap-20">
        {loading ? (
          <div className="text-center text-white py-10">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-white py-10 text-2xl font-semibold">
            🎉 No upcoming events at the moment.<br />
            Stay tuned for exciting announcements!
          </div>
        ) : (
          events.map(ev => <Event key={ev._id || ev.id || ev.title} event={ev} />)
        )}
      </div>
    </section>
  );
};

export default UpcomingEventBox;
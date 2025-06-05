import React from 'react';
import Link from 'next/link';
import PastEventCard from '../Components/PastEventCard';

const PastEvents = () => {
  const events = [
    {
      id: 1,
      title: 'Junior-Senior Interaction',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.',
      date: 'March 15, 2025',
      venue: 'Auditorium Hall',
      image: '/junior-senior.png',
      closed: true,
    },
    {
      id: 2,
      title: 'Hackathon 2025',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.',
      date: 'February 20, 2025',
      venue: 'Computer Lab',
      image: '/junior-senior.png',
      closed: true,
    },
    {
      id: 3,
      title: 'Web Development Workshop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.',
      date: 'January 10, 2025',
      venue: 'Room 301',
      image: '/junior-senior.png',
      closed: true,
    },
    {
      id: 4,
      title: 'AI/ML Bootcamp',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.',
      date: 'December 5, 2024',
      venue: 'Online',
      image: '/junior-senior.png',
      closed: true,
    },
    {
      id: 5,
      title: 'Competitive Programming Contest',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.',
      date: 'November 18, 2024',
      venue: 'Computer Lab',
      image: '/junior-senior.png',
      closed: true,
    },
    {
      id: 6,
      title: 'Open Source Contribution Day',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.',
      date: 'October 22, 2024',
      venue: 'Conference Hall',
      image: '/junior-senior.png',
      closed: true,
    },
  ];

  return (
    <div className="bg-pclubBg min-h-screen text-white pt-24 pb-16">
      {/* Back Link */}
      <div className="px-6 md:px-16 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors duration-300 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </Link>
      </div>

      {/* Header */}
      <header className="text-center px-6 md:px-16 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wider relative inline-block mb-4">
          <span className="relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
            PAST EVENTS
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
        </h1>
        <h2 className="text-xl mt-10 md:text-2xl font-semibold text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            Highlights Of The Previous Events
          </span>
        </h2>
      </header>

      {/* Events Grid */}
      <main className="px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {events.map((event) => (
            <PastEventCard key={event.id} event={event} />
          ))}
        </div>
      </main>



    </div>
  );
};

export default PastEvents;

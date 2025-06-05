"use client"
import React, { useState } from 'react';
import Image from 'next/image';

const PastEventCard = ({ event }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="h-[500px] w-[360px] perspective-1000">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden border border-indigo-900/30 bg-gradient-to-br from-[#0A0F1D] to-[#131B36] flex flex-col">
          <div className="h-3/5 relative overflow-hidden">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] to-transparent opacity-50"></div>
          </div>


          <div className="p-4 flex flex-col flex-grow justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-wider uppercase">
                {event.title}
              </h3>
              <div className="flex items-center mt-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{event.date}</span>
              </div>
            </div>

            <button
              className="mt-4 w-full py-2 bg-transparent border border-indigo-500/50 text-indigo-300 rounded-md text-sm hover:bg-indigo-900/30 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setIsFlipped(true);
              }}
            >
              Know more →
            </button>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden border border-indigo-900/30 bg-gradient-to-br from-[#131B36] to-[#0A0F1D]"
          onClick={() => setIsFlipped(false)}
        >
          <div className="p-6 h-full flex flex-col overflow-auto">
            <h3 className="text-xl font-bold text-white mb-4 truncate">{event.title}</h3>

            <div className="space-y-4 text-sm overflow-auto">
              <div>
                <h4 className="text-gray-400 uppercase tracking-wider text-xs mb-1">DATE</h4>
                <p className="text-gray-300">{event.date}</p>
              </div>

              <div>
                <h4 className="text-gray-400 uppercase tracking-wider text-xs mb-1">TIME</h4>
                <p className="text-gray-300">{event.time || "3:00 P.M"}</p>
              </div>

              <div>
                <h4 className="text-gray-400 uppercase tracking-wider text-xs mb-1">VENUE</h4>
                <p className="text-gray-300">{event.venue}</p>
              </div>

              <div>
                <h4 className="text-gray-400 uppercase tracking-wider text-xs mb-1">DESCRIPTION</h4>
                <p className="text-gray-300 max-h-[180px] overflow-y-auto pr-2">{event.description}</p>
              </div>
            </div>

            <button
              className="mt-auto w-full py-2 bg-transparent border border-indigo-500/50 text-indigo-300 rounded-md text-sm hover:bg-indigo-900/30 transition-colors"
              onClick={() => setIsFlipped(false)}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastEventCard;

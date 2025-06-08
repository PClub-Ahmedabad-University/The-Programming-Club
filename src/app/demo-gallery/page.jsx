"use client";
import React, { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "@/ui-components/BentoGrid";
import Loader from "@/ui-components/Loader1";

export default function BentoGridSecondDemo() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);



  const eventNames = ["All", ...new Set(items.map(item => item.eventName.toLowerCase()))];


  const filteredItems = activeFilter === "All" 
    ? items 
    : items.filter(item => item.eventName.toLowerCase() === activeFilter.toLowerCase());

  if (loading) {
    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <Loader />
        </div>
    );
  }

  return (
    <div className="bg-gray-950 pt-14 pb-10">
      <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10">
        <h1 className="text-4xl md:text-6xl font-bold tracking-wider relative inline-block mb-4">
          <span className="text-white relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
            GALLERY
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl text-white italic font-bold tracking-wider text-center px-4 max-w-3xl mx-auto mb-4">
          Milestones in motion: the P-Club experience.
        </h2>
        
        {/* Filter Navbar */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 px-4 max-w-6xl mx-auto">
          {eventNames.map((eventName) => (
            <button
              key={eventName}
              onClick={() => setActiveFilter(eventName === "All" ? "All" : eventName)}
              className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                (activeFilter === eventName || (eventName === "All" && activeFilter === "All"))
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {eventName}
            </button>
          ))}
        </div>
      </div>

      <BentoGrid className="max-w-8xl mx-5 md:auto-rows-[20rem] pt-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, i) => {
            const className = i % 7 === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1";
            return (
              <BentoGridItem
                key={`${item.eventName}-${i}`}
                title={item.title}
                className={className}
                image={item.imageLink}
              />
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-400 py-10">
            No images found. Please check back later.
          </div>
        )}
      </BentoGrid>
    </div>
  );
}

// Commented out mock data since we're fetching from the backend

const items = [
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    eventName: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    eventName: "AI Workshop"
  },
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    eventName: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    eventName: "AI Workshop"
  },
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    eventName: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    eventName: "AI Workshop"
  },
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    eventName: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    eventName: "AI Workshop"
  },
];

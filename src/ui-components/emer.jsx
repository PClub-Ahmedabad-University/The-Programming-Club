"use client";
import React, { useState } from "react";
import { BentoGrid, BentoGridItem } from "@/ui-components/BentoGrid";

export default function BentoGridSecondDemo() {
  const [activeFilter, setActiveFilter] = useState("All");

  // Get unique event names for filters
  const eventNames = ["All", ...new Set(items.map(item => item.event || "Other"))];

  // Filter items based on active filter
  const filteredItems = activeFilter === "All" 
    ? items 
    : items.filter(item => item.event === activeFilter);

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
        {filteredItems.map((item, i) => {
          const className = i % 9 === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1";
          return (
            <BentoGridItem
              key={i}
              title={item.title}
              className={className}
              image={item.imageLink}
            />
          );
        })}
      </BentoGrid>
    </div>
  );
}

const items = [
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    event: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "Sustainable Architecture",
    imageLink: "/tie-cat.jpeg",
    event: "Green Tech"
  },
  {
    title: "Blockchain Revolution",
    imageLink: "/tie-cat.jpeg",
    event: "Crypto Week"
  },
  {
    title: "Web3 Development",
    imageLink: "/tie-cat.jpeg",
    event: "Web3 Conference"
  },
  {
    title: "Machine Learning",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    event: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "Sustainable Architecture",
    imageLink: "/tie-cat.jpeg",
    event: "Green Tech"
  },
  {
    title: "Blockchain Revolution",
    imageLink: "/tie-cat.jpeg",
    event: "Crypto Week"
  },
  {
    title: "Web3 Development",
    imageLink: "/tie-cat.jpeg",
    event: "Web3 Conference"
  },
  {
    title: "Machine Learning",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    event: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "Sustainable Architecture",
    imageLink: "/tie-cat.jpeg",
    event: "Green Tech"
  },
  {
    title: "Blockchain Revolution",
    imageLink: "/tie-cat.jpeg",
    event: "Crypto Week"
  },
  {
    title: "Web3 Development",
    imageLink: "/tie-cat.jpeg",
    event: "Web3 Conference"
  },
  {
    title: "Machine Learning",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    event: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "Sustainable Architecture",
    imageLink: "/tie-cat.jpeg",
    event: "Green Tech"
  },
  {
    title: "Blockchain Revolution",
    imageLink: "/tie-cat.jpeg",
    event: "Crypto Week"
  },
  {
    title: "Web3 Development",
    imageLink: "/tie-cat.jpeg",
    event: "Web3 Conference"
  },
  {
    title: "Machine Learning",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    event: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "Sustainable Architecture",
    imageLink: "/tie-cat.jpeg",
    event: "Green Tech"
  },
  {
    title: "Blockchain Revolution",
    imageLink: "/tie-cat.jpeg",
    event: "Crypto Week"
  },
  {
    title: "Web3 Development",
    imageLink: "/tie-cat.jpeg",
    event: "Web3 Conference"
  },
  {
    title: "Machine Learning",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    event: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "Sustainable Architecture",
    imageLink: "/tie-cat.jpeg",
    event: "Green Tech"
  },
  {
    title: "Blockchain Revolution",
    imageLink: "/tie-cat.jpeg",
    event: "Crypto Week"
  },
  {
    title: "Web3 Development",
    imageLink: "/tie-cat.jpeg",
    event: "Web3 Conference"
  },
  {
    title: "Machine Learning",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    event: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "Sustainable Architecture",
    imageLink: "/tie-cat.jpeg",
    event: "Green Tech"
  },
  {
    title: "Blockchain Revolution",
    imageLink: "/tie-cat.jpeg",
    event: "Crypto Week"
  },
  {
    title: "Web3 Development",
    imageLink: "/tie-cat.jpeg",
    event: "Web3 Conference"
  },
  {
    title: "Machine Learning",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "The Future of Energy",
    imageLink: "/tie-cat.jpeg",
    event: "Tech Summit 2023"
  },
  {
    title: "Artificial Intelligence Era",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "Sustainable Architecture",
    imageLink: "/tie-cat.jpeg",
    event: "Green Tech"
  },
  {
    title: "Blockchain Revolution",
    imageLink: "/tie-cat.jpeg",
    event: "Crypto Week"
  },
  {
    title: "Web3 Development",
    imageLink: "/tie-cat.jpeg",
    event: "Web3 Conference"
  },
  {
    title: "Machine Learning",
    imageLink: "/tie-cat.jpeg",
    event: "AI Workshop"
  },
  {
    title: "Cloud Computing",
    imageLink: "/tie-cat.jpeg",
    event: "Cloud Expo"
  }
];
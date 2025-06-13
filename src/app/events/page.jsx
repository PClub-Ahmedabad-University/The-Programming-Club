"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JetBrains_Mono } from "next/font/google";
import EventCard from "../Components/EventCard";
import Loader from "@/ui-components/Loader1";
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

const eventTypes = [
  { id: "ALL", label: "All" },
  // { id: "HACKATHONS", label: "Hackathons" },
  { id: "CP", label: "CP Events" },
  { id: "DEV", label: "Dev Events" },
  { id: "FUN", label: "Fun Events" },
  { id: "COMPLETED", label: "Completed" },
];
const isEventPassed = (dateStr, timeStr) => {
  const months = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };
  const cleanDate = dateStr.replace(/(st|nd|rd|th)/, "");
  const [day, month] = cleanDate.split(" ");
  const currentYear = new Date().getFullYear();
  const date = new Date(currentYear, months[month], parseInt(day));
  if (timeStr) {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    date.setHours(hours);
    date.setMinutes(parseInt(minutes));
  }
  return date < new Date();
};

//   const eventPassed = isEventPassed(event.date, event.time);
const EventsPage = () => {
  const [selectedType, setSelectedType] = useState("ALL");
  const [visibleEvents, setVisibleEvents] = useState(4);
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/events/get");
        const json = await res.json();

        json.data = (json.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log(json.data);
        // Map API data to frontend structure
        const mappedEvents = (json.data || []).map((event) => {
          const dateObj = new Date(event.date);
          const day = dateObj.getDate();
          const month = dateObj.toLocaleString("default", { month: "long" });
          const getDaySuffix = (d) => {
            if (d > 3 && d < 21) return "th";
            switch (d % 10) {
              case 1:
                return "st";
              case 2:
                return "nd";
              case 3:
                return "rd";
              default:
                return "th";
            }
          };
          const formattedDate = `${day}${getDaySuffix(day)} ${month}`;
          // Format time to "2:00 PM"
          // event.time is assumed to be "HH:mm" or "HH:mm:ss"
          const [hourStr, minuteStr] = (event.time || "00:00").split(":");
          let hours = parseInt(hourStr, 10);
          const minutes = minuteStr.padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";
          const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
          const formattedTime = `${formattedHour}:${minutes} ${ampm}`;
          return {
            ...event,
            id: event._id,
            image: event.imageUrl,
            date: formattedDate,
            time: formattedTime,
            type: event.type || "ALL",
            status: event.status || "not-completed",
            venue: event.location,
            contact: event.contact || [],
            registrationLink: event.registrationLink || "#",
          };
        });
        setEvents(mappedEvents);
      } catch (error) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  const sortedEvents = events;
  // const sortedEvents = events.sort((a, b) => {
  //   const parseDate = (dateStr) => {
  //     const cleanDate = dateStr.replace(/(st|nd|rd|th)/, "");
  //     const [day, month] = cleanDate.split(" ");
  //     const months = {
  //       January: 0,
  //       February: 1,
  //       March: 2,
  //       April: 3,
  //       May: 4,
  //       June: 5,
  //       July: 6,
  //       August: 7,
  //       September: 8,
  //       October: 9,
  //       November: 10,
  //       December: 11,
  //     };
  //     return new Date(new Date().getFullYear(), months[month], parseInt(day));
  //   };
  //   const dateA = parseDate(a.date);
  //   const dateB = parseDate(b.date);
  //   if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
  //   const timeA = new Date(`1970/01/01 ${a.time}`);
  //   const timeB = new Date(`1970/01/01 ${b.time}`);
  //   return timeA - timeB;
  // });

  const filteredEvents = sortedEvents.filter(
    (event) => selectedType === "ALL" || event.type === selectedType
  );

  const displayedEvents =
    selectedType === "ALL"
      ? filteredEvents.slice(0, visibleEvents)
      : filteredEvents;
      
  const noEventsFound = filteredEvents.length === 0;

  const totalEvents = sortedEvents.length;
  const hasMoreEvents = selectedType === "ALL" && visibleEvents < totalEvents;

  const handleLoadMore = () => {
    setVisibleEvents((prev) => prev + 4);
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
      <section className="w-full font-content flex flex-col justify-center gap-8 sm:gap-12 md:gap-16 min-h-screen py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gray-950 text-white">
        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative inline-block"
          >
            <h1 className="text-4xl font-heading md:text-6xl font-bold tracking-wider relative inline-block mb-4">
              <span className="relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
                EVENTS
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
            </h1>
            {/* <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent" /> */}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full flex flex-col items-center gap-8 sm:gap-10 md:gap-12"
        >
          <div className="hidden sm:flex flex-wrap justify-center gap-6 bg-gray-200/20 backdrop-blur-md rounded-full p-2 max-w-full">
            {eventTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 sm:px-4 md:px-6 py-2 rounded-full text-md sm:text-lg transition-all duration-150 font-heading ${
                  selectedType === type.id
                    ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg"
                    : "text-white hover:bg-gray-300/20"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <div className="sm:hidden w-full max-w-[50%] mx-auto relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full px-4 py-2 rounded-full bg-gray-200/20 backdrop-blur-md text-white border border-white/20 focus:outline-none focus:border-blue-500 text-center ${jetbrainsMono.className}`}
            >
              {eventTypes.find((type) => type.id === selectedType)?.label}
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg overflow-hidden z-50">
                {eventTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setIsOpen(false);
                    }}
                    className={`w-full py-2 px-4 text-center text-sm ${
                      jetbrainsMono.className
                    } ${
                      selectedType === type.id
                        ? "bg-gradient-to-r from-blue-950 to-blue-800 text-white"
                        : "text-white hover:bg-gray-700"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <motion.div
            layout
            className="flex flex-col gap-6 sm:gap-8 md:gap-10 w-full items-center"
          >
            {noEventsFound ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 px-4 bg-gray-900/50 backdrop-blur-sm rounded-xl w-full max-w-2xl mx-auto"
              >
                <h3 className={`font-heading text-2xl font-bold text-white mb-4`}>
                  No Events Found
                </h3>
                <p className="text-gray-300 mb-6">
                  {selectedType === "ALL"
                    ? "There are no events scheduled at the moment. Please check back later!"
                    : `There are no ${eventTypes.find((t) => t.id === selectedType)?.label.toLowerCase()} scheduled at the moment.`}
                </p>
                {selectedType !== "ALL" && (
                  <button
                    onClick={() => setSelectedType('ALL')}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  >
                    View All Events
                  </button>
                )}
              </motion.div>
            ) : (
              <AnimatePresence>
                {displayedEvents.map((event, index) => (
                  <motion.div
                    key={event.id || event._id || index}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    layout
                    className="w-full flex justify-center px-4 sm:px-6 md:px-8"
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </motion.div>
          {hasMoreEvents && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={handleLoadMore}
              className="mt-8 px-8 py-3 border-[1px] border-white text-white rounded-full hover:bg-white/20 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
            >
              Load More Events
            </motion.button>
          )}
        </motion.div>
      </section>
    </>
  );
};

export default EventsPage;

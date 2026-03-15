"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JetBrains_Mono } from "next/font/google";
import EventCard from "../Components/EventCard";
import Loader from "@/ui-components/Loader1";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

const eventTypes = [
  { id: "ALL", label: "All" },
  { id: "CP", label: "CP Events" },
  { id: "DEV", label: "Dev Events" },
  { id: "FUN", label: "Fun Events" },
  { id: "COMPLETED", label: "Completed" },
];

const isEventPassed = (dateStr) => {
  const months = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };

  const cleanDate = dateStr.replace(/(st|nd|rd|th)/, "");
  const [day, month] = cleanDate.split(" ");
  const currentYear = new Date().getFullYear();
  const date = new Date(currentYear, months[month], parseInt(day));

  return date < new Date();
};

const EventsPage = () => {
  const { token } = useUser();
  const router = useRouter();

  const [selectedType, setSelectedType] = useState("ALL");
  const [visibleEvents, setVisibleEvents] = useState(4);
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsWithWinners, setEventsWithWinners] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const checkEventWinners = async (eventId) => {
    try {
      const res = await fetch(`/api/events/winners/get/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return false;

      const data = await res.json();
      return (data.event?.winners?.length > 0) || (data.winners?.length > 0);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/events/get", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();

        const sorted = (json.data || []).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        const mappedEvents = sorted.map((event) => {
          const dateObj = new Date(event.date);
          const day = dateObj.getDate();
          const month = dateObj.toLocaleString("default", { month: "long" });
          const year = dateObj.getFullYear();

          const getDaySuffix = (d) => {
            if (d > 3 && d < 21) return "th";
            switch (d % 10) {
              case 1: return "st";
              case 2: return "nd";
              case 3: return "rd";
              default: return "th";
            }
          };

          const formattedDate = `${day}${getDaySuffix(day)} ${month} ${year}`;

          const isCompleted =
            event.status === "Completed" || isEventPassed(formattedDate);

          return {
            ...event,
            id: event._id,
            image: event.imageUrl,
            date: formattedDate,
            venue: event.location,
            isCompleted,
            winners: event.winners || [],
          };
        });

        setEvents(mappedEvents);

        const completedEvents = mappedEvents.filter((e) => e.isCompleted);

        const winnersResults = await Promise.all(
          completedEvents.map(async (e) => ({
            eventId: e.id,
            hasWinners: await checkEventWinners(e.id),
          }))
        );

        const winnersSet = new Set(
          winnersResults.filter((r) => r.hasWinners).map((r) => r.eventId)
        );

        setEventsWithWinners(winnersSet);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token]);

  const filteredEvents = events.filter((event) => {
    if (selectedType === "ALL") return true;

    if (selectedType === "COMPLETED")
      return event.isCompleted || event.status === "Completed";

    return event.type === selectedType;
  });

  const displayedEvents =
    selectedType === "ALL"
      ? filteredEvents.slice(0, visibleEvents)
      : filteredEvents;

  const hasMoreEvents =
    selectedType === "ALL" && visibleEvents < events.length;

  const handleLoadMore = () => setVisibleEvents((prev) => prev + 4);

  const EnhancedEventCard = ({ event }) => {
    const hasWinners = eventsWithWinners.has(event.id);

    const handleWinnersClick = () => {
      if (hasWinners && event.isCompleted) {
        router.push(`/winner/${event.id}`);
      }
    };

    return (
      <EventCard
        event={{
          ...event,
          hasWinners,
          onWinnersClick: handleWinnersClick,
        }}
      />
    );
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <Loader />
        </div>
      )}

      <section className="min-h-screen py-16 px-6 bg-gray-950 text-white">

        <div className="flex justify-center mb-10">
          <h1 className="text-5xl font-heading font-bold">EVENTS</h1>
        </div>

        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          {eventTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-6 py-2 rounded-full ${
                selectedType === type.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <motion.div layout className="flex flex-col gap-8 items-center">

          <AnimatePresence>
            {displayedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full flex justify-center"
              >
                <EnhancedEventCard event={event} />
              </motion.div>
            ))}
          </AnimatePresence>

        </motion.div>

        {hasMoreEvents && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-blue-600 rounded-full"
            >
              Load More Events
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default EventsPage;
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import ShinyButton from "@/ui-components/ShinyButton";

const EventCard = ({ event }) => {
  const router = useRouter();

  const isEventPassed = (dateStr, timeStr) => {
    const months = {
      January: 0, February: 1, March: 2, April: 3, May: 4,
      June: 5, July: 6, August: 7, September: 8,
      October: 9, November: 10, December: 11,
    };
    const cleanDate = dateStr.replace(/(st|nd|rd|th)/, "");
    const [day, month] = cleanDate.split(" ");
    const date = new Date(new Date().getFullYear(), months[month], parseInt(day));
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

  const eventPassed = isEventPassed(event.date, event.time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="group flex flex-col h-[400px] sm:flex-row w-full max-w-5xl bg-pclubBg rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full sm:w-[40%] h-[240px] sm:h-auto">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 sm:rounded-l-2xl"
        />
      </div>

      {/* Content */}
      <div className="w-full sm:w-[60%] p-5 sm:p-8 flex flex-col justify-between text-white">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 sm:mb-4">{event.title}</h2>
          <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 line-clamp-3">
            {event.description}
          </p>
          <div className="flex flex-col gap-2 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-5 sm:mt-6">
          {eventPassed ? (
            <ShinyButton className="cursor-not-allowed" disabled title="Event Completed" />
          ) : event.registrationOpen ? (
            <ShinyButton
              onClick={(e) => {
                e.stopPropagation();
                window.open(event.registrationLink, "_blank");
              }}
              title="Register"
            />
          ) : (
            <ShinyButton className="cursor-not-allowed" disabled title="Registration Closed" />
          )}
          <ShinyButton
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/events/${event.id}`);
            }}
            title="Read More"
          />
        </div>
      </div>
    </motion.div>
  );
};


export default EventCard;

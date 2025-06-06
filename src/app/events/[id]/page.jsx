"use client";

import React, { useEffect ,use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { JetBrains_Mono } from "next/font/google";
import { Calendar, MapPin, Users, Clock, Info, ArrowLeft } from "lucide-react";
import { BorderBeam } from "@/ui-components/BorderBeam";
import Loader from "@/ui-components/Loader1";
import ShinyButton from "@/ui-components/ShinyButton";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

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

export default function EventPage({params}) {
  const { id } = use(params);
  const [event, setEvent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        console.log("Fetching event with ID:", id);
        setLoading(true);
        const res = await fetch(`/api/events/get/${id}`);
        if (res.ok) {
          const data = await res.json();
          const eventDate = new Date(data.event.date);

          data.event.formattedDate = eventDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          data.event.formattedTime = eventDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          setEvent(data.event);
          console.log("Fetched event data:", data.event);
        } else {
          setEvent(null);
        }
      } catch (error) {
        console.error(error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <Loader />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <h1 className={`${jetbrainsMono.className} text-4xl text-white mb-8`}>
          Event Not Found
        </h1>
        <Link
          href="/events"
          className="px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-500 text-white rounded-full hover:from-blue-800 hover:to-blue-600 transition-all duration-300"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-7xl mx-auto">
              <span
                className={`${jetbrainsMono.className} inline-block px-4 py-2 rounded-full text-sm bg-white/10 backdrop-blur-md mb-4`}
              >
                {event.type}
              </span>
              <h1
                className={`${jetbrainsMono.className} text-4xl md:text-6xl font-bold mb-4`}
              >
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm md:text-base">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {event.formattedDate}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {event.formattedTime}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 relative overflow-hidden"
            >
              <h2
                className={`${jetbrainsMono.className} text-2xl font-bold mb-4`}
              >
                About the Event
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                {event.description}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {event.more_details}
              </p>
              <BorderBeam
                size={100}
                duration={16}
                delay={0}
                colorFrom="#3b82f6"
                colorTo="#a855f7"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 relative overflow-hidden"
            >
              <h2
                className={`${jetbrainsMono.className} text-2xl font-bold mb-4`}
              >
                Rules
              </h2>
              <p className="text-gray-300 leading-relaxed">{event.rules}</p>
              <BorderBeam
                size={100}
                duration={16}
                delay={0.5}
                colorFrom="#3b82f6"
                colorTo="#a855f7"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 h-fit sticky top-4"
          >
            <h2 className={`${jetbrainsMono.className} text-xl font-bold mb-6`}>
              Event Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Capacity: {event.capacity || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>Duration: {event.duration || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-pink-400" />
                <span>Status: {event.status}</span>
              </div>
            </div>
            <div className="mt-8">
              {event.registrationOpen ? (
                <ShinyButton
                  onClick={() => {
                    window.open(event.registrationLink, "_blank");
                  }}
                  className="w-full px-24"
                  title="Register Now"
                />
              ) : (
                <ShinyButton
                  disabled
                  onClick={() => {}}
                  className="w-full px-24"
                  title="Registration Closed"
                />
              )}
              <Link
                href="/events"
                className="mt-4 w-full px-6 py-3 border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Events
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

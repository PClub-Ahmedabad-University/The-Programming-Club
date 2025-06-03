// "use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { JetBrains_Mono } from "next/font/google";
import { Calendar, MapPin, Users, Clock, Info, ArrowLeft } from "lucide-react";
import { BorderBeam } from "@/ui-components/BorderBeam";
import EventCard from "../Components/EventCard"
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

const mockEvents = [
  {
    id: 1,
    title: "Hack The Future",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    rules: "Lorem ipsum rules for hackathons apply.",
    date: "15th June",
    time: "10:00 AM",
    location: "Auditorium Hall A",
    registrationOpen: true,
    more_details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    status: "not-completed",
    image: "/junior-senior.png",
    type: "HACKATHONS",
    venue: "Auditorium Hall A",
    contact: ["contact@pclub.com"],
    registrationLink: "#",
    capacity: "100 participants",
    duration: "6 hours",
  },
  {
    id: 2,
    title: "CP Showdown 5.0",
    description:
      "Lorem ipsum dolor sit amet, competitive programming elite gathering.",
    rules: "Lorem ipsum rules for CP competitions.",
    date: "10th July",
    time: "3:30 PM",
    location: "Lab 101",
    registrationOpen: true,
    more_details: "Lorem ipsum dolor sit amet, consectetur elit.",
    status: "ongoing",
    image: "/junior-senior.png",
    type: "CP-EVENTS",
    venue: "Lab 101",
    contact: ["contact@pclub.com"],
    registrationLink: "#",
    capacity: "50 participants",
    duration: "4 hours",
  },
  {
    id: 3,
    title: "Build-A-Thon",
    description:
      "Lorem ipsum dolor sit amet, full-stack development challenge.",
    rules: "Use any stack. Lorem ipsum dolor guidelines apply.",
    date: "1st August",
    time: "12:00 PM",
    location: "Innovation Lab",
    registrationOpen: true,
    more_details: "Lorem ipsum dolor sit amet.",
    status: "not-completed",
    image: "/junior-senior.png",
    type: "DEV-EVENTS",
    venue: "Innovation Lab",
    contact: ["contact@pclub.com"],
    registrationLink: "#",
    capacity: "80 participants",
    duration: "8 hours",
  },
  {
    id: 4,
    title: "Tech Treasure Hunt",
    description: "Lorem ipsum fun and games with a twist of tech.",
    rules: "Form teams of 2-4. Follow clues. Lorem ipsum applies.",
    date: "25th June",
    time: "5:00 PM",
    location: "Main Campus Grounds",
    registrationOpen: true,
    more_details: "Fun-filled day of puzzles and logic games.",
    status: "not-completed",
    image: "/junior-senior.png",
    type: "FUN-EVENTS",
    venue: "Main Campus Grounds",
    contact: ["contact@pclub.com"],
    registrationLink: "#",
    capacity: "120 participants",
    duration: "3 hours",
  },
  {
    id: 5,
    title: "CodeCraft Finale",
    description: "Lorem ipsum finale event for previous winners.",
    rules: "Invite-only. Finalists to compete in teams.",
    date: "10th May",
    time: "2:00 PM",
    location: "Auditorium Hall B",
    registrationOpen: false,
    more_details: "Final challenge. Winner takes all.",
    status: "completed",
    image: "/junior-senior.png",
    type: "COMPLETED",
    venue: "Auditorium Hall B",
    contact: ["contact@pclub.com"],
    registrationLink: "#",
    capacity: "30 participants",
    duration: "5 hours",
  },
  {
    id: 6,
    title: "Universal Coding Expo",
    description: "Lorem ipsum global coding showcase.",
    rules: "No specific rules. Share what you built!",
    date: "20th September",
    time: "11:00 AM",
    location: "Tech Expo Center",
    registrationOpen: true,
    more_details: "Open platform for students to showcase projects.",
    status: "not-completed",
    image: "/junior-senior.png",
    type: "ALL",
    venue: "Tech Expo Center",
    contact: ["contact@pclub.com"],
    registrationLink: "#",
    capacity: "200 participants",
    duration: "7 hours",
  },
];

export default function EventPage({ params }) {
  const id = parseInt(params.id); // Corrected param access
  const event = mockEvents.find((e) => e.id === id);
  const relatedEvents = mockEvents
    .filter((e) => e.type === event?.type && e.id !== event?.id)
    .slice(0, 2);
  const exploreEvents = mockEvents
    .filter((e) => e.id !== event?.id && !isEventPassed(e.date, e.time))
    .slice(0, 2); 

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <h1 className={`${jetbrainsMono.className} text-4xl text-white mb-8`}>
          Event Not Found
        </h1>
        <Link
          href="/events"
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-full hover:from-pink-600 hover:to-blue-600 transition-all duration-300"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        <Image
          src={event.image}
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
                  {event.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.venue}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column */}
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

          {/* Right Column */}
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

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <h2
              className={`${jetbrainsMono.className} text-2xl font-bold mb-8`}
            >
              Related Events
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedEvents.map((relatedEvent) => (
                <EventCard key={relatedEvent.id} event={relatedEvent} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Also Explore These Events */}
        {exploreEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-16"
          >
            <h2
              className={`${jetbrainsMono.className} text-2xl font-bold mb-8`}
            >
              Also Explore These Events
            </h2>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exploreEvents.map((exploreEvent) => (
                <Link
                  key={exploreEvent.id}
                  href={`/events/${exploreEvent.id}`}
                  className="group bg-pclubBg flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300"
                >
                  <div className="relative w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={exploreEvent.image}
                      alt={exploreEvent.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold group-hover:underline">
                    {exploreEvent.title}
                  </h3>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

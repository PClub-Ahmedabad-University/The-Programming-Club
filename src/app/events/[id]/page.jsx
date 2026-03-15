"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { JetBrains_Mono } from "next/font/google";
import { Calendar, MapPin, Users, Clock, Info, ArrowLeft } from "lucide-react";
import { BorderBeam } from "@/ui-components/BorderBeam";
import Loader from "@/ui-components/Loader1";
import ShinyButton from "@/ui-components/ShinyButton";
import RichTextRenderer from "@/app/Components/RichTextRenderer";
import { useUser } from "@/lib/UserContext";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export default function EventPage({ params }) {
  const { id } = params;
  const { token } = useUser();

  const [event, setEvent] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/get/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          setEvent(null);
          return;
        }

        const data = await res.json();

        const eventDate = new Date(data.event.date);

        data.event.formattedDate = eventDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        setEvent(data.event);
      } catch {
        setEvent(null);
      }
    }

    async function fetchWinners() {
      try {
        const res = await fetch(`/api/events/winners/get/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          setWinners([]);
          return;
        }

        const data = await res.json();
        setWinners(data.event?.winners || []);
      } catch {
        setWinners([]);
      }
    }

    async function load() {
      setLoading(true);
      await Promise.all([fetchEvent(), fetchWinners()]);
      setLoading(false);
    }

    load();
  }, [id, token]);

  if (loading || !event) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-content bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] w-full">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-7xl mx-auto">

              <span
                className={`${jetbrainsMono.className} inline-block px-4 py-2 rounded-full text-sm bg-white/10 backdrop-blur-md mb-4`}
              >
                {event.type}
              </span>

              <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm md:text-base">
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {event.formattedDate}
                </span>

                {event.time && (
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    {event.time}
                  </span>
                )}

                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {event.location}
                </span>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">

          <div className="bg-gray-900/60 rounded-xl p-6 relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-4 text-blue-300">
              About the Event
            </h2>

            <RichTextRenderer content={event.description} />

            {event.more_details && (
              <RichTextRenderer content={event.more_details} />
            )}

            <BorderBeam size={100} duration={16} />
          </div>

          <div className="bg-gray-900/60 rounded-xl p-6 relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-4 text-blue-300">
              Rules
            </h2>

            {event.rules && (
              <RichTextRenderer content={event.rules} />
            )}

            <BorderBeam size={100} duration={16} delay={0.5} />
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="bg-gray-900/60 rounded-xl p-6 h-fit sticky top-6">

          <h2 className="text-xl font-bold mb-6 text-blue-300">
            Event Details
          </h2>

          <div className="space-y-4">

            {event.capacity && (
              <div className="flex gap-3 items-center">
                <Users size={18} className="text-blue-400" />
                Capacity: {event.capacity}
              </div>
            )}

            {event.duration && (
              <div className="flex gap-3 items-center">
                <Clock size={18} className="text-purple-400" />
                Duration: {event.duration}
              </div>
            )}

            <div className="flex gap-3 items-center">
              <Info size={18} className="text-pink-400" />
              Status: {event.status}
            </div>

          </div>

          <div className="mt-8 space-y-4">

            {event.registrationOpen ? (
              <ShinyButton
                title="Register Now"
                className="w-full"
                onClick={() => window.open(event.formLink, "_blank")}
              />
            ) : (
              <ShinyButton
                title="Registration Closed"
                className="w-full"
                disabled
              />
            )}

            <Link
              href="/events"
              className="w-full py-3 border border-white/20 rounded-full flex items-center justify-center gap-2 hover:bg-white/10"
            >
              <ArrowLeft size={16} />
              Back to Events
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}
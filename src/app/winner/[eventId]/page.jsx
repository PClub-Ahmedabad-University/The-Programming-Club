"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/lib/UserContext";
import {
  ArrowLeft,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Calendar,
  MapPin,
  Crown,
  Gift,
} from "lucide-react";
import Image from "next/image";
import { JetBrains_Mono } from "next/font/google";
import Loader from "@/ui-components/Loader1";
import { BorderBeam } from "@/ui-components/BorderBeam";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

const WinnersPage = () => {
  const { eventId } = useParams();
  const router = useRouter();
  const { token } = useUser();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [winners, setWinners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (winners.length <= 1) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentSlide((prev) =>
          prev === winners.length - 1 ? 0 : prev + 1
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [winners.length, isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  useEffect(() => {
    const fetchEventAndWinners = async () => {
      try {
        setLoading(true);

        const eventRes = await fetch(`/api/events/get/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const eventData = await eventRes.json();

        if (!eventData?.event) throw new Error("Event missing");

        setEvent(eventData.event);

        const winnersRes = await fetch(
          `/api/events/winners/get/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!winnersRes.ok) {
          setWinners([]);
        } else {
          const winnersData = await winnersRes.json();
          setWinners(
            winnersData.winners || winnersData.event?.winners || []
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId && token) fetchEventAndWinners();
  }, [eventId, token]);

  const getPrizeIcon = (size = "w-6 h-6") => (
    <Crown className={`${size} text-yellow-700`} />
  );

  const getPrizeColor = () => "from-yellow-400 to-yellow-600";

  const getPrizeTitle = () => "Champion";

  const formattedWinners = winners.map((winner, index) => ({
    ...winner,
    teamName: winner.name || "Winner",
    projectDescription: winner.description || "",
    position: index + 1,
    teamImage: winner.image || "/default-winner.png",
  }));

  const handlePrevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? winners.length - 1 : prev - 1
    );
    setIsPaused(true);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) =>
      prev === winners.length - 1 ? 0 : prev + 1
    );
    setIsPaused(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Event not found
      </div>
    );
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString();

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="relative h-[60vh] overflow-hidden">
        <Image
          src={event.imageUrl || "/default-event-banner.jpg"}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 p-6 h-full flex flex-col justify-end max-w-7xl mx-auto">

          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {event.title}
          </h1>

          <div className="flex gap-6 text-gray-300">
            <span className="flex items-center gap-2">
              <Calendar size={18} /> {formatDate(event.date)}
            </span>

            <span className="flex items-center gap-2">
              <MapPin size={18} /> {event.location}
            </span>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">

        {winners.length === 0 ? (
          <div className="text-center text-gray-400">
            No winners announced yet
          </div>
        ) : (
          <>

            {/* Carousel */}
            <div
              className="relative mb-16"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >

              <AnimatePresence mode="wait">

                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4 }}
                >

                  {formattedWinners[currentSlide] && (
                    <div className="bg-gray-900 rounded-xl p-8 flex flex-col lg:flex-row gap-10 items-center">

                      <div className="relative w-full max-w-xl aspect-video">

                        <Image
                          src={formattedWinners[currentSlide].teamImage}
                          alt={formattedWinners[currentSlide].teamName}
                          fill
                          className="object-contain"
                        />

                      </div>

                      <div>

                        <div className="mb-4 flex items-center gap-2 text-yellow-400">
                          {getPrizeIcon()}
                          {getPrizeTitle()}
                        </div>

                        <h3 className="text-3xl font-bold mb-3">
                          {formattedWinners[currentSlide].teamName}
                        </h3>

                        <p className="text-gray-300 mb-4">
                          {formattedWinners[currentSlide].projectDescription}
                        </p>

                      </div>

                    </div>
                  )}

                </motion.div>

              </AnimatePresence>

              {winners.length > 1 && (
                <>
                  <button
                    onClick={handlePrevSlide}
                    className="absolute left-2 top-1/2"
                  >
                    <ChevronLeft size={30} />
                  </button>

                  <button
                    onClick={handleNextSlide}
                    className="absolute right-2 top-1/2"
                  >
                    <ChevronRight size={30} />
                  </button>
                </>
              )}

            </div>

            {/* Winners Grid */}
            {winners.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {formattedWinners.map((winner, index) => (
                  <div
                    key={winner._id}
                    className="bg-gray-900 rounded-lg p-6 text-center cursor-pointer"
                    onClick={() => setCurrentSlide(index)}
                  >

                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                      <Image
                        src={winner.teamImage}
                        alt={winner.teamName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <h4 className="font-bold text-lg">
                      {winner.teamName}
                    </h4>

                    <p className="text-gray-400 text-sm">
                      {winner.projectDescription}
                    </p>

                  </div>
                ))}

              </div>
            )}

          </>
        )}

      </main>
    </div>
  );
};

export default WinnersPage;
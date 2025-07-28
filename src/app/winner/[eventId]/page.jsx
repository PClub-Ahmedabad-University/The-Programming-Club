"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Trophy, 
  Medal, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Star,
  Sparkles,
  Calendar,
  MapPin,
  Crown,
  Gift
} from 'lucide-react';
import Image from 'next/image';
import { JetBrains_Mono } from 'next/font/google';
import Loader from '@/ui-components/Loader1';
import { BorderBeam } from '@/ui-components/BorderBeam';

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

const WinnersPage = () => {
  const { eventId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [winners, setWinners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchEventAndWinners = async () => {
      try {
        setLoading(true);
        console.log('Fetching event with ID:', eventId);
        
        // Fetch event details
        const eventRes = await fetch(`/api/events/get/${eventId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!eventRes.ok) {
          console.error('Failed to fetch event:', await eventRes.text());
          throw new Error('Failed to fetch event');
        }
        
        const eventData = await eventRes.json();
        console.log('Event data:', eventData);
        
        if (!eventData.event) {
          throw new Error('Event data is missing in the response');
        }
        
        setEvent(eventData.event);

        // Fetch winners for the event
        console.log('Fetching winners for event:', eventId);
        const winnersRes = await fetch(`/api/events/winners/get/${eventId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!winnersRes.ok) {
          console.error('Failed to fetch winners:', await winnersRes.text());
          console.log('This might be normal if no winners are announced yet');
          setWinners([]);
        } else {
          const winnersData = await winnersRes.json();
          console.log('Winners data:', winnersData);
          setWinners(winnersData.winners || winnersData.event?.winners || []);
        }
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventAndWinners();
    }
  }, [eventId]);

  const getPrizeIcon = (size = 'w-6 h-6') => (
    <Crown className={`${size} text-yellow-400`} />
  );

  const getPrizeColor = () => 'from-yellow-400 to-yellow-600';

  const getPrizeTitle = () => 'Champion';
  
  // Transform winners data to match the expected format
  const formattedWinners = winners.map((winner, index) => ({
    ...winner,
    teamName: winner.name || 'Winner',
    projectDescription: winner.description || '',
    position: index + 1,
    teamImage: winner.image || '/default-winner.png'
  }));

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? winners.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === winners.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <Loader />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-400 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white font-content">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-3/4 w-24 h-24 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Header */}
      <header className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={event.imageUrl || '/default-event-banner.jpg'}
            alt={event.title}
            fill
            className="object-cover scale-105 hover:scale-100 transition-transform duration-700"
            priority
          />
        </div>
        
        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-gray-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-blue-900/30" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-20 h-full flex flex-col justify-end p-4 sm:p-6 md:p-12">
          <div className="max-w-7xl mx-auto w-full">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -5 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Events
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4  ">
                {/* <Sparkles className="w-6 h-6 text-yellow-400" /> */}
                <span className={`${jetbrainsMono.className} bg-yellow-700 px-4 py-2 rounded-full text-sm sm:text-base text-yellow-400 font-medium`}>
                  WINNERS ANNOUNCED
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                {event.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row gap-4 text-sm sm:text-base">
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <span>{event.location}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        {winners.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl p-12 border border-white/10 max-w-2xl mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-full flex items-center justify-center relative">
                <Trophy className="w-12 h-12 text-yellow-400" />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-full animate-ping" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">No Winners Announced Yet</h2>
              <p className="text-gray-400 leading-relaxed">
                The winners for this event haven't been announced yet. Stay tuned for the exciting results!
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Winners Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-md rounded-full px-6 py-3 border border-yellow-500/30 mb-6">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <span className={`${jetbrainsMono.className} text-lg font-bold text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text`}>
                    WINNERS
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Meet Our Winners
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Celebrating the outstanding achievements and innovative solutions from our talented participants
              </p>
            </motion.div>
            
            {/* Winners Carousel */}
            <div className="relative mb-16">
              <div className="overflow-hidden rounded-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full"
                  >
                    {formattedWinners[currentSlide] && (
                      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 md:p-12 border border-white/10 relative overflow-hidden group">
                        <BorderBeam
                          size={150}
                          duration={10}
                          delay={0}
                          colorFrom="#fbbf24"
                          colorTo="#f59e0b"
                        />
                        
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full translate-y-12 -translate-x-12" />
                        
                        <div className="relative z-10">
                          {/* Prize Badge */}
                          <div className="flex justify-center mb-8">
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                              className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${getPrizeColor(currentSlide)} rounded-full shadow-lg`}
                            >
                              {getPrizeIcon(currentSlide)}
                              <span className="text-white font-bold text-lg sm:text-xl">
                                {getPrizeTitle(currentSlide)}
                              </span>
                            </motion.div>
                          </div>

                          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                            {/* Winner Image */}
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="relative w-full max-w-2xl mx-auto"
                            >
                              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/20 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
                                <Image
                                  src={formattedWinners[currentSlide].teamImage}
                                  alt={formattedWinners[currentSlide].teamName}
                                  fill
                                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                  sizes="(max-width: 768px) 90vw, 50vw"
                                  priority
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                                
                                {/* Position badge */}
                                {/* <div className="absolute top-4 right-4 z-10"> */}
                                  {/* <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${currentSlide === 0 ? 'bg-yellow-500/90' : currentSlide === 1 ? 'bg-gray-300/90' : 'bg-amber-700/90'} text-white font-bold`}>
                                    {getPrizeIcon(currentSlide, 'w-5 h-5')}
                                    <span className="text-sm">{getPrizeTitle(currentSlide)}</span>
                                  </div>
                                </div> */}
                              </div>
                              
                              {/* Floating decoration */}
                              <div className="absolute -top-4 -right-4">
                                <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
                              </div>
                              <div className="absolute -bottom-2 -left-2">
                                <Sparkles className="w-6 h-6 text-purple-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
                              </div>
                            </motion.div>

                            {/* Winner Details */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              className="flex-1 text-center lg:text-left"
                            >
                              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                {formattedWinners[currentSlide].teamName}
                              </h3>
                              
                              <p className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-6 max-w-2xl">
                                {formattedWinners[currentSlide].projectDescription}
                              </p>
                              
                              {formattedWinners[currentSlide].prize && (
                                <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/20">
                                  <Gift className="w-5 h-5 text-blue-400" />
                                  <span className="font-semibold text-blue-400">Prize: </span>
                                  <span className="text-gray-200 font-medium">{formattedWinners[currentSlide].prize}</span>
                                </div>
                              )}
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Navigation Controls */}
              {winners.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1, x: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full p-3 shadow-lg transition-all duration-300 border border-white/20"
                    aria-label="Previous winner"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, x: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full p-3 shadow-lg transition-all duration-300 border border-white/20"
                    aria-label="Next winner"
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                  
                  {/* Slide Indicators */}
                  <div className="flex justify-center mt-8 gap-3">
                    {winners.map((_, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-3 rounded-full transition-all duration-300 ${
                          currentSlide === index 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 w-12 shadow-lg' 
                            : 'bg-white/30 hover:bg-white/50 w-3'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* All Winners Grid (for multiple winners) */}
            {winners.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-16"
              >
                <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center">All Winners</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formattedWinners.map((winner, index) => (
                    <motion.div
                      key={winner._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
                      onClick={() => setCurrentSlide(index)}
                    >
                      <div className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-white/40 transition-all duration-300">
                          <Image
                            src={winner.teamImage}
                            alt={winner.teamName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mb-2">
                          {getPrizeIcon(index)}
                          <span className={`text-sm font-medium bg-gradient-to-r ${getPrizeColor(index)} bg-clip-text text-transparent`}>
                            {getPrizeTitle(index)}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-lg mb-2 group-hover:text-blue-300 transition-colors duration-300">
                          {winner.teamName}
                        </h4>
                        
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {winner.projectDescription}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Celebration Footer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center bg-gradient-to-r from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/10"
            >
              <div className="flex justify-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  >
                    <Star className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Congratulations to all the winners! 🎉
              </h3>
              
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
                Thank you to everyone who participated in <span className="font-semibold text-white">{event.title}</span>. 
                Your innovation, creativity, and dedication have made this event truly spectacular!
              </p>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default WinnersPage;
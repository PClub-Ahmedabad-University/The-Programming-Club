"use client";
import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const calculateTimeLeft = () => {
    const [datePart, timePart] = targetDate.split('T');
    const dateObj = new Date(datePart);
    
    if (timePart) {
      const [hours, minutes] = timePart.split(':').map(Number);
      dateObj.setHours(hours, minutes, 0, 0);
    }
    
    const target = dateObj;
    const now = new Date();
    const difference = target - now;
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        min: Math.floor((difference / 1000 / 60) % 60),
        sec: Math.floor((difference / 1000) % 60),
      };
    }

    return { timeLeft, hasEnded: difference <= 0 };
  };

  const [{ timeLeft, hasEnded }, setTimeState] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeState(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (hasEnded) {
    return <p className="text-sm md:text-base text-gray-400 text-center">Event has started or passed!</p>;
  }

  return (
    <div className="space-y-3 sm:space-y-4 bg-black/50 rounded-xl p-4 sm:p-5 border border-gray-800 backdrop-blur-md w-full">
      <h3 className="text-sm sm:text-base text-gray-300 font-semibold uppercase tracking-wide text-center">
        Time Remaining
      </h3>
      <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 w-full max-w-md mx-auto">
        {["days", "hours", "min", "sec"].map((unit) => (
          <div
            key={unit}
            className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-2 sm:p-3 text-center"
          >
            <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-white">
              {String(timeLeft[unit] || 0).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-wider mt-1">
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

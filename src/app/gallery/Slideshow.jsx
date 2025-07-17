'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaTimes, FaChevronLeft, FaChevronRight, FaPause, FaPlay } from 'react-icons/fa';

const Slideshow = ({ images, currentIndex = 0, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const nextImage = useCallback(() => {
    setImageLoaded(false);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images]);

  const prevImage = useCallback(() => {
    setImageLoaded(false);
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images]);

  // Auto-advance slideshow
  useEffect(() => {
    if (isPaused || !images || images.length <= 1) return;

    const timer = setInterval(() => {
      nextImage();
    }, 4000);

    return () => clearInterval(timer);
  }, [currentImageIndex, isPaused, nextImage, images]);

  // Keyboard navigation and cleanup
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextImage, prevImage]);

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-200 ${
      isClosing ? 'opacity-0' : 'opacity-100'
    }`}>
      <button
        onClick={handleClose}
        className="absolute right-6 top-6 z-50 text-white/80 hover:text-white transition-colors"
        aria-label="Close slideshow"
      >
        <FaTimes size={24} />
      </button>

      <div className="relative w-full h-full flex items-center">
        <button
          onClick={prevImage}
          className="absolute left-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Previous image"
        >
          <FaChevronLeft size={24} />
        </button>

        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full flex flex-col items-center">
              <div className={`relative w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <Image
                  src={images[currentImageIndex].url}
                  alt={images[currentImageIndex].title || `Gallery image ${currentImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="object-contain p-4"
                  priority
                  quality={90}
                  draggable={false}
                  onLoadingComplete={() => setImageLoaded(true)}
                />
                {images[currentImageIndex].title && (
                  <div className="absolute bottom-4 right-8 text-center transition-opacity duration-300">
                    <div className="inline-block bg-black/70 text-white px-4 py-2 rounded-lg text-md md:text-xl">
                      {images[currentImageIndex].title}
                    </div>
                  </div>
                )}
              </div>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse bg-gray-800/50 w-32 h-8 rounded"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={nextImage}
          className="absolute right-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Next image"
        >
          <FaChevronRight size={24} />
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={togglePause}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
        >
          {isPaused ? <FaPlay size={16} /> : <FaPause size={16} />}
        </button>
        <span className="text-white/80 text-sm">
          {currentImageIndex + 1} / {images.length}
        </span>
      </div>
    </div>
  );
};

export default Slideshow;
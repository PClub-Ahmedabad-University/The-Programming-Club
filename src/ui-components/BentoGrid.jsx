"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// Fullscreen Modal Component
const FullscreenModal = ({ 
  isOpen, 
  onClose, 
  item 
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/80 backdrop-blur-md",
        "transition-all duration-300 ease-out",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-6xl max-h-[90vh] overflow-auto",
          "bg-white dark:bg-black rounded-2xl",
          "border border-neutral-200 dark:border-white/[0.2]",
          "shadow-2xl transition-all duration-300 ease-out",
          "transform",
          isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 z-10",
            "w-10 h-10 rounded-full",
            "bg-white/90 dark:bg-black/90",
            "border border-neutral-200 dark:border-white/[0.2]",
            "flex items-center justify-center",
            "transition-all duration-200 ease-out",
            "hover:scale-110 hover:bg-red-50 hover:border-red-200",
            "dark:hover:bg-red-950 dark:hover:border-red-800",
            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
            "group"
          )}
          aria-label="Close modal"
        >
          <X 
            className={cn(
              "w-5 h-5 transition-colors duration-200",
              "text-neutral-600 dark:text-neutral-400",
              "group-hover:text-red-600 dark:group-hover:text-red-400"
            )} 
          />
        </button>

        {/* Modal Content */}
        <div className="p-8">
          {/* Image Section */}
          {item.image && (
            <div className="relative w-full h-[60vh] mb-6 rounded-xl overflow-hidden">
              <Image 
                src={item.image} 
                alt={item.title || 'Fullscreen image'}
                fill
                sizes="(max-width: 90vh) 100vw, 80vh"
                className="object-contain"
                priority
              />
            </div>
          )}

          {/* Header Section */}
          {item.header && (
            <div className="mb-6">
              {item.header}
            </div>
          )}

          {/* Title and Description */}
          <div className="space-y-4">
            {item.title && (
              <h2 
                id="modal-title"
                className={cn(
                  "text-3xl md:text-4xl font-bold",
                  "text-neutral-800 dark:text-neutral-100",
                  "leading-tight"
                )}
              >
                {item.title}
              </h2>
            )}
            
            {item.description && (
              <p className={cn(
                "text-lg leading-relaxed",
                "text-neutral-600 dark:text-neutral-300",
                "max-w-3xl"
              )}>
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const BentoGrid = ({
  className,
  children
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className
      )}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  image
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const handleItemClick = () => {
    setSelectedItem({
      title,
      description,
      header,
      image
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <div
        ref={ref}
        onClick={handleItemClick}
        className={cn(
          "group/bento shadow-input row-span-1 flex flex-col justify-between space-y-1 rounded-xl border border-neutral-200 bg-white p-4 transition duration-400 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none",
          "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
          className,
          isVisible ? "animate-fade-in" : "opacity-0"
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleItemClick();
          }
        }}
        aria-label={`Open ${title || 'item'} in fullscreen`}
      >
        {image && (
          <div className="relative w-full h-72 md:h-full">
            <Image 
              src={image} 
              alt={title || 'Gallery image'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain rounded-t-xl w-full h-full"
              loading="lazy"
              priority={false}
            />
          </div>
        )}
        {header}
        <div className="transition duration-200 group-hover/bento:translate-x-2">
          <div
            className="mt-2 mb-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
            {title}
          </div>
          <div
            className="font-sans text-xs font-normal text-neutral-600 dark:text-neutral-300">
            {description}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
      />
    </>
  );
};
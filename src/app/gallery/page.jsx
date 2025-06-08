"use client";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/ui-components/BentoGrid";

export default function BentoGridSecondDemo() {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery/get");
        const data = await res.json();
        // Flatten all images from all events
        let images = [];
        if (Array.isArray(data.data)) {
          data.data.forEach(event => {
            event.imageUrls.forEach(url => {
              images.push({
                title: event.eventName,
                imageLink: url,
              });
            });
          });
        }
        setItems(images);
      } catch (err) {
        setItems([]);
      }
    }
    fetchGallery();
  }, []);
  return (
    <div className="bg-gray-950 pt-14 pb-10" >
      <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-wider relative inline-block mb-4">
            <span className="text-white relative z-10 border-3 border-blue-400 rounded-lg px-12 py-4">
              GALLERY
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl text-white italic font-bold tracking-wider text-center px-4 max-w-3xl mx-auto mb-4">
            Milestones in motion: the P-Club experience.
          </h2>
      </div>
      <BentoGrid className="max-w-8xl mx-5 md:auto-rows-[20rem] pt-10">
        {items.map((item, i) => {
          const className = i % 7 === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1";
          return (
            <BentoGridItem
              key={i}
              title={item.title}
              className={className}
              image={item.imageLink} />
          );
        })}
      </BentoGrid>
    </div>
  );
}
// const items = [
//   {
//     title: "The Future of Energy",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "Artificial Intelligence Era",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "Sustainable Architecture",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "The Future of Energy",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "Artificial Intelligence Era",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "Sustainable Architecture",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "The Future of Energy",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "Artificial Intelligence Era",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "Sustainable Architecture",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "The Future of Energy",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "The Future of Energy",
//     imageLink: "/tie-cat.jpeg"
//   },
//   {
//     title: "The Future of Energy",
//     imageLink: "/tie-cat.jpeg"
//   },
//
//];

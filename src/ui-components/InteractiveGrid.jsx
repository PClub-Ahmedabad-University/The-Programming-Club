"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * InteractiveGridPattern is a component that renders a grid pattern with interactive squares.
 *
 * @param {Object} props - Component props.
 * @param {number} [props.width=40] - The width of each square.
 * @param {number} [props.height=40] - The height of each square.
 * @param {[number, number]} [props.squares=[24, 24]] - Number of squares [horizontal, vertical].
 * @param {string} [props.className] - Additional class names for the SVG element.
 * @param {string} [props.squaresClassName] - Additional class names for each square.
 */
export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className,
  squaresClassName,
  ...props
}) {
  const [horizontal, vertical] = squares;
  const [hoveredSquare, setHoveredSquare] = useState(null);

  return (
    <svg
      width={width * horizontal}
      height={height * vertical}
      className={cn(
        "absolute inset-0 h-full w-full border border-gray-400/30",
        className
      )}
      {...props}
    >
      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width;
        const y = Math.floor(index / horizontal) * height;

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            className={cn(
              "stroke-gray-400/30 transition-all duration-100 ease-in-out [&:not(:hover)]:duration-1000",
              hoveredSquare === index ? "fill-gray-300/30" : "fill-transparent",
              squaresClassName
            )}
            onMouseEnter={() => setHoveredSquare(index)}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        );
      })}
    </svg>
  );
}

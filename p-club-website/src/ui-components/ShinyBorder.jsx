"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = "#000000",
  className,
  style,
  ...props
}) {
  const finalStyle = {
    "--border-width": `${borderWidth}px`,
    "--duration": `${duration}s`,
    backgroundImage: `linear-gradient(60deg, transparent 25%, ${
      Array.isArray(shineColor) ? shineColor.join(", ") : shineColor
    }, transparent 75%)`,
    backgroundSize: "300% 300%",
    mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
    WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    padding: "var(--border-width)",
    animation: `shine ${duration}s infinite linear`,
    ...style,
  };

  return (
    <div
      style={finalStyle}
      className={cn(
        "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] animate-shine",
        className
      )}
      {...props}
    />
  );
}

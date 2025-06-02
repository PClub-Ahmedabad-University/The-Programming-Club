"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll } from "framer-motion";
import React from "react";

export const ScrollProgress = ({ className, ...props }) => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-[#011c4a] via-[#0e277b] to-[#037d7f]",
        className
      )}
      style={{
        scaleX: scrollYProgress,
      }}
      {...props}
    />
  );
};

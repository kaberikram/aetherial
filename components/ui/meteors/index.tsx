"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const Meteors = ({
  number = 20,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([]);

  // Generate new meteor styles with highly staggered delays
  const generateMeteorStyles = () => {
    return [...new Array(number)].map(() => ({
      top: Math.floor(Math.random() * 100) + "%",
      left: Math.floor(Math.random() * 100) + "%",
      // Much more varied delays to create a continuous effect
      animationDelay: Math.random() * 10 + "s", 
      // Varied durations for more natural movement
      animationDuration: (Math.random() * 5 + 2) + "s",
      opacity: Math.max(0.2, Math.random()), // Varied opacity
      height: Math.max(0.5, Math.random() * 1) + "px", // Varied sizes
      width: Math.max(0.5, Math.random() * 1) + "px",
    }));
  };

  useEffect(() => {
    // Create a large initial batch of meteors with staggered animations
    setMeteorStyles(generateMeteorStyles());
    
    // No need for interval regeneration as we're using infinite animation
    // with highly staggered delays
  }, [number]);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      {meteorStyles.map((style, idx) => (
        <span
          key={`meteor-${idx}`}
          className="absolute top-0 left-0 bg-white rounded-[100%] shadow-[0_0_0_1px_#ffffff10] rotate-[215deg] animate-meteor"
          style={{
            ...style,
            transform: "rotate(215deg)",
          }}
        >
          <span 
            className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-[#ffffff20] to-transparent" 
            style={{
              width: parseInt(style.width as string) * 50 + "px"
            }}
          />
        </span>
      ))}
    </div>
  );
}; 
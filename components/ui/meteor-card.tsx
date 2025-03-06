"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Meteors } from "./meteors";
import { SmileIcon, FrownIcon, SearchIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { Emotion } from "@/components/dream-card";

interface MeteorCardProps {
  title: string;
  date: string;
  emotion: Emotion;
  excerpt: string;
  location?: string;
  people?: string;
  className?: string;
}

export function MeteorCard({ 
  title, 
  date, 
  emotion, 
  excerpt, 
  location, 
  people,
  className 
}: MeteorCardProps) {
  const getEmotionIcon = (emotion: Emotion) => {
    switch (emotion) {
      case "happy":
      case "excited":
        return <SmileIcon className="h-5 w-5 text-white" />;
      case "scared":
      case "anxious":
        return <FrownIcon className="h-5 w-5 text-white" />;
      case "confused":
      case "peaceful":
        return <SearchIcon className="h-5 w-5 text-white" />;
      default:
        return <SmileIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get a background gradient based on emotion
  const getEmotionGradient = (emotion: Emotion) => {
    // Using only grayscale gradients with subtle variations in opacity
    switch (emotion) {
      case "happy":
        return "from-zinc-800/30 to-zinc-900/20";
      case "excited":
        return "from-zinc-800/40 to-zinc-900/25";
      case "scared":
        return "from-zinc-800/35 to-zinc-900/20";
      case "anxious":
        return "from-zinc-800/30 to-zinc-900/15";
      case "confused":
        return "from-zinc-800/25 to-zinc-900/15";
      case "peaceful":
        return "from-zinc-800/20 to-zinc-900/10";
      default:
        return "from-zinc-800/30 to-zinc-900/20";
    }
  };

  return (
    <div
      className={cn(
        "h-full w-full rounded-lg bg-gradient-to-br border border-zinc-800/50 p-5 relative overflow-hidden",
        getEmotionGradient(emotion),
        "transition-all duration-300 hover:border-zinc-700/70 hover:shadow-lg hover:shadow-black/30",
        "flex flex-col",
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-medium">{title}</h3>
        <span className="text-xs text-zinc-400">{date}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          {getEmotionIcon(emotion)}
          <span className="text-sm capitalize">{emotion}</span>
        </div>
        
        {location && (
          <div className="flex items-center gap-1">
            <MapPinIcon className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-300">{location}</span>
          </div>
        )}
        
        {people && (
          <div className="flex items-center gap-1">
            <UsersIcon className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-300">{people}</span>
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-zinc-300 line-clamp-3 flex-grow">{excerpt}</p>
      
      <div className="mt-4 text-xs text-zinc-500 flex justify-end">
        <span>Tap to view details</span>
      </div>

      {/* Meteor effect */}
      <Meteors number={20} className="z-0" />
    </div>
  );
} 
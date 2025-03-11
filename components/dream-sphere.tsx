import { DREAM_LEVELS, type LevelInfo } from "./dream-level-profile"

interface DreamSphereProps {
  dreamCount: number
  size?: "sm" | "md" | "lg"
  showGlow?: boolean
}

// Get the actual color value for the aura
const getAuraColorValue = (level: LevelInfo) => {
  switch(level.auraColor) {
    case 'red': return 'rgb(239, 68, 68)';
    case 'orange': return 'rgb(249, 115, 22)';
    case 'white': return 'rgb(255, 255, 255)';
    case 'green': return 'rgb(34, 197, 94)';
    case 'blue': return 'rgb(59, 130, 246)';
    case 'indigo': return 'rgb(99, 102, 241)';
    case 'purple': return 'rgb(168, 85, 247)';
    case 'gold': return 'rgb(255, 215, 0)';
    default: return 'rgb(59, 130, 246)';
  }
}

// Calculate level based on dream count
const calculateLevel = (count: number) => {
  return DREAM_LEVELS.find(
    level => count >= level.minEntries && count <= level.maxEntries
  ) || DREAM_LEVELS[0]
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12"
}

export function DreamSphere({ dreamCount, size = "md", showGlow = true }: DreamSphereProps) {
  const level = calculateLevel(dreamCount)
  const auraColor = getAuraColorValue(level)
  
  return (
    <div 
      className={`rounded-full ${sizeClasses[size]} ${showGlow ? 'animate-glow' : ''}`}
      style={{
        backgroundColor: auraColor,
        boxShadow: showGlow ? `0 0 8px ${auraColor}, 0 0 12px ${auraColor}30` : 'none'
      }}
    />
  )
} 
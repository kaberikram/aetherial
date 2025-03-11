"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { getDreams } from "@/utils/supabase/dreams"

interface DreamLevelProfileProps {
  language: 'en' | 'ms'
  dreamCount?: number
  onLevelChange?: (levelTitle: string) => void
}

// Define level thresholds and titles
export interface LevelInfo {
  title: string
  minEntries: number
  maxEntries: number
  auraColor: string
  auraGradient: string
}

export const DREAM_LEVELS: LevelInfo[] = [
  {
    title: "Dreamwalker",
    minEntries: 1,
    maxEntries: 10,
    auraColor: "red",
    auraGradient: "from-red-500/20 via-red-500/10 to-transparent"
  },
  {
    title: "Dream Explorer",
    minEntries: 11,
    maxEntries: 25,
    auraColor: "orange",
    auraGradient: "from-orange-500/20 via-orange-500/10 to-transparent"
  },
  {
    title: "Dream Voyager",
    minEntries: 26,
    maxEntries: 50,
    auraColor: "white",
    auraGradient: "from-white/20 via-white/10 to-transparent"
  },
  {
    title: "Dream Navigator",
    minEntries: 51,
    maxEntries: 100,
    auraColor: "green",
    auraGradient: "from-green-500/20 via-green-500/10 to-transparent"
  },
  {
    title: "Dream Guardian",
    minEntries: 101,
    maxEntries: 200,
    auraColor: "blue",
    auraGradient: "from-blue-500/20 via-blue-500/10 to-transparent"
  },
  {
    title: "Dream Sage",
    minEntries: 201,
    maxEntries: 365,
    auraColor: "indigo",
    auraGradient: "from-indigo-500/20 via-indigo-500/10 to-transparent"
  },
  {
    title: "Dream Oracle",
    minEntries: 366,
    maxEntries: 499,
    auraColor: "purple",
    auraGradient: "from-purple-500/20 via-purple-500/10 to-transparent"
  },
  {
    title: "Ascended Dreamer",
    minEntries: 500,
    maxEntries: Infinity,
    auraColor: "gold",
    auraGradient: "from-yellow-400/40 via-amber-300/30 to-transparent"
  }
]

export function DreamLevelProfile({ language, dreamCount: propDreamCount, onLevelChange }: DreamLevelProfileProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dreamCount, setDreamCount] = useState(propDreamCount || 0)
  const [currentLevel, setCurrentLevel] = useState<LevelInfo>(DREAM_LEVELS[0])
  const [progress, setProgress] = useState(0)
  
  const translations = {
    en: {
      profile: "Dream Level",
      level: "Level",
      dreams: "Dreams",
      progress: "Progress",
      guest: "Guest",
      entriesNeeded: "needed"
    },
    ms: {
      profile: "Tahap Mimpi",
      level: "Tahap",
      dreams: "Mimpi",
      progress: "Kemajuan",
      guest: "Tetamu",
      entriesNeeded: "diperlukan"
    }
  }

  // Calculate level based on dream count
  const calculateLevel = (count: number) => {
    // Special case for 0 entries
    if (count === 0) {
      return { level: DREAM_LEVELS[0], progress: 0 }
    }

    // Find the current level based on entry count
    const level = DREAM_LEVELS.find(
      level => count >= level.minEntries && count <= level.maxEntries
    ) || DREAM_LEVELS[0]
    
    // Calculate progress to next level
    let progressPercentage = 0
    
    if (level !== DREAM_LEVELS[DREAM_LEVELS.length - 1]) {
      const nextLevel = DREAM_LEVELS[DREAM_LEVELS.indexOf(level) + 1]
      const entriesInCurrentLevel = count - level.minEntries
      const totalEntriesNeeded = nextLevel.minEntries - level.minEntries
      progressPercentage = (entriesInCurrentLevel / totalEntriesNeeded) * 100
    } else {
      // For max level, show 100% progress
      progressPercentage = 100
    }
    
    return { level, progress: Math.min(progressPercentage, 100) }
  }

  // Get entries needed for next level
  const getEntriesForNextLevel = () => {
    if (currentLevel === DREAM_LEVELS[DREAM_LEVELS.length - 1]) {
      return 0 // Already at max level
    }
    
    const nextLevel = DREAM_LEVELS[DREAM_LEVELS.indexOf(currentLevel) + 1]
    return nextLevel.minEntries - dreamCount
  }

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("Error fetching user:", error.message)
          return
        }
        
        setUser(user)
        
        // If dream count wasn't provided as a prop, fetch dreams from Supabase
        if (!propDreamCount) {
          const fetchedDreams = await getDreams()
          const count = fetchedDreams.length
          
          // Calculate new level based on count
          const { level, progress } = calculateLevel(count)
          
          // Update state
          setDreamCount(count)
          setCurrentLevel(level)
          setProgress(progress)
          
          // Notify parent component about level change
          if (onLevelChange) {
            onLevelChange(level.title)
          }
        } else {
          const { level, progress } = calculateLevel(propDreamCount)
          setCurrentLevel(level)
          setProgress(progress)
          
          // Notify parent component about level change
          if (onLevelChange) {
            onLevelChange(level.title)
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserData()
  }, [propDreamCount, onLevelChange])

  // Calculate the stroke dash offset for the circular progress
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Get the actual color value for the aura
  const getAuraColorValue = () => {
    switch(currentLevel.auraColor) {
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

  return (
    <div className="relative">
      <div className={`relative rounded-lg overflow-hidden bg-gray-900/80 border border-gray-800 p-3`}>
        {/* Aura background effect */}
        <div className={`absolute inset-0 bg-gradient-radial ${currentLevel.auraGradient} opacity-40`}></div>
        
        <div className="relative z-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-medium text-white">{translations[language].profile}</h2>
              <div className={`text-${currentLevel.auraColor}-400 text-sm font-medium`}>{currentLevel.title}</div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-gray-400 text-xs">{translations[language].dreams}</div>
              <div className="text-lg font-bold text-white">{dreamCount}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Circular progress indicator with sphere */}
            <div className="relative">
              {/* SVG for circular progress */}
              <svg width="70" height="70" viewBox="0 0 70 70" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="35"
                  cy="35"
                  r={radius}
                  fill="transparent"
                  stroke="#374151"
                  strokeWidth="4"
                />
                {/* Progress circle */}
                <circle
                  cx="35"
                  cy="35"
                  r={radius}
                  fill="transparent"
                  stroke={getAuraColorValue()}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              
              {/* Colored sphere in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-10 h-10 rounded-full animate-glow"
                  style={{
                    backgroundColor: getAuraColorValue(),
                    boxShadow: `0 0 8px ${getAuraColorValue()}, 0 0 12px ${getAuraColorValue()}30`
                  }}
                />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{translations[language].progress}</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              
              {currentLevel !== DREAM_LEVELS[DREAM_LEVELS.length - 1] && (
                <div className="text-xs text-gray-400">
                  {getEntriesForNextLevel()} {translations[language].entriesNeeded}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
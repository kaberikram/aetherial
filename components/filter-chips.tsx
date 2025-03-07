"use client"

import { useState, useEffect } from "react"
import { SmileIcon, FrownIcon, SearchIcon } from "lucide-react"
import { Emotion } from "./dream-card"

interface FilterChipsProps {
  activeFilters: string[]
  setActiveFilters: (filters: string[]) => void
  selectedEmotion: string | null
  setSelectedEmotion: (emotion: string | null) => void
  filterLabel?: string
  emotions: string[]
}

// Mapping between Bahasa Melayu and English emotions
const emotionMapping = {
  // Bahasa Melayu to English
  "gembira": "happy",
  "teruja": "excited",
  "takut": "scared",
  "cemas": "anxious",
  "keliru": "confused",
  "tenang": "peaceful",
  // English to English (for consistency)
  "happy": "happy",
  "excited": "excited",
  "scared": "scared",
  "anxious": "anxious",
  "confused": "confused",
  "peaceful": "peaceful"
} as const

export function FilterChips({
  activeFilters,
  setActiveFilters,
  selectedEmotion,
  setSelectedEmotion,
  filterLabel = "Filter by Emotion",
  emotions = ["Happy", "Excited", "Scared", "Anxious", "Confused", "Peaceful"]
}: FilterChipsProps) {
  const [showEmotions, setShowEmotions] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')

  useEffect(() => {
    // Initial load
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }

    // Set up storage event listener for changes from other windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language') {
        setLanguage(e.newValue as 'en' | 'ms')
      }
    }

    // Set up event listener for changes in the same window
    const handleLanguageChange = (e: StorageEvent) => {
      if (e.key === 'language') {
        setLanguage(e.newValue as 'en' | 'ms')
      }
    }

    // Add event listeners
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('storage-local', handleLanguageChange as any)

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('storage-local', handleLanguageChange as any)
    }
  }, [])

  const toggleEmotionFilter = () => {
    setShowEmotions(!showEmotions)
    if (selectedEmotion) {
      setSelectedEmotion(null)
    }
  }

  const getEmotionIcon = (emotion: string) => {
    const lowerEmotion = emotion.toLowerCase()
    switch (lowerEmotion) {
      case "happy":
      case "gembira":
      case "excited":
      case "teruja":
        return <SmileIcon className="h-4 w-4" />
      case "scared":
      case "takut":
      case "anxious":
      case "cemas":
        return <FrownIcon className="h-4 w-4" />
      case "confused":
      case "keliru":
      case "peaceful":
      case "tenang":
        return <SearchIcon className="h-4 w-4" />
      default:
        return <SmileIcon className="h-4 w-4" />
    }
  }

  const handleEmotionSelect = (emotion: string) => {
    const lowerEmotion = emotion.toLowerCase()
    if (selectedEmotion === emotionMapping[lowerEmotion as keyof typeof emotionMapping]) {
      setSelectedEmotion(null)
    } else {
      // Convert Bahasa Melayu emotion to English before setting
      const englishEmotion = emotionMapping[lowerEmotion as keyof typeof emotionMapping] || lowerEmotion
      setSelectedEmotion(englishEmotion)
    }
  }

  // Get the display emotion in the current language
  const getDisplayEmotion = () => {
    if (!selectedEmotion) return null
    
    // If language is English, just capitalize the selected emotion
    if (language === 'en') {
      return selectedEmotion.charAt(0).toUpperCase() + selectedEmotion.slice(1)
    }
    
    // If language is Bahasa Melayu, find the corresponding emotion
    const emotionEntries = Object.entries(emotionMapping)
    const matchingEntry = emotionEntries.find(([key, value]) => 
      value === selectedEmotion && key !== value // Find Bahasa Melayu key that maps to this English emotion
    )
    
    if (matchingEntry) {
      return matchingEntry[0].charAt(0).toUpperCase() + matchingEntry[0].slice(1)
    }
    
    // Fallback
    return selectedEmotion.charAt(0).toUpperCase() + selectedEmotion.slice(1)
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={toggleEmotionFilter}
          className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${
            selectedEmotion
              ? "bg-white text-black"
              : "bg-zinc-900/70 text-zinc-300 border border-zinc-800"
          }`}
        >
          <SmileIcon className="h-4 w-4" />
          {selectedEmotion ? `${filterLabel}: ${getDisplayEmotion()}` : filterLabel}
        </button>
      </div>

      {showEmotions && (
        <div className="flex flex-wrap gap-2 mt-2 pl-1">
          {emotions.map((emotion) => (
            <button
              key={emotion}
              onClick={() => handleEmotionSelect(emotion)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap flex items-center gap-1 ${
                selectedEmotion === emotionMapping[emotion.toLowerCase() as keyof typeof emotionMapping]
                  ? "bg-white text-black"
                  : "bg-zinc-900/50 text-zinc-300 border border-zinc-800"
              }`}
            >
              {getEmotionIcon(emotion)}
              <span className="capitalize">{emotion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


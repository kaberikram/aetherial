import { useState } from "react"
import { SmileIcon, FrownIcon, SearchIcon } from "lucide-react"
import { Emotion } from "./dream-card"

interface FilterChipsProps {
  activeFilters: string[]
  setActiveFilters: (filters: string[]) => void
  selectedEmotion: string | null
  setSelectedEmotion: (emotion: string | null) => void
}

export function FilterChips({ 
  activeFilters, 
  setActiveFilters, 
  selectedEmotion, 
  setSelectedEmotion 
}: FilterChipsProps) {
  const emotions: Emotion[] = ["happy", "excited", "scared", "anxious", "confused", "peaceful"]
  
  const [showEmotions, setShowEmotions] = useState(false)

  const toggleEmotionFilter = () => {
    setShowEmotions(!showEmotions)
    if (selectedEmotion) {
      setSelectedEmotion(null)
    }
  }

  const selectEmotion = (emotion: string) => {
    if (selectedEmotion === emotion) {
      setSelectedEmotion(null)
    } else {
      setSelectedEmotion(emotion)
    }
  }

  const getEmotionIcon = (emotion: Emotion) => {
    switch (emotion) {
      case "happy":
      case "excited":
        return <SmileIcon className="h-4 w-4" />
      case "scared":
      case "anxious":
        return <FrownIcon className="h-4 w-4" />
      case "confused":
      case "peaceful":
        return <SearchIcon className="h-4 w-4" />
      default:
        return <SmileIcon className="h-4 w-4" />
    }
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
          {selectedEmotion ? `Emotion: ${selectedEmotion}` : "Filter by Emotion"}
        </button>
      </div>

      {showEmotions && (
        <div className="flex flex-wrap gap-2 mt-2 pl-1">
          {emotions.map((emotion) => (
            <button
              key={emotion}
              onClick={() => selectEmotion(emotion)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap flex items-center gap-1 ${
                selectedEmotion === emotion
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


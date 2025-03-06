import Link from "next/link"
import { DreamCard } from "./dream-card"
import { MeteorCard } from "./ui/meteor-card"

interface DreamEntry {
  id: string
  title: string
  date: string
  location: string
  emotion: string
  summary: string
  people?: string
}

interface SearchResultsProps {
  dreams: DreamEntry[]
  searchTerm: string
  activeFilters: string[]
  selectedEmotion: string | null
}

// Helper function to map any emotion string to a valid Emotion type
const mapToValidEmotion = (emotion: string): "happy" | "scared" | "confused" | "peaceful" | "anxious" | "excited" => {
  const validEmotions = ["happy", "scared", "confused", "peaceful", "anxious", "excited"];
  const lowerEmotion = emotion.toLowerCase();
  
  if (validEmotions.includes(lowerEmotion)) {
    return lowerEmotion as "happy" | "scared" | "confused" | "peaceful" | "anxious" | "excited";
  }
  
  // Default fallback
  return "confused";
}

export function SearchResults({ dreams, searchTerm, activeFilters, selectedEmotion }: SearchResultsProps) {
  const filteredDreams = dreams.filter((dream) => {
    // First, filter by emotion if selected
    if (selectedEmotion && !dream.emotion.toLowerCase().includes(selectedEmotion.toLowerCase())) {
      return false;
    }

    // If no search term, just show all dreams (or filtered by emotion above)
    if (!searchTerm) {
      return true;
    }

    // With search term, check all relevant fields
    return dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           dream.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
           dream.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
           new Date(dream.date).toLocaleDateString().includes(searchTerm) ||
           (dream.people && dream.people.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <>
      {filteredDreams.length > 0 ? (
        filteredDreams.map((dream) => (
          <div key={dream.id} className="h-full w-full">
            <Link href={`/dream/${dream.id}`} className="block h-full w-full">
              <MeteorCard
                title={dream.title}
                date={new Date(dream.date).toLocaleDateString()}
                emotion={mapToValidEmotion(dream.emotion)}
                excerpt={dream.summary}
                location={dream.location}
                people={dream.people}
              />
            </Link>
          </div>
        ))
      ) : (
        <div className="col-span-full">
          <p className="text-zinc-400">No dreams match your search criteria.</p>
        </div>
      )}
    </>
  )
}


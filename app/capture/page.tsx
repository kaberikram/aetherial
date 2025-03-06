"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit2Icon, Sparkles, Save } from "lucide-react"
import Link from "next/link"
import { GradientButton } from "@/components/ui/gradient-button"
import { BottomNav } from "@/components/bottom-nav"

interface DreamEntry {
  id: string
  title: string
  date: string
  location: string
  people: string
  timeOfDay: "Morning" | "Afternoon" | "Night" | "Unknown"
  activity: string
  unusualEvents: {
    occurred: boolean
    description: string
  }
  symbols: string
  emotion: "Happy" | "Scared" | "Confused" | "Peaceful" | "Anxious" | "Excited"
  ending: string
  finalMoments: string
  summary: string
}

export default function DreamCapture() {
  const router = useRouter()
  const [dream, setDream] = useState<DreamEntry>({
    id: "",
    title: `Dream ${new Date().toLocaleDateString()}`,
    date: new Date().toISOString(),
    location: "",
    people: "",
    timeOfDay: "Unknown",
    activity: "",
    unusualEvents: {
      occurred: false,
      description: "",
    },
    symbols: "",
    emotion: "Happy",
    ending: "",
    finalMoments: "",
    summary: "",
  })

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Generate a unique ID for the dream when the component mounts
    setDream((prev) => ({ ...prev, id: `dream_${Date.now()}` }))
  }, [])

  // Apply capture-page class to document body and html
  useEffect(() => {
    // Add the class to hide scrollbars
    document.body.classList.add('capture-page');
    document.documentElement.classList.add('capture-page');
    
    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('capture-page');
      document.documentElement.classList.remove('capture-page');
    };
  }, []);

  const handleSave = () => {
    const dreamToSave = {
      id: dream.id,
      title: dream.title,
      date: dream.date,
      location: dream.location,
      emotion: dream.emotion,
      summary: dream.summary || generateSummary(),
    }
    const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
    dreams.push(dreamToSave)
    localStorage.setItem("dreams", JSON.stringify(dreams))
    router.push("/")
  }

  const handleSaveAndVisualize = () => {
    const dreamToSave = {
      id: dream.id,
      title: dream.title,
      date: dream.date,
      location: dream.location,
      emotion: dream.emotion,
      summary: dream.summary || generateSummary(),
    }
    const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
    dreams.push(dreamToSave)
    localStorage.setItem("dreams", JSON.stringify(dreams))
    router.push(`/dream/${dream.id}`)
  }

  const generateSummary = () => {
    return `I was at ${dream.location} with ${dream.people || "no one"}. It was ${dream.timeOfDay.toLowerCase()} and ${dream.activity}. ${
      dream.unusualEvents.occurred ? `Something unusual happened: ${dream.unusualEvents.description}.` : ""
    } ${dream.symbols ? `I saw symbols like ${dream.symbols}.` : ""} I felt ${dream.emotion.toLowerCase()}. The dream ${dream.ending.toLowerCase()}.`
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 capture-page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold">New Dream Entry</h1>
          <div className="w-10"></div> {/* Empty div for spacing */}
        </div>
      </header>

      {/* Main Form */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Dream Title</label>
          <input
            type="text"
            value={dream.title}
            onChange={(e) => setDream({ ...dream, title: e.target.value })}
            placeholder="Enter a title for your dream..."
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Where were you?</label>
          <input
            type="text"
            value={dream.location}
            onChange={(e) => setDream({ ...dream, location: e.target.value })}
            placeholder="Beach, childhood home, strange building..."
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500"
          />
        </div>

        {/* People */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Who was there?</label>
          <input
            type="text"
            value={dream.people}
            onChange={(e) => setDream({ ...dream, people: e.target.value })}
            placeholder="Friends, family, strangers, no one..."
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500"
          />
        </div>

        {/* Time of Day */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Time of day</label>
          <div className="grid grid-cols-4 gap-2">
            {["Morning", "Afternoon", "Night", "Unknown"].map((time) => (
              <button
                key={time}
                onClick={() => setDream({ ...dream, timeOfDay: time as DreamEntry["timeOfDay"] })}
                className={`p-2 rounded-lg text-sm ${
                  dream.timeOfDay === time ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">What were you doing?</label>
          <textarea
            value={dream.activity}
            onChange={(e) => setDream({ ...dream, activity: e.target.value })}
            placeholder="I was running, flying, talking to..."
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500 min-h-[100px]"
          />
        </div>

        {/* Unusual Events */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Did anything unusual happen?</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDream({ ...dream, unusualEvents: { ...dream.unusualEvents, occurred: true } })}
              className={`p-2 rounded-lg ${
                dream.unusualEvents.occurred ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setDream({ ...dream, unusualEvents: { occurred: false, description: "" } })}
              className={`p-2 rounded-lg ${
                !dream.unusualEvents.occurred ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
              }`}
            >
              No
            </button>
          </div>
          {dream.unusualEvents.occurred && (
            <textarea
              value={dream.unusualEvents.description}
              onChange={(e) =>
                setDream({
                  ...dream,
                  unusualEvents: { ...dream.unusualEvents, description: e.target.value },
                })
              }
              placeholder="Describe what happened..."
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500 mt-2"
            />
          )}
        </div>

        {/* Symbols */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Did you see any symbols?</label>
          <input
            type="text"
            value={dream.symbols}
            onChange={(e) => setDream({ ...dream, symbols: e.target.value })}
            placeholder="A key, a door, an animal..."
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500"
          />
        </div>

        {/* Emotions */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">How did you feel?</label>
          <div className="grid grid-cols-3 gap-2">
            {["Happy", "Scared", "Confused", "Peaceful", "Anxious", "Excited"].map((emotion) => (
              <button
                key={emotion}
                onClick={() => setDream({ ...dream, emotion: emotion as DreamEntry["emotion"] })}
                className={`p-2 rounded-lg ${
                  dream.emotion === emotion ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        {/* Ending */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">How did the dream end?</label>
          <select
            value={dream.ending}
            onChange={(e) => setDream({ ...dream, ending: e.target.value })}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <option value="">Select an option</option>
            <option value="Abruptly">Abruptly</option>
            <option value="Slowly">Slowly</option>
            <option value="Woke Up Suddenly">Woke Up Suddenly</option>
            <option value="Faded Away">Faded Away</option>
          </select>
        </div>

        {/* Final Moments */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Last thing before waking up?</label>
          <input
            type="text"
            value={dream.finalMoments}
            onChange={(e) => setDream({ ...dream, finalMoments: e.target.value })}
            placeholder="A sound, a thought, a feeling..."
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500"
          />
        </div>

        {/* Dream Summary */}
        <div className="space-y-2 border-t border-zinc-800 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Dream Summary</h2>
            <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-lg hover:bg-zinc-900">
              <Edit2Icon className="h-5 w-5" />
            </button>
          </div>
          {isEditing ? (
            <textarea
              value={dream.summary || generateSummary()}
              onChange={(e) => setDream({ ...dream, summary: e.target.value })}
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 placeholder-zinc-500 min-h-[100px]"
            />
          ) : (
            <p className="text-zinc-400">{dream.summary || generateSummary()}</p>
          )}
        </div>

        {/* Save Buttons */}
        <div className="space-y-3 pt-4">
          <GradientButton 
            onClick={handleSave} 
            className="w-full py-3 flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            Save Dream
          </GradientButton>
          
          <GradientButton 
            onClick={handleSaveAndVisualize}
            className="w-full py-3 flex items-center justify-center gap-2 gradient-button-variant"
          >
            <Sparkles className="h-5 w-5" />
            Save & Visualize Dream
          </GradientButton>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}


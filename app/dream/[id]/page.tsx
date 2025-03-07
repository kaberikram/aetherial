"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DreamImageGenerator } from "@/components/dream-image-generator"
import { BottomNav } from "@/components/bottom-nav"

interface DreamEntry {
  id: string
  title: string
  date: string
  location: string
  emotion: string
  summary: string
}

const translations = {
  en: {
    loading: "Loading dream...",
    dreamDetails: "Dream Details",
    backToDreams: "Back to Dreams",
    dream: "Dream",
    emotion: "Emotion",
    dreamSummary: "Dream Summary",
    location: "Location",
    visualization: "Visualization",
    emotions: {
      happy: "Happy",
      scared: "Scared",
      confused: "Confused",
      peaceful: "Peaceful",
      anxious: "Anxious",
      excited: "Excited"
    }
  },
  ms: {
    loading: "Memuat mimpi...",
    dreamDetails: "Butiran Mimpi",
    backToDreams: "Kembali ke Mimpi",
    dream: "Mimpi",
    emotion: "Perasaan",
    dreamSummary: "Ringkasan Mimpi",
    location: "Lokasi",
    visualization: "Visualisasi",
    emotions: {
      happy: "Gembira",
      scared: "Takut",
      confused: "Keliru",
      peaceful: "Tenang",
      anxious: "Cemas",
      excited: "Teruja"
    }
  }
} as const;

export default function DreamDetail() {
  const params = useParams()
  const id = params.id as string
  const [dream, setDream] = useState<DreamEntry | null>(null)
  const [language, setLanguage] = useState<'en' | 'ms'>('en')
  const router = useRouter()

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

  useEffect(() => {
    const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
    const foundDream = dreams.find((d: DreamEntry) => d.id === id)
    if (foundDream) {
      setDream(foundDream)
    } else {
      router.push("/")
    }
  }, [id, router])

  if (!dream) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">{translations[language].loading}</div>
      </div>
    )
  }

  // Format date nicely
  const dreamDate = new Date(dream.date)
  const formattedDate = dreamDate.toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
  const formattedTime = dreamDate.toLocaleTimeString(language === 'ms' ? 'ms-MY' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Only show header on mobile */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3 md:hidden">
        <div className="flex items-center">
          <Link href="/home" className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold ml-2">{translations[language].dreamDetails}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        {/* Back button for desktop */}
        <div className="hidden md:block mb-6">
          <Link href="/home" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>{translations[language].backToDreams}</span>
          </Link>
        </div>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">{translations[language].dream} {formattedDate}</h2>
          <p className="text-zinc-400">{formattedDate}, {formattedTime}</p>
        </div>

        <div className="md:grid md:grid-cols-2 md:gap-12 md:items-start">
          <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800/50 mb-8 md:mb-0 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{translations[language].emotion}:</span>
              <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm capitalize">
                {translations[language].emotions[dream.emotion.toLowerCase() as keyof typeof translations['en']['emotions']]}
              </span>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">{translations[language].dreamSummary}</h3>
              <p className="text-lg leading-relaxed text-zinc-100">{dream.summary}</p>
            </div>
            
            {dream.location && (
              <div>
                <h3 className="text-xl font-semibold mb-2">{translations[language].location}</h3>
                <p className="text-lg text-zinc-300">{dream.location}</p>
              </div>
            )}
          </div>

          <div className="bg-zinc-900/30 rounded-lg border border-zinc-800/50 p-6 relative overflow-hidden">
            {/* Subtle background effects with animations */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse-slower"></div>
              
              {/* Animated ripple effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 rounded-full border border-white/5 animate-ripple"></div>
                <div className="w-96 h-96 rounded-full border border-white/5 animate-ripple-delay-1"></div>
                <div className="w-96 h-96 rounded-full border border-white/5 animate-ripple-delay-2"></div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4 relative z-10">{translations[language].visualization}</h3>
            <div className="relative z-10">
              <DreamImageGenerator summary={dream.summary} />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}


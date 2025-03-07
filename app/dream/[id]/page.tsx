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

export default function DreamDetail() {
  const params = useParams()
  const id = params.id as string
  
  const [dream, setDream] = useState<DreamEntry | null>(null)
  const router = useRouter()

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
        <div className="animate-pulse text-xl">Loading dream...</div>
      </div>
    )
  }

  // Format date nicely
  const dreamDate = new Date(dream.date)
  const formattedDate = dreamDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
  const formattedTime = dreamDate.toLocaleTimeString('en-US', {
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
          <h1 className="text-lg font-semibold ml-2">Dream Details</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        {/* Back button for desktop */}
        <div className="hidden md:block mb-6">
          <Link href="/home" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Dreams</span>
          </Link>
        </div>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">Dream {formattedDate}</h2>
          <p className="text-zinc-400">{formattedDate}, {formattedTime}</p>
        </div>

        <div className="md:grid md:grid-cols-2 md:gap-12 md:items-start">
          <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800/50 mb-8 md:mb-0 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">Emotion:</span>
              <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm capitalize">{dream.emotion}</span>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">Dream Summary</h3>
              <p className="text-lg leading-relaxed text-zinc-100">{dream.summary}</p>
            </div>
            
            {dream.location && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Location</h3>
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
            
            <h3 className="text-xl font-semibold mb-4 relative z-10">Visualization</h3>
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

